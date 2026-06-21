import * as Notifications from 'expo-notifications';

export const requestNotificationPermission = async (): Promise<boolean> => {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleLocalNotification = async ({
  title,
  body,
  triggerDate,
}: {
  title: string;
  body: string;
  triggerDate: Date;
}): Promise<string> => {
  return Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
    },
    trigger: {
      date: triggerDate,
      type: Notifications.SchedulableTriggerInputTypes.DATE,
    },
  });
};
