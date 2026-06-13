import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';
import { lazyNamedScreen } from './lazyScreen';
import { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const NotificationsScreen = lazyNamedScreen(
  () => require('../screens/Profile/NotificationsScreen'),
  'NotificationsScreen',
);
const SettingsScreen = lazyNamedScreen(
  () => require('../screens/Profile/SettingsScreen'),
  'SettingsScreen',
);

export function ProfileStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
