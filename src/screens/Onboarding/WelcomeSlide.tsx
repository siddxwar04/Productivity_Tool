import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Button } from '../../components/ui/Button';

interface Props {
  onContinue: () => void;
}

export function WelcomeSlide({ onContinue }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>📚</Text>
        <Text style={[styles.title, { color: colors.text }]}>StudyFlow</Text>
        <Text style={[styles.tagline, { color: colors.textSecondary }]}>
          Study smarter, not harder
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Your all-in-one student productivity companion for time management, habits, and academic success.
        </Text>
      </View>
      <Button title="Continue" onPress={onContinue} style={styles.btn} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', paddingBottom: 20 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 18, fontWeight: '600', marginTop: 8 },
  sub: { fontSize: 15, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  btn: { marginTop: 24 },
});
