import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from './Button';
import { useFocusLockStore } from '../../stores/focusLockStore';

export function FocusExitModal() {
  const { colors } = useTheme();
  const showExitModal = useFocusLockStore((s) => s.showExitModal);
  const sessionLabel = useFocusLockStore((s) => s.sessionLabel);
  const keepFocusing = useFocusLockStore((s) => s.keepFocusing);
  const confirmEndSession = useFocusLockStore((s) => s.confirmEndSession);

  return (
    <Modal
      visible={showExitModal}
      transparent
      animationType="fade"
      onRequestClose={keepFocusing}
    >
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.emoji}>💪</Text>
          <Text style={[styles.title, { color: colors.text }]}>Stay Focused</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            You are in the middle of {sessionLabel.toLowerCase()}. Leaving now will break your flow.
          </Text>
          <View style={styles.actions}>
            <Button title="Keep Focusing" onPress={keepFocusing} style={styles.btn} />
            <Button title="End Session" onPress={confirmEndSession} variant="secondary" style={styles.btn} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  message: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  actions: { width: '100%', gap: 10 },
  btn: { width: '100%' },
});
