import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { HubGrid } from '../../components/ui/HubGrid';
import { SocialStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<SocialStackParamList, 'SocialHub'>;

export function SocialHubScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const items = [
    { id: 'groups', title: 'Groups', subtitle: 'Study together', icon: 'people-outline' as const, color: '#6366F1', onPress: () => navigation.navigate('Groups') },
    { id: 'peers', title: 'Peers', subtitle: 'Accountability partners', icon: 'person-add-outline' as const, color: '#14B8A6', onPress: () => navigation.navigate('Peers') },
  ];

  return (
    <ScreenWrapper>
      <Text style={[styles.title, { color: colors.text }]}>Social</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Collaborate & stay accountable</Text>
      <HubGrid items={items} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginBottom: 4 },
  sub: { fontSize: 15, marginBottom: 24 },
});
