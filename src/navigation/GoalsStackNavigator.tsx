import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GoalsHubScreen } from '../screens/Goals/GoalsHubScreen';
import { HabitsScreen } from '../screens/Goals/HabitsScreen';
import { StreaksScreen } from '../screens/Goals/StreaksScreen';
import { MilestonesScreen } from '../screens/Goals/MilestonesScreen';
import { AnalyticsScreen } from '../screens/Goals/AnalyticsScreen';
import { GoalsStackParamList } from './types';

const Stack = createNativeStackNavigator<GoalsStackParamList>();

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
