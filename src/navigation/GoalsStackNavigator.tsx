import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoalsHubScreen } from '../screens/Goals/GoalsHubScreen';
import { lazyNamedScreen } from './lazyScreen';
import { GoalsStackParamList } from './types';

const Stack = createNativeStackNavigator<GoalsStackParamList>();

const HabitsScreen = lazyNamedScreen(
  () => require('../screens/Goals/HabitsScreen'),
  'HabitsScreen',
);
const StreaksScreen = lazyNamedScreen(
  () => require('../screens/Goals/StreaksScreen'),
  'StreaksScreen',
);
const MilestonesScreen = lazyNamedScreen(
  () => require('../screens/Goals/MilestonesScreen'),
  'MilestonesScreen',
);
const AnalyticsScreen = lazyNamedScreen(
  () => require('../screens/Goals/AnalyticsScreen'),
  'AnalyticsScreen',
);

export function GoalsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalsHub" component={GoalsHubScreen} />
      <Stack.Screen name="Habits" component={HabitsScreen} />
      <Stack.Screen name="Streaks" component={StreaksScreen} />
      <Stack.Screen name="Milestones" component={MilestonesScreen} />
      <Stack.Screen name="Analytics" component={AnalyticsScreen} />
    </Stack.Navigator>
  );
}
