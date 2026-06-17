import React from 'react';
import { StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
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
  const deadlineReminders = useNotificationSettingsStore((s) => s.deadlineReminders);
  const habitDailyReminder = useNotificationSettingsStore((s) => s.habitDailyReminder);
  const moodCheckIn = useNotificationSettingsStore((s) => s.moodCheckIn);
  const sleepLogReminder = useNotificationSettingsStore((s) => s.sleepLogReminder);
  const flashcardReview = useNotificationSettingsStore((s) => s.flashcardReview);
  const pomodoroChime = useNotificationSettingsStore((s) => s.pomodoroChime);
  const breakReminders = useNotificationSettingsStore((s) => s.breakReminders);
  const groupChat = useNotificationSettingsStore((s) => s.groupChat);
  const accountabilityPartner = useNotificationSettingsStore((s) => s.accountabilityPartner);
  const milestoneUnlocked = useNotificationSettingsStore((s) => s.milestoneUnlocked);
  const updateDeadlineReminders = useNotificationSettingsStore((s) => s.updateDeadlineReminders);
  const updateTimedReminder = useNotificationSettingsStore((s) => s.updateTimedReminder);
  const updateSettings = useNotificationSettingsStore((s) => s.updateSettings);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />

      <Card style={styles.section}>
        <ToggleRow
          label="1 week before deadline"
          value={deadlineReminders.oneWeek}
          onValueChange={(oneWeek) => updateDeadlineReminders({ oneWeek })}
        />
        <ToggleRow
          label="1 day before deadline"
          value={deadlineReminders.oneDay}
          onValueChange={(oneDay) => updateDeadlineReminders({ oneDay })}
        />
        <ToggleRow
          label="1 hour before deadline"
          value={deadlineReminders.oneHour}
          onValueChange={(oneHour) => updateDeadlineReminders({ oneHour })}
        />
      </Card>

      <Card style={styles.section}>
        <ToggleRow
          label="Habit daily reminder"
          value={habitDailyReminder.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('habitDailyReminder', { ...habitDailyReminder, enabled })
          }
        />
        {habitDailyReminder.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={habitDailyReminder.time}
            onTimeChange={(time) =>
              updateTimedReminder('habitDailyReminder', { ...habitDailyReminder, time })
            }
          />
        )}

        <ToggleRow
          label="Mood check-in (evening)"
          value={moodCheckIn.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('moodCheckIn', { ...moodCheckIn, enabled })
          }
        />
        {moodCheckIn.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={moodCheckIn.time}
            onTimeChange={(time) =>
              updateTimedReminder('moodCheckIn', { ...moodCheckIn, time })
            }
          />
        )}

        <ToggleRow
          label="Sleep log (morning)"
          value={sleepLogReminder.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('sleepLogReminder', { ...sleepLogReminder, enabled })
          }
        />
        {sleepLogReminder.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={sleepLogReminder.time}
            onTimeChange={(time) =>
              updateTimedReminder('sleepLogReminder', { ...sleepLogReminder, time })
            }
          />
        )}

        <ToggleRow
          label="Flashcard review"
          value={flashcardReview.enabled}
          onValueChange={(enabled) =>
            updateTimedReminder('flashcardReview', { ...flashcardReview, enabled })
          }
        />
        {flashcardReview.enabled && (
          <TimePickerRow
            label="Reminder time"
            time={flashcardReview.time}
            onTimeChange={(time) =>
              updateTimedReminder('flashcardReview', { ...flashcardReview, time })
            }
          />
        )}
      </Card>

      <Card style={styles.section}>
        <ToggleRow
          label="Pomodoro session end chime"
          value={pomodoroChime}
          onValueChange={(next) => updateSettings({ pomodoroChime: next })}
        />
        <ToggleRow
          label="Break reminders"
          value={breakReminders}
          onValueChange={(next) => updateSettings({ breakReminders: next })}
        />
      </Card>

      <Card style={styles.section}>
        <ToggleRow
          label="Group chat messages"
          value={groupChat}
          onValueChange={(next) => updateSettings({ groupChat: next })}
        />
        <ToggleRow
          label="Accountability partner check-in"
          value={accountabilityPartner}
          onValueChange={(next) => updateSettings({ accountabilityPartner: next })}
        />
        <ToggleRow
          label="Milestone unlocked"
          description="Celebrate when you unlock achievements"
          value={milestoneUnlocked}
          onValueChange={(next) => updateSettings({ milestoneUnlocked: next })}
        />
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 16 },
});
