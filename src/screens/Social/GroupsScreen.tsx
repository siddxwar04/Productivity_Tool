import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useGroupsStore } from '../../stores/groupsStore';
import { SocialStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'Groups'>;

const GROUP_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'];

function GroupRow({
  group,
  joined,
  onJoin,
  onLeave,
  index,
}: {
  group: { id: string; name: string; memberCount: number; lastMessage?: string };
  joined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  index: number;
}) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const color = GROUP_COLORS[index % GROUP_COLORS.length];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start(() => (joined ? onLeave() : onJoin()));
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <View style={[styles.groupAvatar, { backgroundColor: `${color}20` }]}>
          <Ionicons name="people" size={20} color={color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{group.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="person-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              {group.memberCount} members
            </Text>
            {group.lastMessage ? (
              <>
                <Text style={[styles.metaDot, { color: colors.textMuted }]}>·</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
                  {group.lastMessage}
                </Text>
              </>
            ) : null}
          </View>
        </View>
        <View
          style={[
            styles.joinBadge,
            {
              backgroundColor: joined ? `${colors.primary}15` : colors.primary,
              borderColor: joined ? colors.primary : 'transparent',
              borderWidth: joined ? 1 : 0,
            },
          ]}
        >
          <Text style={[styles.joinText, { color: joined ? colors.primary : '#FFF' }]}>
            {joined ? 'Leave' : 'Join'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export function GroupsScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const groups = useGroupsStore((s) => s.groups);
  const joinedIds = useGroupsStore((s) => s.joinedIds);
  const joinGroup = useGroupsStore((s) => s.joinGroup);
  const leaveGroup = useGroupsStore((s) => s.leaveGroup);
  const addGroup = useGroupsStore((s) => s.addGroup);
  const [name, setName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <ScreenWrapper>
      <ScreenHeader title="Study groups" onBack={() => navigation.goBack()} />

      {groups.length === 0 && !showAdd && (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="people-outline" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No groups yet</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Create or join a study group to collaborate with others.
          </Text>
        </View>
      )}

      {groups.map((g, i) => (
        <GroupRow
          key={g.id}
          group={g}
          joined={joinedIds.includes(g.id)}
          onJoin={() => joinGroup(g.id)}
          onLeave={() => leaveGroup(g.id)}
          index={i}
        />
      ))}

      {showAdd ? (
        <View style={[styles.form, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.formHeader}>
            <Ionicons name="people-outline" size={18} color={colors.primary} />
            <Text style={[styles.formTitle, { color: colors.text }]}>New group</Text>
          </View>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.surfaceSecondary,
                borderColor: focused ? colors.primary : colors.border,
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Group name"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              autoFocus
            />
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity
              onPress={() => { setShowAdd(false); setName(''); }}
              style={[styles.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (name.trim()) {
                  addGroup({ name: name.trim(), memberCount: 1 });
                  setName('');
                  setShowAdd(false);
                }
              }}
              style={[styles.createBtn, { backgroundColor: colors.primary, opacity: name.trim() ? 1 : 0.45 }]}
            >
              <Text style={styles.createText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          activeOpacity={0.8}
          style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.addText, { color: colors.primary }]}>Create a new group</Text>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  groupAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  meta: { fontSize: 12 },
  metaDot: { fontSize: 12 },
  joinBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinText: { fontSize: 13, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 24 },
  form: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  formTitle: { fontSize: 15, fontWeight: '700' },
  inputWrap: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: { fontSize: 15 },
  formActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: { fontSize: 14, fontWeight: '600' },
  createBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  createText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  addText: { fontSize: 15, fontWeight: '600' },
});
