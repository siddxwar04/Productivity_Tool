import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudyHubScreen } from '../screens/Study/StudyHubScreen';
import { PomodoroScreen } from '../screens/Time/PomodoroScreen';
import { PlannerScreen } from '../screens/Time/PlannerScreen';
import { DeadlinesScreen } from '../screens/Time/DeadlinesScreen';
import { AddTaskScreen } from '../screens/Time/AddTaskScreen';
import { NotesListScreen } from '../screens/Academics/NotesListScreen';
import { NoteEditorScreen } from '../screens/Academics/NoteEditorScreen';
import { FlashcardsScreen } from '../screens/Academics/FlashcardsScreen';
import { DeckDetailScreen } from '../screens/Academics/DeckDetailScreen';
import { ReviewScreen } from '../screens/Academics/ReviewScreen';
import { GradesScreen } from '../screens/Academics/GradesScreen';
import { ResourcesScreen } from '../screens/Academics/ResourcesScreen';
import { SmartScheduleScreen } from '../screens/Study/SmartScheduleScreen';
import { StudyBuddyScreen } from '../screens/Study/StudyBuddyScreen';
import { ArticlesScreen } from '../screens/Academics/ArticlesScreen';
import { ArticleViewerScreen } from '../screens/Academics/ArticleViewerScreen';
import { ResourceViewerScreen } from '../screens/Academics/ResourceViewerScreen';
import { StudyStackParamList } from './types';

const Stack = createNativeStackNavigator<StudyStackParamList>();

export function StudyStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudyHub" component={StudyHubScreen} />
      <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
      <Stack.Screen name="Planner" component={PlannerScreen} />
      <Stack.Screen name="Deadlines" component={DeadlinesScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} options={{ presentation: 'modal' }} />
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
