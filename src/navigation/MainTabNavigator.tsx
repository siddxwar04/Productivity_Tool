import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { StudyStackNavigator } from './StudyStackNavigator';
import { GoalsStackNavigator } from './GoalsStackNavigator';
import { WellnessStackNavigator } from './WellnessStackNavigator';
import { SocialStackNavigator } from './SocialStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { useTheme } from '../theme/ThemeContext';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

import { useDailyReset } from '../hooks/useDailyReset';

export function MainTabNavigator() {
  useDailyReset();
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Study" component={StudyStackNavigator} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Goals" component={GoalsStackNavigator} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="flag-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Wellness" component={WellnessStackNavigator} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Social" component={SocialStackNavigator} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}
