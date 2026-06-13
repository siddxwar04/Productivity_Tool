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

export function SocialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SocialHub" component={SocialHubScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="Peers" component={PeersScreen} />
    </Stack.Navigator>
  );
}
