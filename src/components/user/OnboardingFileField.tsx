import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
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
 * Expo-compatible port of the original native file picker.
 * The source behavior is preserved: image-only or image/PDF selection,
 * 2MB validation, existing preview, and the same visible control/styles.
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
      const result = await DocumentPicker.getDocumentAsync({
        type: accept === 'imageOnly' ? ['image/*'] : ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      if (file.size != null && file.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert('File size exceeds 2MB limit. Please upload a smaller file.');
        return;
      }

      onPick({
        uri: file.uri,
        name: file.name || 'file',
        type: file.mimeType || 'application/octet-stream',
      });
    } catch {
      Alert.alert('Could not select the file. Please try again.');
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
