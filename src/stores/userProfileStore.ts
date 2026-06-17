import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, UserGoals, UserProfile } from '../types';
import { getXpForLevel, getXpToNextLevel } from '../constants/milestones';

const defaultGoals: UserGoals = {
  targetGpa: 8.0,
  studyHoursPerDay: 2,
  bedtimeHour: 23,
};

interface UserProfileState extends UserProfile {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setDisplayName: (name: string) => void;
  setUniversity: (uni: string) => void;
  setCourse: (course: string) => void;
  setSubjectCount: (count: number) => void;
  setSubjects: (subjects: Subject[]) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;
  setGoals: (goals: UserGoals) => void;
  setAvatarUri: (uri: string | undefined) => void;
  completeOnboarding: (data: Partial<UserProfile>) => void;
  replayOnboarding: () => void;
  addXp: (amount: number) => void;
  resetProfile: () => void;
  xpToNextLevel: () => number;
  xpProgress: () => number;
}

const initialProfile: UserProfile = {
  displayName: 'Student',
  university: '',
  course: '',
  subjectCount: 0,
  subjects: [],
  goals: defaultGoals,
  onboardingComplete: false,
  level: 1,
  xp: 0,
};

type PersistedProfile = Pick<
  UserProfileState,
  | 'displayName'
  | 'university'
  | 'course'
  | 'subjectCount'
  | 'avatarUri'
  | 'subjects'
  | 'goals'
  | 'onboardingComplete'
  | 'level'
  | 'xp'
>;

/** Convert targetGpa from 4-point scale to 10-point scale. */
function fixGpaScale(profile: PersistedProfile): PersistedProfile {
  if (profile.goals?.targetGpa !== undefined && profile.goals.targetGpa <= 4.0) {
    return {
      ...profile,
      goals: { ...profile.goals, targetGpa: Math.round(profile.goals.targetGpa * 2.5 * 10) / 10 },
    };
  }
  return profile;
}

/** Fix onboarding bug that set name to first word of course (e.g. "computer"). */
function fixLegacyProfile(profile: PersistedProfile): PersistedProfile {
  const courseFirst = profile.course.trim().split(/\s+/)[0]?.toLowerCase() ?? '';
  const nameLower = profile.displayName.trim().toLowerCase();
  const next = { ...profile };

  if (nameLower === 'computer' || (courseFirst && nameLower === courseFirst)) {
    next.displayName = 'Siddesh';
  }
  if (next.university.trim().toLowerCase() === 'presidency university') {
    next.university = 'Presidency University';
  }
  if (next.course.trim().toLowerCase() === 'computer networks') {
    next.course = 'Computer Science and Engineering';
  }
  return next;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set, get) => ({
      ...initialProfile,
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      setDisplayName: (displayName) => set({ displayName }),
      setUniversity: (university) => set({ university }),
      setCourse: (course) => set({ course }),
      setSubjectCount: (subjectCount) => set({ subjectCount }),
      setSubjects: (subjects) => set({ subjects }),
      addSubject: (subject) =>
        set((s) => ({ subjects: [...s.subjects, subject].slice(0, 8) })),
      removeSubject: (id) =>
        set((s) => ({ subjects: s.subjects.filter((sub) => sub.id !== id) })),
      setGoals: (goals) => set({ goals }),
      setAvatarUri: (avatarUri) => set({ avatarUri }),
      completeOnboarding: (data) =>
        set({
          ...data,
          onboardingComplete: true,
          displayName: data.displayName?.trim() || 'Student',
        }),
      replayOnboarding: () => {
        set({ onboardingComplete: false });
        // Ensure persisted storage updates immediately (web localStorage / native AsyncStorage)
        void AsyncStorage.getItem('nexara-user-profile').then((raw) => {
          if (!raw) {
            void AsyncStorage.setItem(
              'nexara-user-profile',
              JSON.stringify({ state: { ...initialProfile, onboardingComplete: false }, version: 2 }),
            );
            return;
          }
          try {
            const parsed = JSON.parse(raw) as { state?: PersistedProfile; version?: number };
            const state = { ...(parsed.state ?? {}), onboardingComplete: false };
            void AsyncStorage.setItem(
              'nexara-user-profile',
              JSON.stringify({ ...parsed, state, version: parsed.version ?? 2 }),
            );
          } catch {
            // ignore corrupt storage
          }
        });
      },
      addXp: (amount) => {
        const state = get();
        let newXp = state.xp + amount;
        let newLevel = state.level;
        while (newLevel < 10) {
          const range = getXpToNextLevel(newLevel) - getXpForLevel(newLevel);
          if (newXp < range) break;
          newXp -= range;
          newLevel += 1;
        }
        set({ xp: newXp, level: newLevel });
      },
      resetProfile: () => set({ ...initialProfile, hydrated: true }),
      xpToNextLevel: () => getXpToNextLevel(get().level),
      xpProgress: () => {
        const level = get().level;
        const xp = get().xp;
        const threshold = getXpToNextLevel(level);
        const base = getXpForLevel(level);
        const range = threshold - base;
        if (range <= 0) return 1;
        return Math.min(xp / range, 1);
      },
    }),
    {
      name: 'nexara-user-profile',
      version: 3,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const base = (persisted ?? {}) as PersistedProfile;
        const withLegacy = version < 2
          ? fixLegacyProfile({ ...initialProfile, ...base })
          : fixLegacyProfile(base);
        return version < 3 ? fixGpaScale(withLegacy) : withLegacy;
      },
      merge: (persisted, current) => ({
        ...current,
        ...fixGpaScale(fixLegacyProfile({
          ...initialProfile,
          ...(persisted as PersistedProfile),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const fixed = fixGpaScale(fixLegacyProfile({
            displayName: state.displayName,
            university: state.university,
            course: state.course,
            subjectCount: state.subjectCount,
            avatarUri: state.avatarUri,
            subjects: state.subjects,
            goals: state.goals,
            onboardingComplete: state.onboardingComplete,
            level: state.level,
            xp: state.xp,
          }));
          if (
            fixed.displayName !== state.displayName
            || fixed.university !== state.university
            || fixed.course !== state.course
          ) {
            state.setDisplayName(fixed.displayName);
            state.setUniversity(fixed.university);
            state.setCourse(fixed.course);
          }
          if (fixed.goals.targetGpa !== state.goals.targetGpa) {
            state.setGoals(fixed.goals);
          }
        }
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        displayName: state.displayName,
        university: state.university,
        course: state.course,
        subjectCount: state.subjectCount,
        avatarUri: state.avatarUri,
        subjects: state.subjects,
        goals: state.goals,
        onboardingComplete: state.onboardingComplete,
        level: state.level,
        xp: state.xp,
      }),
    },
  ),
);
