import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Linking, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenWrapper } from '../../components/ui/ScreenWrapper';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useResourcesStore } from '../../stores/resourcesStore';
import { saveResourceFile, fileNameFromUri } from '../../services/resourceFiles';
import { StudyStackParamList } from '../../navigation/types';
import { Resource } from '../../types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Resources'>;

const TYPE_ICON = {
  link: 'link-outline',
  pdf: 'document-outline',
  image: 'image-outline',
  note: 'reader-outline',
} as const;

export function ResourcesScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const resources = useResourcesStore((s) => s.resources);
  const addResource = useResourcesStore((s) => s.addResource);
  const deleteResource = useResourcesStore((s) => s.deleteResource);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const openResource = (r: Resource) => {
    if (r.type === 'pdf' || r.type === 'image') {
      if (r.localUri) {
        navigation.navigate('ResourceViewer', { title: r.title, type: r.type, localUri: r.localUri });
      }
      return;
    }
    if (r.url) {
      Linking.openURL(r.url);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete resource', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteResource(id) },
    ]);
  };

  const pickPdf = async () => {
    setBusy(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const localUri = await saveResourceFile(asset.uri, 'pdf');
      const name = asset.name || fileNameFromUri(asset.uri);
      addResource({ title: name.replace(/\.pdf$/i, ''), type: 'pdf', localUri });
    } catch {
      Alert.alert('Could not add PDF', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const pickImage = async () => {
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const localUri = await saveResourceFile(asset.uri, 'image');
      const name = asset.fileName || fileNameFromUri(asset.uri);
      addResource({
        title: name.replace(/\.[^.]+$/, '') || 'Image',
        type: 'image',
        localUri,
      });
    } catch {
      Alert.alert('Could not add image', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const saveLink = () => {
    if (!title.trim()) return;
    addResource({
      title: title.trim(),
      type: url.trim() ? 'link' : 'note',
      url: url.trim() || undefined,
    });
    setTitle('');
    setUrl('');
    setShowLinkForm(false);
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Resource library" onBack={() => navigation.goBack()} />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={pickPdf}
          disabled={busy}
        >
          <Ionicons name="document-outline" size={22} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Add PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={pickImage}
          disabled={busy}
        >
          <Ionicons name="image-outline" size={22} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Add image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowLinkForm((v) => !v)}
          disabled={busy}
        >
          <Ionicons name="link-outline" size={22} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.text }]}>Add link</Text>
        </TouchableOpacity>
      </View>

      {showLinkForm && (
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
            placeholder="Title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: colors.surfaceSecondary }]}
            placeholder="URL (optional)"
            placeholderTextColor={colors.textMuted}
            value={url}
            onChangeText={setUrl}
          />
          <Button title="Save" onPress={saveLink} />
        </View>
      )}

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {resources.length === 0 && (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            Add PDFs, images, or study links to keep everything in one place.
          </Text>
        )}
        {resources.map((r) => (
          <TouchableOpacity
            key={r.id}
            style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => openResource(r)}
            onLongPress={() => confirmDelete(r.id, r.title)}
          >
            <Ionicons name={TYPE_ICON[r.type]} size={22} color={colors.primary} />
            <View style={styles.info}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{r.title}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                {r.type === 'pdf' && 'PDF · saved on device'}
                {r.type === 'image' && 'Image · saved on device'}
                {r.type === 'link' && r.url}
                {r.type === 'note' && 'Note'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '600' },
  form: { gap: 10, marginBottom: 16 },
  input: { borderRadius: 10, padding: 12, fontSize: 15 },
  list: { flex: 1 },
  empty: { textAlign: 'center', marginTop: 24, fontSize: 14, lineHeight: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  info: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 2 },
});
