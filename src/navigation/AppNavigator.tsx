import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingFlow } from '../screens/Onboarding/OnboardingFlow';
import { MainTabNavigator } from './MainTabNavigator';
import { LogMoodScreen } from '../screens/Wellness/MoodScreen';
import { useUserProfileStore } from '../stores/userProfileStore';
import { useTheme } from '../theme/ThemeContext';
import { setupNotificationChannels } from '../services/notifications/notificationService';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isDark, colors } = useTheme();
  const onboardingComplete = useUserProfileStore((s) => s.onboardingComplete);
  const hydrated = useUserProfileStore((s) => s.hydrated);
  const replayOnboarding = useUserProfileStore((s) => s.replayOnboarding);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setupNotificationChannels().finally(() => setReady(true));
  }, []);

  // Web dev helper: open with ?resetOnboarding=1 to show welcome screen again
  useEffect(() => {
    if (!hydrated || Platform.OS !== 'web') return;
    try {
      const params = new URLSearchParams(globalThis.location?.search ?? '');
      if (params.get('resetOnboarding') === '1') {
        replayOnboarding();
        globalThis.history?.replaceState({}, '', globalThis.location?.pathname ?? '/');
      }
    } catch {
      // ignore — not in a browser context
    }
  }, [hydrated, replayOnboarding]);

  if (!hydrated || !ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const navTheme = isDark
    ? { ...DarkTheme, colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, primary: colors.primary } }
    : { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: colors.background, card: colors.surface, primary: colors.primary } };

  const navKey = onboardingComplete ? 'main-app' : 'onboarding-app';

  return (
    <NavigationContainer key={navKey} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingComplete ? (
          <Stack.Screen name="Onboarding" component={OnboardingFlow} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="LogMood" component={LogMoodScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
