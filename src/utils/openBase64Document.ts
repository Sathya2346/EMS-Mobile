import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

/**
 * Writes a base64 document to the Expo cache directory and opens the native
 * share/open sheet. This replaces the RN CLI-only react-native-fs path while
 * preserving the existing admin document-viewing behavior.
 */
export async function openBase64Document(
  base64: string,
  filename: string,
  mimeType: 'application/pdf' | 'image/jpeg',
): Promise<void> {
  const extension = mimeType === 'application/pdf' ? 'pdf' : 'jpg';
  const path = `${FileSystem.cacheDirectory}${filename}.${extension}`;
  await FileSystem.writeAsStringAsync(path, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('File sharing is not available on this device.');
  }

  await Sharing.shareAsync(path, { mimeType, dialogTitle: filename });
}
