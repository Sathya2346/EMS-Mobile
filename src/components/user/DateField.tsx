import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  label: string;
  value: string; // yyyy-MM-dd or ''
  onChange: (isoDate: string) => void;
}

// <input type="date" id="fromDateDownload" class="form-control">
export default function DateField({ label, value, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (_event: unknown, date?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value || label}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // .form-control (Bootstrap default) { border:1px solid #ced4da; border-radius:.375rem; padding:.375rem .75rem }
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  valueText: {
    color: '#212529',
    fontSize: 16,
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 16,
  },
});
