import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

interface Props {
  label: string;
  value: string | null | undefined;
  /** matches the `.bg-light` class added to Company/Bank/User Detail fields */
  shaded?: boolean;
}

// <label class="form-label">...</label><input class="form-control[.bg-light]" readonly>
export default function ReadOnlyField({ label, value, shaded }: Props) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, shaded && styles.inputShaded]}>
        <Text style={styles.value}>{value || 'N/A'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // col-md-4 (collapses to a full-width column on phone widths)
  field: {
    width: '100%',
    marginBottom: 16,
  },
  // .form-label (Bootstrap default)
  label: {
    fontWeight: '500',
    color: '#212529',
    marginBottom: 6,
    fontSize: 14,
  },
  // input.form-control { border-radius:5px; border:1px solid #ced4da; padding:8px 12px }
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  // .form-control.bg-light (Bootstrap bg-light = #f8f9fa)
  inputShaded: {
    backgroundColor: '#f8f9fa',
  },
  value: {
    fontSize: 15,
    color: '#212529',
  },
});
