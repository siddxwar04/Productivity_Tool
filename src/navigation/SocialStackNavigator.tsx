import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SocialHubScreen } from '../screens/Social/SocialHubScreen';
import { GroupsScreen } from '../screens/Social/GroupsScreen';
import { PeersScreen } from '../screens/Social/PeersScreen';
import { SocialStackParamList } from './types';

const Stack = createNativeStackNavigator<SocialStackParamList>();

export function SocialStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SocialHub" component={SocialHubScreen} />
      <Stack.Screen name="Groups" component={GroupsScreen} />
      <Stack.Screen name="Peers" component={PeersScreen} />
    </Stack.Navigator>
  );
}
