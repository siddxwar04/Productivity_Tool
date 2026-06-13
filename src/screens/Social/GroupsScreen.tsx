import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useGroupsStore } from '../../stores/groupsStore';
import { SocialStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'Groups'>;

export function GroupsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const groups = useGroupsStore((s) => s.groups);
  const joinedIds = useGroupsStore((s) => s.joinedIds);
  const joinGroup = useGroupsStore((s) => s.joinGroup);
  const leaveGroup = useGroupsStore((s) => s.leaveGroup);
  const addGroup = useGroupsStore((s) => s.addGroup);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Study groups" onBack={() => navigation.goBack()} />
      {groups.map((g) => {
        const joined = joinedIds.includes(g.id);
        return (
          <View key={g.id} style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]}>{g.name}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{g.memberCount} members · {g.lastMessage}</Text>
            </View>
            <Button title={joined ? 'Leave' : 'Join'} variant={joined ? 'ghost' : 'primary'} onPress={() => joined ? leaveGroup(g.id) : joinGroup(g.id)} style={styles.joinBtn} />
          </View>
        );
      })}
      {showAdd ? (
        <View style={styles.form}>
          <TextInput style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]} placeholder="Group name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
          <Button title="Create group" onPress={() => { if (name.trim()) { addGroup({ name: name.trim(), memberCount: 1 }); setName(''); setShowAdd(false); } }} />
        </View>
      ) : (
        <Button title="+ Create group" onPress={() => setShowAdd(true)} variant="secondary" />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12, marginTop: 4 },
  joinBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  form: { gap: 10, marginTop: 8 },
  input: { borderRadius: 10, padding: 12, fontSize: 15 },
});
