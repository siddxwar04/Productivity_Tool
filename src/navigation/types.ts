import { NavigatorScreenParams } from '@react-navigation/native';

export type StudyStackParamList = {
  StudyHub: undefined;
  Pomodoro: undefined;
  Planner: undefined;
  Deadlines: undefined;
  AddTask: undefined;
  Notes: undefined;
  NoteEditor: { noteId?: string };
  Flashcards: undefined;
  DeckDetail: { deckId: string };
  Review: { deckId: string };
  Grades: undefined;
  Resources: undefined;
  SmartSchedule: undefined;
  StudyBuddy: undefined;
  Articles: undefined;
  ArticleViewer: { url: string; title: string };
  ResourceViewer: { title: string; type: 'pdf' | 'image'; localUri: string };
};

export type GoalsStackParamList = {
  GoalsHub: undefined;
  Habits: undefined;
  Streaks: undefined;
  Milestones: undefined;
  Analytics: undefined;
};

export type WellnessStackParamList = {
  WellnessHub: undefined;
  Mood: undefined;
  Sleep: undefined;
  Breaks: undefined;
  Yoga: undefined;
  YogaPlayer: { videoId: string; title: string };
};

export type SocialStackParamList = {
  SocialHub: undefined;
  Groups: undefined;
  Peers: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  LogMood: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Study: NavigatorScreenParams<StudyStackParamList>;
  Goals: NavigatorScreenParams<GoalsStackParamList>;
  Wellness: NavigatorScreenParams<WellnessStackParamList>;
  Social: NavigatorScreenParams<SocialStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};
