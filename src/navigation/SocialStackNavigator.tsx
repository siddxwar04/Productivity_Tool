import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SocialHubScreen } from '../screens/Social/SocialHubScreen';
import { lazyNamedScreen } from './lazyScreen';
import { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

const GroupsScreen = lazyNamedScreen(
  () => require('../screens/Social/GroupsScreen'),
  'GroupsScreen',
);
const PeersScreen = lazyNamedScreen(
  () => require('../screens/Social/PeersScreen'),
  'PeersScreen',
);
const LeaderboardScreen = lazyNamedScreen(
  () => require('../screens/Social/LeaderboardScreen'),
  'LeaderboardScreen',
);
const FriendsScreen = lazyNamedScreen(
  () => require('../screens/Social/FriendsScreen'),
  'FriendsScreen',
);

export function SocialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Leaderboard is the default Social landing screen */}
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="SocialHub" component={SocialHubScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="Peers" component={PeersScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
    </Stack.Navigator>
  );
}
