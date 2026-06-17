import { Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

async function dataUriToFile(uri: string): Promise<string> {
  const path = `${FileSystem.cacheDirectory}nexara-share-${Date.now()}.png`;
  const base64 = uri.includes(',') ? uri.split(',')[1] : uri;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return path;
}

async function shareOnWeb(message: string, imageUri?: string) {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      if (imageUri?.startsWith('data:')) {
        const blob = await fetch(imageUri).then((r) => r.blob());
        const file = new File([blob], 'nexara-achievements.png', { type: 'image/png' });
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            text: message,
            title: 'Nexara achievements',
          });
          return;
        }
      }
      await navigator.share({ text: message, title: 'Nexara achievements' });
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
    }
  }
  await Share.share({ message });
}

export async function shareImage(
  imageUri: string,
  message: string,
  dialogTitle = 'Share achievements',
) {
  if (Platform.OS === 'web') {
    await shareOnWeb(message, imageUri);
    return;
  }

  const fileUri = imageUri.startsWith('data:') ? await dataUriToFile(imageUri) : imageUri;

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'image/png',
      dialogTitle,
      UTI: 'public.png',
    });
    return;
  }

  await Share.share({ message, url: fileUri });
}

export async function shareText(message: string, dialogTitle = 'Share') {
  if (Platform.OS === 'web') {
    await shareOnWeb(message);
    return;
  }

  if (await Sharing.isAvailableAsync()) {
    await Share.share({ message, title: dialogTitle });
    return;
  }

  await Share.share({ message });
}
