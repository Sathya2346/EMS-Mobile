import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

interface Props {
  icon: string;
  iconColor?: string;
  title: string;
  subjectLabel: string;
  subjectValue: string;
  onSubjectChange: (v: string) => void;
  bodyLabel: string;
  bodyValue: string;
  onBodyChange: (v: string) => void;
  bodyRows: number;
  placeholders: string[];
}

/** Port of one `<div class="border rounded-4 p-4 mb-4">` email-template section. */
export default function EmailTemplateSection({
  icon,
  iconColor = '#0d6efd',
  title,
  subjectLabel,
  subjectValue,
  onSubjectChange,
  bodyLabel,
  bodyValue,
  onBodyChange,
  bodyRows,
  placeholders,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Feather name={icon} size={16} color={iconColor} style={styles.headingIcon} />
        <Text style={[styles.heading, { color: iconColor }]}>{title}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{subjectLabel}</Text>
        <TextInput style={styles.input} value={subjectValue} onChangeText={onSubjectChange} />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{bodyLabel}</Text>
        <TextInput
          style={[styles.input, { minHeight: bodyRows * 20 }]}
          value={bodyValue}
          onChangeText={onBodyChange}
          multiline
          textAlignVertical="top"
        />
        <Text style={styles.placeholderLabel}>Available Placeholders:</Text>
        <View style={styles.badgeRow}>
          {placeholders.map((p) => (
            <View key={p} style={styles.badge}>
              <Text style={styles.badgeText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headingIcon: {
    marginRight: 8,
  },
  // h6.fw-bold.text-primary (all sections use text-primary per source)
  heading: {
    fontWeight: '700',
    fontSize: 15,
  },
  field: {
    marginBottom: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#212529',
    backgroundColor: colors.white,
  },
  placeholderLabel: {
    color: '#6c757d',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  // .placeholder-badge { font-size:.75rem; background-color:#edf2f7; color:#4a5568; padding:.25rem .5rem; border-radius:6px }
  badge: {
    backgroundColor: '#edf2f7',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#4a5568',
  },
});
