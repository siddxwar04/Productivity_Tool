import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudyHubScreen } from '../screens/Study/StudyHubScreen';
import { ExamSetupScreen } from '../screens/ExamSetupScreen';
import { lazyNamedScreen } from './lazyScreen';
import { StudyStackParamList } from './types';

const Stack = createNativeStackNavigator<StudyStackParamList>();

const PomodoroScreen = lazyNamedScreen(
  () => require('../screens/Time/PomodoroScreen'),
  'PomodoroScreen',
);
const PlannerScreen = lazyNamedScreen(
  () => require('../screens/Time/PlannerScreen'),
  'PlannerScreen',
);
const DeadlinesScreen = lazyNamedScreen(
  () => require('../screens/Time/DeadlinesScreen'),
  'DeadlinesScreen',
);
const AddTaskScreen = lazyNamedScreen(
  () => require('../screens/Time/AddTaskScreen'),
  'AddTaskScreen',
);
const NotesListScreen = lazyNamedScreen(
  () => require('../screens/Academics/NotesListScreen'),
  'NotesListScreen',
);
const NoteEditorScreen = lazyNamedScreen(
  () => require('../screens/Academics/NoteEditorScreen'),
  'NoteEditorScreen',
);
const FlashcardsScreen = lazyNamedScreen(
  () => require('../screens/Academics/FlashcardsScreen'),
  'FlashcardsScreen',
);
const DeckDetailScreen = lazyNamedScreen(
  () => require('../screens/Academics/DeckDetailScreen'),
  'DeckDetailScreen',
);
const ReviewScreen = lazyNamedScreen(
  () => require('../screens/Academics/ReviewScreen'),
  'ReviewScreen',
);
const GradesScreen = lazyNamedScreen(
  () => require('../screens/Academics/GradesScreen'),
  'GradesScreen',
);
const ResourcesScreen = lazyNamedScreen(
  () => require('../screens/Academics/ResourcesScreen'),
  'ResourcesScreen',
);
const SmartScheduleScreen = lazyNamedScreen(
  () => require('../screens/Study/SmartScheduleScreen'),
  'SmartScheduleScreen',
);
const StudyBuddyScreen = lazyNamedScreen(
  () => require('../screens/Study/StudyBuddyScreen'),
  'StudyBuddyScreen',
);
const ArticlesScreen = lazyNamedScreen(
  () => require('../screens/Academics/ArticlesScreen'),
  'ArticlesScreen',
);
const ArticleViewerScreen = lazyNamedScreen(
  () => require('../screens/Academics/ArticleViewerScreen'),
  'ArticleViewerScreen',
);
const ResourceViewerScreen = lazyNamedScreen(
  () => require('../screens/Academics/ResourceViewerScreen'),
  'ResourceViewerScreen',
);

export function StudyStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyHub" component={StudyHubScreen} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
      <Stack.Screen name="Planner" component={PlannerScreen} />
      <Stack.Screen name="Deadlines" component={DeadlinesScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ExamSetup" component={ExamSetupScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notes" component={NotesListScreen} />
      <Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
      <Stack.Screen name="DeckDetail" component={DeckDetailScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="Grades" component={GradesScreen} />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
      <Stack.Screen name="SmartSchedule" component={SmartScheduleScreen} />
      <Stack.Screen name="StudyBuddy" component={StudyBuddyScreen} />
      <Stack.Screen name="Articles" component={ArticlesScreen} />
      <Stack.Screen name="ArticleViewer" component={ArticleViewerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ResourceViewer" component={ResourceViewerScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
