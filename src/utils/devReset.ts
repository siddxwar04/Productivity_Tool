import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevSettings, Platform } from 'react-native';

export const resetAppData = async (): Promise<void> => {
  if (!__DEV__) return;

  await AsyncStorage.clear();

  if (Platform.OS === 'web') {
    window.location.reload();
  } else {
    DevSettings.reload();
  }
};
