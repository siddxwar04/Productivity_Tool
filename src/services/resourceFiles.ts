import * as FileSystem from 'expo-file-system/legacy';
import { generateId } from '../utils/helpers';

const RESOURCES_DIR = `${FileSystem.documentDirectory}resources/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(RESOURCES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RESOURCES_DIR, { intermediates: true });
  }
}

function extensionFromUri(uri: string, fallback: string) {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : fallback;
}

export async function saveResourceFile(sourceUri: string, kind: 'pdf' | 'image'): Promise<string> {
  await ensureDir();
  const ext = kind === 'pdf' ? 'pdf' : extensionFromUri(sourceUri, 'jpg');
  const dest = `${RESOURCES_DIR}${generateId()}.${ext}`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function deleteResourceFile(localUri?: string) {
  if (!localUri) return;
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  } catch {
    // ignore missing files
  }
}

export function fileNameFromUri(uri: string) {
  const parts = uri.split('/');
  const last = parts[parts.length - 1] || 'Resource';
  return decodeURIComponent(last.replace(/\?.*$/, ''));
}
