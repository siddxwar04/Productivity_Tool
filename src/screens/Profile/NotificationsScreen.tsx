import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { Card } from '../../components/ui/Card';
import { ToggleRow } from '../../components/ui/ToggleRow';
import { TimePickerRow } from '../../components/ui/TimePickerRow';
import { useNotificationSettingsStore } from '../../stores/notificationSettingsStore';
import { ProfileStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Notifications'>;
};

export function NotificationsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const settings = useNotificationSettingsStore();
  const updateDeadlineReminders = useNotificationSettingsStore((s) => s.updateDeadlineReminders);
  const updateTimedReminder = useNotificationSettingsStore((s) => s.updateTimedReminder);
  const updateSettings = useNotificationSettingsStore((s) => s.updateSettings);

  return (
    <ScreenWrapper>
      <Text style={[styles.title, { color: colors.text }]} onPress={() => navigation.goBack()}>
        ← Notifications
      </Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Deadline reminders</Text>
        <ToggleRow
          label="1 week before"
          value={settings.deadlineReminders.oneWeek}
          onValueChange={(oneWeek) => updateDeadlineReminders({ oneWeek })}
        />
        <ToggleRow
          label="1 day before"
          value={settings.deadlineReminders.oneDay}
          onValueChange={(oneDay) => updateDeadlineReminders({ oneDay })}
        />
        <ToggleRow
          label="1 hour before"
          value={settings.deadlineReminders.oneHour}
          onValueChange={(oneHour) => updateDeadlineReminders({ oneHour })}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily reminders</Text>
        <ToggleRow
          label="Habit daily reminder"
          value={settings.habitDailyReminder.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('habitDailyReminder', { ...settings.habitDailyReminder, enabled })
          }
        />
        {settings.habitDailyReminder.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={settings.habitDailyReminder.time}
            onTimeChange={(time) =>
              updateTimedReminder('habitDailyReminder', { ...settings.habitDailyReminder, time })
            }
          />
        )}

        <ToggleRow
          label="Mood check-in (evening)"
          value={settings.moodCheckIn.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('moodCheckIn', { ...settings.moodCheckIn, enabled })
          }
        />
        {settings.moodCheckIn.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={settings.moodCheckIn.time}
            onTimeChange={(time) =>
              updateTimedReminder('moodCheckIn', { ...settings.moodCheckIn, time })
            }
          />
        )}

        <ToggleRow
          label="Sleep log (morning)"
          value={settings.sleepLogReminder.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('sleepLogReminder', { ...settings.sleepLogReminder, enabled })
          }
        />
        {settings.sleepLogReminder.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={settings.sleepLogReminder.time}
            onTimeChange={(time) =>
              updateTimedReminder('sleepLogReminder', { ...settings.sleepLogReminder, time })
            }
          />
        )}

        <ToggleRow
          label="Flashcard review"
          value={settings.flashcardReview.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('flashcardReview', { ...settings.flashcardReview, enabled })
          }
        />
        {settings.flashcardReview.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={settings.flashcardReview.time}
            onTimeChange={(time) =>
              updateTimedReminder('flashcardReview', { ...settings.flashcardReview, time })
            }
          />
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Study sessions</Text>
        <ToggleRow
          label="Pomodoro session end chime"
          value={settings.pomodoroChime}
          onValueChange={(pomodoroChime) => updateSettings({ pomodoroChime })}
        />
        <ToggleRow
          label="Break reminders"
          value={settings.breakReminders}
          onValueChange={(breakReminders) => updateSettings({ breakReminders })}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Social & rewards</Text>
        <ToggleRow
          label="Group chat messages"
          value={settings.groupChat}
          onValueChange={(groupChat) => updateSettings({ groupChat })}
        />
        <ToggleRow
          label="Accountability partner check-in"
          value={settings.accountabilityPartner}
          onValueChange={(accountabilityPartner) => updateSettings({ accountabilityPartner })}
        />
        <ToggleRow
          label="Milestone unlocked"
          description="Celebrate when you unlock achievements"
          value={settings.milestoneUnlocked}
          onValueChange={(milestoneUnlocked) => updateSettings({ milestoneUnlocked })}
        />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
