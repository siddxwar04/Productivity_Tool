import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WellnessHubScreen } from '../screens/Wellness/WellnessHubScreen';
import { LogMoodScreen } from '../screens/Wellness/MoodScreen';
import { SleepScreen } from '../screens/Wellness/SleepScreen';
import { BreaksScreen } from '../screens/Wellness/BreaksScreen';
import { YogaScreen } from '../screens/Wellness/YogaScreen';
import { YogaPlayerScreen } from '../screens/Wellness/YogaPlayerScreen';
import { WellnessStackParamList } from './types';

const Stack = createNativeStackNavigator<WellnessStackParamList>();

export function WellnessStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WellnessHub" component={WellnessHubScreen} />
      <Stack.Screen name="Mood" component={LogMoodScreen} />
      <Stack.Screen name="Sleep" component={SleepScreen} />
      <Stack.Screen name="Breaks" component={BreaksScreen} />
      <Stack.Screen name="Yoga" component={YogaScreen} />
      <Stack.Screen name="YogaPlayer" component={YogaPlayerScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
