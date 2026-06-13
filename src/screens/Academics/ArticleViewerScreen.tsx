import React, { useRef, useState, createElement } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Share,
  Platform,
  Text,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { StudyStackParamList } from '../../navigation/types';
import { isValidArticleUrl, normalizeArticleUrl } from '../../utils/articleUrl';

type Props = NativeStackScreenProps<StudyStackParamList, 'ArticleViewer'>;

type NativeWebViewRef = {
  reload: () => void;
};

type NativeWebViewProps = {
  ref?: React.Ref<NativeWebViewRef>;
  source: { uri: string };
  onLoadProgress: (event: { nativeEvent: { progress: number } }) => void;
  onLoadStart: () => void;
  onLoadEnd: () => void;
  startInLoadingState?: boolean;
  renderLoading?: () => React.ReactElement;
};

const NativeWebView =
  Platform.OS === 'ios' || Platform.OS === 'android'
    ? (require('react-native-webview').WebView as React.ComponentType<NativeWebViewProps>)
    : null;

function openInBrowser(url: string): void {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  void Linking.openURL(url);
}

export function ArticleViewerScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { url, title } = route.params;
  const articleUrl = normalizeArticleUrl(url);
  const urlIsValid = isValidArticleUrl(articleUrl);
  const [loading, setLoading] = useState(urlIsValid);
  const [progress, setProgress] = useState(0);
  const webRef = useRef<NativeWebViewRef>(null);
  const iframeRef = useRef<{ contentWindow?: { location: { reload: () => void } } } | null>(null);

  const handleReload = () => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.location.reload();
      setLoading(true);
      return;
    }

    webRef.current?.reload();
  };

  const handleShare = () => {
    void Share.share({ message: `${title}\n${articleUrl}` });
  };

  const toolbar = (
    <View style={[styles.bar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
        <Ionicons name="close" size={24} color={colors.text} />
      </TouchableOpacity>
      <View style={styles.barActions}>
        {urlIsValid ? (
          <>
            <TouchableOpacity onPress={handleReload} style={styles.iconBtn}>
              <Ionicons name="reload" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconBtn}>
              <Ionicons name="share-outline" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openInBrowser(articleUrl)} style={styles.iconBtn}>
              <Ionicons name="open-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );

  if (!urlIsValid) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {toolbar}
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Link unavailable</Text>
          <Text style={[styles.errorBody, { color: colors.textSecondary }]}>
            This article link is missing or invalid. Try another article or pull to refresh the list.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {toolbar}

      {loading && (
        <View style={[styles.progress, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
      )}

      {Platform.OS === 'web' ? (
        createElement('iframe', {
          ref: (element: { contentWindow?: { location: { reload: () => void } } } | null) => {
            iframeRef.current = element;
          },
          src: articleUrl,
          title,
          style: { flex: 1, width: '100%', height: '100%', border: 'none' },
          onLoad: () => {
            setLoading(false);
            setProgress(1);
          },
        })
      ) : NativeWebView ? (
        <NativeWebView
          ref={webRef}
          source={{ uri: articleUrl }}
          onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Text style={[styles.errorBody, { color: colors.textSecondary }]}>
            Articles cannot be opened on this platform.
          </Text>
          <TouchableOpacity onPress={() => openInBrowser(articleUrl)} style={styles.iconBtn}>
            <Text style={[styles.openLink, { color: colors.primary }]}>Open in browser</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barActions: { flexDirection: 'row' },
  iconBtn: { padding: 8 },
  progress: { height: 2, width: '100%' },
  progressFill: { height: 2 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  errorBody: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  openLink: { fontSize: 15, fontWeight: '600' },
});
