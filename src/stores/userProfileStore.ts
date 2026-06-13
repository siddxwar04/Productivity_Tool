import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, UserGoals, UserProfile } from '../types';
import { getXpForLevel, getXpToNextLevel } from '../constants/milestones';

const defaultGoals: UserGoals = {
  targetGpa: 3.5,
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
      addXp: (amount) => {
        const state = get();
        let newXp = state.xp + amount;
        let newLevel = state.level;
        while (newLevel < 10 && newXp >= getXpToNextLevel(newLevel)) {
          newXp -= getXpToNextLevel(newLevel);
          newLevel += 1;
        }
        set({ xp: newXp, level: newLevel });
      },
      resetProfile: () => set({ ...initialProfile }),
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
      name: 'studyflow-user-profile',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const base = (persisted ?? {}) as PersistedProfile;
        if (version < 2) {
          return fixLegacyProfile({
            ...initialProfile,
            ...base,
          });
        }
        return fixLegacyProfile(base);
      },
      merge: (persisted, current) => ({
        ...current,
        ...fixLegacyProfile({
          ...initialProfile,
          ...(persisted as PersistedProfile),
        }),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const fixed = fixLegacyProfile({
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
          });
          if (
            fixed.displayName !== state.displayName
            || fixed.university !== state.university
            || fixed.course !== state.course
          ) {
            state.setDisplayName(fixed.displayName);
            state.setUniversity(fixed.university);
            state.setCourse(fixed.course);
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
