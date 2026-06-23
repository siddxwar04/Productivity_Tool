import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  FlatList,
  Linking,
  Alert,
  Modal,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useResourcesStore } from '../../stores/resourcesStore';
import { saveResourceFile, fileNameFromUri } from '../../services/resourceFiles';
import { StudyStackParamList } from '../../navigation/types';
import { Resource } from '../../types';

type Props = NativeStackScreenProps<StudyStackParamList, 'Resources'>;

const { height } = Dimensions.get('window');

type ResourceType = 'pdf' | 'image' | 'link';
type FilterTab = 'all' | ResourceType;

interface DisplayResource {
  id: string;
  type: ResourceType;
  name: string;
  meta: string;
  date: string;
  color: [string, string];
  subject?: string;
  raw: Resource;
}

const FILTERS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pdf', label: 'PDFs' },
  { key: 'image', label: 'Images' },
  { key: 'link', label: 'Links' },
];

const TYPE_ICONS: Record<ResourceType, string> = {
  pdf: '📄',
  image: '🖼',
  link: '🔗',
};

const COLORS: Record<ResourceType, [string, string]> = {
  pdf: ['#6C5CE7', '#A29BFE'],
  image: ['#00B894', '#00CEC9'],
  link: ['#E17055', '#D63031'],
};

function displayType(resource: Resource): ResourceType {
  if (resource.type === 'pdf' || resource.type === 'image') return resource.type;
  return 'link';
}

function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'Last week';
  return new Date(iso).toLocaleDateString();
}

function toDisplayResource(resource: Resource): DisplayResource {
  const type = displayType(resource);
  let meta = 'Saved on device';
  if (type === 'pdf') meta = 'PDF · saved on device';
  if (type === 'image') meta = 'Image · saved on device';
  if (type === 'link') meta = resource.url || (resource.type === 'note' ? 'Note' : 'Link');

  return {
    id: resource.id,
    type,
    name: resource.title,
    meta,
    date: formatRelativeDate(resource.createdAt),
    color: COLORS[type],
    raw: resource,
  };
}

