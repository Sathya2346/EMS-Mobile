import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  visible: boolean;
  mode: 'add' | 'edit';
  initialName?: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

/** Port of `#addShiftModal` / `#editShiftModal` (same layout, different title/submit label). */
export default function AddEditShiftModal({ visible, mode, initialName, onClose, onSubmit }: Props) {
  const [name, setName] = useState(initialName || '');

  useEffect(() => {
    if (visible) setName(initialName || '');
  }, [visible, initialName]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.overlayPressable} onPress={onClose}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.title}>{mode === 'add' ? 'Add Shift Timing' : 'Edit Shift Timing'}</Text>

            <Text style={styles.label}>Shift Name / Work Hours*</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Morning (9:00 AM - 6:00 PM)"
              placeholderTextColor="#6c757d"
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.helpText}>
              {mode === 'add'
                ? 'Enter the name of the shift and the work hours.'
                : 'Modify the name of the shift and the work hours.'}
            </Text>

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, mode === 'edit' && styles.submitBtnEdit]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitBtnText}>{mode === 'add' ? 'Add Shift' : 'Save Changes'}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  overlayPressable: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 22,
  },
  title: {
    fontWeight: '700',
    fontSize: 17,
    color: '#212529',
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#212529',
    backgroundColor: colors.white,
  },
  helpText: {
    color: '#6c757d',
    fontSize: 12.5,
    marginTop: 6,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  cancelBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#198754',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  submitBtnEdit: {
    backgroundColor: '#0d6efd',
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});
