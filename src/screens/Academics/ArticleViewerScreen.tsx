import React, { useRef, useState } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Linking, StyleSheet, Share } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { StudyStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<StudyStackParamList, 'ArticleViewer'>;

export function ArticleViewerScreen({ navigation, route }: Props) {
  const { colors } = useTheme();
  const { url, title } = route.params;
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const webRef = useRef<WebView>(null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.bar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.barActions}>
          <TouchableOpacity onPress={() => webRef.current?.reload()} style={styles.iconBtn}>
            <Ionicons name="reload" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Share.share({ message: `${title}\n${url}` })} style={styles.iconBtn}>
            <Ionicons name="share-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.iconBtn}>
            <Ionicons name="open-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={[styles.progress, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
        </View>
      )}

      <WebView
        ref={webRef}
        source={{ uri: url }}
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
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
});
