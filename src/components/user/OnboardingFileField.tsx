import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';
import Feather from 'react-native-vector-icons/Feather';
import { MAX_FILE_SIZE_BYTES } from '../../utils/onboardingValidation';

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
}

interface Props {
  onPick: (file: PickedFile) => void;
  selectedFileName?: string;
  existingPreviewBase64?: string;
  accept: 'imageOrPdf' | 'imageOnly';
  disabled?: boolean;
  compact?: boolean;
}

/**
 * Port of `<input type="file" class="form-control file-input" accept="...">`
 * wrapped in `.file-input-wrapper`. `react-native-document-picker` stands
 * in for the native file picker — the standard RN way to let the user
 * choose any file (image or PDF) from device storage, matching
 * `accept="image/*,application/pdf"` / `accept="image/*"` on the source
 * inputs. The 2MB size check from the source's `change` listener is
 * reproduced exactly.
 */
export default function OnboardingFileField({
  onPick,
  selectedFileName,
  existingPreviewBase64,
  accept,
  disabled,
  compact,
}: Props) {
  const [busy, setBusy] = useState(false);

  const handlePick = async () => {
    if (disabled) return;
    setBusy(true);
    try {
      const result = await DocumentPicker.pickSingle({
        type: accept === 'imageOnly' ? [types.images] : [types.images, types.pdf],
        copyTo: 'cachesDirectory',
      });
      if (result.size != null && result.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert('File size exceeds 2MB limit. Please upload a smaller file.');
        return;
      }
      onPick({
        uri: result.fileCopyUri || result.uri,
        name: result.name || 'file',
        type: result.type || 'application/octet-stream',
      });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Could not select the file. Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View>
      {existingPreviewBase64 && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${existingPreviewBase64}` }}
          style={styles.preview}
        />
      )}
      <TouchableOpacity
        style={[styles.wrapper, compact && styles.wrapperCompact, disabled && styles.disabled]}
        onPress={handlePick}
        disabled={disabled || busy}
      >
        <Feather name="upload" size={compact ? 14 : 18} color="#3a7bd5" />
        <Text style={[styles.text, compact && styles.textCompact]} numberOfLines={1}>
          {selectedFileName || (busy ? 'Selecting...' : 'Choose file')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 8,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  wrapperCompact: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#3a7bd5',
    fontWeight: '600',
    fontSize: 13,
    flexShrink: 1,
  },
  textCompact: {
    fontSize: 11.5,
  },
});