export function ResourcesScreen({ navigation }: Props) {
  const storeResources = useResourcesStore((s) => s.resources);
  const addResource = useResourcesStore((s) => s.addResource);
  const deleteResource = useResourcesStore((s) => s.deleteResource);

  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [fabOpen, setFabOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const resources = useMemo(
    () => storeResources.map(toDisplayResource),
    [storeResources],
  );

  const headerOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const fabRotate = useRef(new Animated.Value(0)).current;
  const fabOption1 = useRef(new Animated.Value(0)).current;
  const fabOption2 = useRef(new Animated.Value(0)).current;
  const fabOption3 = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(listOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [glowAnim, headerOpacity, listOpacity]);

  const openResource = (resource: Resource) => {
    if (resource.type === 'pdf' || resource.type === 'image') {
      if (resource.localUri) {
        navigation.navigate('ResourceViewer', {
          title: resource.title,
          type: resource.type,
          localUri: resource.localUri,
        });
      }
      return;
    }
    if (resource.url) {
      void Linking.openURL(resource.url);
    }
  };

  const confirmDelete = (id: string, name: string) => {
    Alert.alert('Delete resource', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteResource(id) },
    ]);
  };

  const toggleFab = () => {
    const toValue = fabOpen ? 0 : 1;
    setFabOpen(!fabOpen);
    Animated.parallel([
      Animated.spring(fabRotate, { toValue, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(fabOption1, { toValue, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(fabOption2, { toValue, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(fabOption3, { toValue, useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
  };

  const closeFab = () => {
    if (!fabOpen) return;
    setFabOpen(false);
    Animated.parallel([
      Animated.spring(fabRotate, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(fabOption1, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(fabOption2, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.spring(fabOption3, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
    ]).start();
  };

  const pickPdf = async () => {
    closeFab();
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
    } catch (err) {
      console.error('[ResourcesScreen] pickPdf error:', err);
      Alert.alert('Could not add PDF', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const pickImage = async () => {
    closeFab();
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
    } catch (err) {
      console.error('[ResourcesScreen] pickImage error:', err);
      Alert.alert('Could not add image', 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const openLinkModal = () => {
    closeFab();
    setLinkTitle('');
    setLinkUrl('');
    setLinkModalVisible(true);
  };

  const saveLink = () => {
    if (!linkTitle.trim()) return;
    addResource({
      title: linkTitle.trim(),
      type: linkUrl.trim() ? 'link' : 'note',
      url: linkUrl.trim() || undefined,
    });
    setLinkModalVisible(false);
    setLinkTitle('');
    setLinkUrl('');
  };

  const filtered = resources.filter((r) => {
    const matchType = filter === 'all' || r.type === filter;
    const q = search.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      r.meta.toLowerCase().includes(q) ||
      (r.subject?.toLowerCase().includes(q) ?? false);
    return matchType && matchSearch;
  });

  const counts = {
    all: resources.length,
    pdf: resources.filter((r) => r.type === 'pdf').length,
    image: resources.filter((r) => r.type === 'image').length,
    link: resources.filter((r) => r.type === 'link').length,
  };

  const fabSpin = fabRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const fabOptionStyle = (anim: Animated.Value, offset: number) => ({
    opacity: anim,
    transform: [
      { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -offset] }) },
      { scale: anim },
    ],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0F" />

      <Animated.View style={[styles.bgGlow, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={['rgba(108,92,231,0.1)', 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        />
      </Animated.View>

      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Resource library</Text>
            <Text style={styles.headerSub}>{resources.length} items saved</Text>
          </View>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode((v) => (v === 'list' ? 'grid' : 'list'))}
          >
            <Text style={styles.viewToggleText}>{viewMode === 'list' ? '⊞' : '☰'}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.searchWrap, { opacity: headerOpacity }]}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search resources, subjects..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: headerOpacity }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((f) => (
              <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={styles.filterBtnWrap}>
                {filter === f.key ? (
                  <LinearGradient
                    colors={['#6C5CE7', '#A29BFE']}
                    style={styles.filterBtnActive}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.filterTextActive}>
                      {f.label} · {counts[f.key]}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.filterBtn}>
                    <Text style={styles.filterText}>
                      {f.label} · {counts[f.key]}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View style={[styles.listArea, { opacity: listOpacity }]}>
          {busy ? (
            <View style={styles.busyWrap}>
              <ActivityIndicator color="#A29BFE" size="large" />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📂</Text>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyDesc}>
                Tap the + button to add PDFs,{'\n'}images, or study links.
              </Text>
            </View>
          ) : viewMode === 'list' ? (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              renderItem={({ item, index }) => (
                <ResourceCard
                  item={item}
                  index={index}
                  onPress={() => openResource(item.raw)}
                  onDelete={() => confirmDelete(item.id, item.name)}
                />
              )}
            />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item, index }) => (
                <GridCard
                  item={item}
                  index={index}
                  onPress={() => openResource(item.raw)}
                  onDelete={() => confirmDelete(item.id, item.name)}
                />
              )}
            />
          )}
        </Animated.View>
      </SafeAreaView>

      {fabOpen ? (
        <Pressable style={styles.fabBackdrop} onPress={closeFab} />
      ) : null}

      {fabOpen ? (
        <View style={styles.fabOptions} pointerEvents="box-none">
          <Animated.View style={[styles.fabOptionWrap, fabOptionStyle(fabOption3, 180)]}>
            <TouchableOpacity style={styles.fabOption} onPress={pickPdf} disabled={busy}>
              <LinearGradient colors={['#6C5CE7', '#A29BFE']} style={styles.fabOptionBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.fabOptionIcon}>📄</Text>
              </LinearGradient>
              <Text style={styles.fabOptionLabel}>Add PDF</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabOptionWrap, fabOptionStyle(fabOption2, 120)]}>
            <TouchableOpacity style={styles.fabOption} onPress={pickImage} disabled={busy}>
              <LinearGradient colors={['#00B894', '#00CEC9']} style={styles.fabOptionBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.fabOptionIcon}>🖼</Text>
              </LinearGradient>
              <Text style={styles.fabOptionLabel}>Add image</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={[styles.fabOptionWrap, fabOptionStyle(fabOption1, 60)]}>
            <TouchableOpacity style={styles.fabOption} onPress={openLinkModal} disabled={busy}>
              <LinearGradient colors={['#E17055', '#D63031']} style={styles.fabOptionBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.fabOptionIcon}>🔗</Text>
              </LinearGradient>
              <Text style={styles.fabOptionLabel}>Add link</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : null}

      <TouchableOpacity style={styles.fabWrap} onPress={toggleFab} activeOpacity={0.85} disabled={busy}>
        <LinearGradient colors={['#7C6FF0', '#6C5CE7']} style={styles.fab} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: fabSpin }] }]}>+</Animated.Text>
        </LinearGradient>
      </TouchableOpacity>

      <Modal visible={linkModalVisible} transparent animationType="fade" onRequestClose={() => setLinkModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setLinkModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Add link</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Title"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={linkTitle}
              onChangeText={setLinkTitle}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="URL (optional)"
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={linkUrl}
              onChangeText={setLinkUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={saveLink} activeOpacity={0.85}>
              <LinearGradient colors={['#7C6FF0', '#6C5CE7']} style={styles.modalSave} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.modalSaveText}>Save</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ResourceCard({
  item,
  index,
  onPress,
  onDelete,
}: {
  item: DisplayResource;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
    >
      <TouchableOpacity activeOpacity={0.75} style={styles.resourceCard} onPress={onPress} onLongPress={onDelete}>
        <LinearGradient colors={item.color} style={styles.resourceIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.resourceIconText}>{TYPE_ICONS[item.type]}</Text>
        </LinearGradient>
        <View style={styles.resourceInfo}>
          <Text style={styles.resourceName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.resourceMeta} numberOfLines={1}>{item.meta}</Text>
          <View style={styles.resourceBottom}>
            {item.subject ? (
              <View style={[styles.subjectTag, { borderColor: `${item.color[0]}55` }]}>
                <Text style={[styles.subjectTagText, { color: item.color[1] }]}>{item.subject}</Text>
              </View>
            ) : null}
            <Text style={styles.resourceDate}>{item.date}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreBtn} onPress={onDelete}>
          <Text style={styles.moreBtnText}>···</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

function GridCard({
  item,
  index,
  onPress,
  onDelete,
}: {
  item: DisplayResource;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={[
        styles.gridCard,
        {
          opacity: anim,
          transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.75} style={styles.gridCardInner} onPress={onPress} onLongPress={onDelete}>
        <LinearGradient colors={item.color} style={styles.gridIcon} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Text style={styles.gridIconText}>{TYPE_ICONS[item.type]}</Text>
        </LinearGradient>
        <Text style={styles.gridName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.gridMeta} numberOfLines={1}>{item.meta}</Text>
        <Text style={styles.gridDate}>{item.date}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  safe: { flex: 1 },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { color: '#fff', fontSize: 18 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 1 },
  viewToggle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewToggleText: { color: '#A29BFE', fontSize: 18 },
  searchWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchIcon: { fontSize: 15, marginRight: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  clearBtn: { color: 'rgba(255,255,255,0.3)', fontSize: 16, paddingLeft: 8 },
  filterScroll: { marginBottom: 8, flexGrow: 0 },
  filterRow: { paddingHorizontal: 20, gap: 8 },
  filterBtnWrap: {},
  filterBtnActive: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterTextActive: { color: '#fff', fontSize: 13, fontWeight: '600' },
  filterText: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  listArea: { flex: 1 },
  busyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  resourceIconText: { fontSize: 20 },
  resourceInfo: { flex: 1 },
  resourceName: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 2 },
  resourceMeta: { color: 'rgba(255,255,255,0.35)', fontSize: 12, marginBottom: 6 },
  resourceBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectTag: { borderWidth: 0.5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  subjectTagText: { fontSize: 10, fontWeight: '600' },
  resourceDate: { color: 'rgba(255,255,255,0.2)', fontSize: 11 },
  moreBtn: { padding: 8 },
  moreBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 16, letterSpacing: 1 },
  gridContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 100 },
  gridRow: { gap: 12 },
  gridCard: { flex: 1 },
  gridCardInner: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridIconText: { fontSize: 20 },
  gridName: { color: '#fff', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  gridMeta: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginBottom: 4 },
  gridDate: { color: 'rgba(255,255,255,0.2)', fontSize: 11 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyDesc: { color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center', lineHeight: 22 },
  fabWrap: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: { color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 },
  fabBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fabOptions: { position: 'absolute', right: 24, bottom: Platform.OS === 'ios' ? 36 : 24 },
  fabOptionWrap: { position: 'absolute', right: 0, bottom: 0 },
  fabOption: { alignItems: 'center', gap: 6 },
  fabOptionBtn: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabOptionIcon: { fontSize: 20 },
  fabOptionLabel: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#14141F',
    borderRadius: 20,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 12,
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalSave: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  modalSaveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
