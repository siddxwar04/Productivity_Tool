import React, { useRef, useState } from 'react';
import {
  View, Image, ActivityIndicator, TouchableOpacity, StyleSheet, Share, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import { useTheme } from '../../theme/ThemeContext';
import { StudyStackParamList } from '../../navigation/types';
import { PdfViewer, PdfViewerRef } from '../../components/PdfViewer';

type Props = NativeStackScreenProps<StudyStackParamList, 'ResourceViewer'>;

export function ResourceViewerScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { title, type, localUri } = route.params;
  const [loading, setLoading] = useState(type === 'pdf');
  const webRef = useRef<PdfViewerRef>(null);

  const shareFile = async () => {
    if (!localUri) return;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(localUri);
    } else {
      await Share.share({ message: title, url: localUri });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.bar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.barActions}>
          {type === 'pdf' && Platform.OS !== 'web' && (
            <TouchableOpacity onPress={() => webRef.current?.reload()} style={styles.iconBtn}>
              <Ionicons name="reload" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={shareFile} style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {type === 'image' && localUri ? (
        <Image source={{ uri: localUri }} style={styles.image} resizeMode="contain" />
      ) : localUri ? (
        <>
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          <PdfViewer
            webRef={webRef}
            uri={localUri}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            style={loading ? styles.hidden : styles.web}
          />
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  barActions: { flexDirection: 'row' },
  iconBtn: { padding: 8 },
  image: { flex: 1, width: '100%' },
  web: { flex: 1 },
  hidden: { flex: 0, height: 0 },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
