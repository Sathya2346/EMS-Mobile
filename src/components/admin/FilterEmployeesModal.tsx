import React, { useState } from 'react';
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
  onClose: () => void;
  onApply: (name: string, id: string) => void;
}

// Port of `#filterPopup` / `#filterForm`
export default function FilterEmployeesModal({ visible, onClose, onApply }: Props) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');

  const handleApply = () => {
    onApply(name.trim(), id.trim());
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable style={styles.overlayPressable} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeGlyph}>×</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Filter Employees</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Employee Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter name"
              placeholderTextColor="#6c757d"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Employee ID</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter ID"
              placeholderTextColor="#6c757d"
              keyboardType="number-pad"
              value={id}
              onChangeText={setId}
            />
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Apply Filter</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // .filter-popup { background: rgba(0,0,0,.5) }
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
  // .filter-popup-content { background:#f7fdfb; border-radius:12px; padding:25px; max-width:400px }
  content: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f7fdfb',
    borderRadius: 12,
    padding: 25,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  closeGlyph: {
    fontSize: 24,
    color: colors.attendanceBtnOrange,
  },
  // h5 { color:#23d2aa; font-weight:bold; margin-bottom:15px }
  title: {
    color: colors.attendanceBtnGreen,
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    marginBottom: 6,
    color: '#212529',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    color: '#212529',
  },
  // .apply-filter { background:#23d2aa; border-radius:7px }
  applyBtn: {
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 7,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  applyBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});
