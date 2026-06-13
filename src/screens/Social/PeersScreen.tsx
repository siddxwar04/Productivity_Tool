import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { usePeersStore } from '../../stores/peersStore';
import { SocialStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'Peers'>;

export function PeersScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const peers = usePeersStore((s) => s.peers);
  const togglePartner = usePeersStore((s) => s.togglePartner);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Peers" onBack={() => navigation.goBack()} />
      {peers.map((p) => (
        <View key={p.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{p.name[0]}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{p.name}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>🔥 {p.streak}d · {p.studyHoursWeek}h this week</Text>
          </View>
          <Button
            title={p.isPartner ? 'Partner ✓' : 'Partner'}
            variant={p.isPartner ? 'primary' : 'secondary'}
            onPress={() => togglePartner(p.id)}
            style={styles.btn}
          />
        </View>
      ))}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
  btn: { paddingHorizontal: 12, paddingVertical: 8 },
});
