import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui/Button';
import {
  isNotificationSupported,
  requestNotificationPermissions,
  setupNotificationChannels,
  rescheduleAllNotifications,
} from '../../services/notifications/notificationService';

interface Props {
  onFinish: () => void;
  onBack: () => void;
}

export function PermissionsSlide({ onFinish, onBack }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState<boolean | null>(null);

  const handleEnable = async () => {
    setLoading(true);

    try {
      if (!isNotificationSupported()) {
        console.warn('[PermissionsSlide] Notifications unavailable on this platform.');
        setGranted(false);
        return;
      }

      await setupNotificationChannels();
      const ok = await requestNotificationPermissions();
      setGranted(ok);

      if (ok) {
        await rescheduleAllNotifications();
      } else {
        console.warn('[PermissionsSlide] Notification permission was not granted.');
      }
    } catch (error) {
      console.error('[PermissionsSlide] Failed to enable notifications:', error);
      setGranted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🔔</Text>
      <Text style={[styles.title, { color: colors.text }]}>Stay on track</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Enable notifications so Nexara can gently remind you about deadlines, habits, and study sessions — never spammy, always helpful.
      </Text>

      <View style={[styles.featureList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {['Deadline reminders before due dates', 'Daily habit check-ins', 'Pomodoro session alerts', 'Evening mood & wellness prompts'].map((item) => (
          <Text key={item} style={[styles.featureItem, { color: colors.text }]}>
            ✓  {item}
          </Text>
        ))}
      </View>

      {granted === true && (
        <Text style={[styles.status, { color: colors.success }]}>Notifications enabled!</Text>
      )}
      {granted === false && (
        <Text style={[styles.status, { color: colors.warning }]}>
          You can enable notifications later in Settings.
        </Text>
      )}

      <View style={styles.actions}>
        <Button title="Back" onPress={onBack} variant="ghost" style={styles.half} />
        {granted ? (
          <Button title="Get started" onPress={onFinish} style={styles.half} />
        ) : (
          <View style={styles.rightActions}>
            <Button title="Enable" onPress={handleEnable} loading={loading} style={styles.half} />
            <Button title="Skip for now" onPress={handleSkip} variant="secondary" style={styles.half} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 16, marginTop: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  sub: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 24 },
  featureList: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 10 },
  featureItem: { fontSize: 15, lineHeight: 22 },
  status: { textAlign: 'center', marginTop: 16, fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 'auto', paddingTop: 24 },
  rightActions: { flex: 1, gap: 8, flexDirection: 'column' },
  half: { flex: 1 },
});
