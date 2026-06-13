import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WellnessHubScreen } from '../screens/Wellness/WellnessHubScreen';
import { lazyNamedScreen } from './lazyScreen';
import { WellnessStackParamList } from './types';

const Stack = createNativeStackNavigator<WellnessStackParamList>();

const LogMoodScreen = lazyNamedScreen(
  () => require('../screens/Wellness/MoodScreen'),
  'LogMoodScreen',
);
const SleepScreen = lazyNamedScreen(
  () => require('../screens/Wellness/SleepScreen'),
  'SleepScreen',
);
const BreaksScreen = lazyNamedScreen(
  () => require('../screens/Wellness/BreaksScreen'),
  'BreaksScreen',
);
const YogaScreen = lazyNamedScreen(
  () => require('../screens/Wellness/YogaScreen'),
  'YogaScreen',
);
const YogaPlayerScreen = lazyNamedScreen(
  () => require('../screens/Wellness/YogaPlayerScreen'),
  'YogaPlayerScreen',
);

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
