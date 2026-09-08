import RNFS from 'react-native-fs';
import { Share } from 'react-native';

/**
 * Port of the source's `<a href="data:application/pdf;base64,...">` /
 * `<a href="data:image/jpeg;base64,...">` download links (Aadhar, PAN,
 * marksheets, certificates, photo). Mobile has no direct data-URI download;
 * the base64 is written to a temp file and handed to the OS share sheet,
 * which lets the admin open it in any installed PDF/image viewer or save
 * it — the mobile equivalent of a browser file download.
 */
export async function openBase64Document(
  base64: string,
  filename: string,
  mimeType: 'application/pdf' | 'image/jpeg',
): Promise<void> {
  const extension = mimeType === 'application/pdf' ? 'pdf' : 'jpg';
  const path = `${RNFS.CachesDirectoryPath}/${filename}.${extension}`;
  await RNFS.writeFile(path, base64, 'base64');
  await Share.share({ url: `file://${path}`, title: filename });
}
