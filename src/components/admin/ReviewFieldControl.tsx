import React from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import SelectDropdown from '../user/SelectDropdown';
import { colors } from '../../theme/colors';

interface DocLink {
  label: string;
  onPress: () => void;
}

interface Props {
  label: string;
  value?: string;
  imageBase64?: string;
  docs?: DocLink[];
  noDocText?: string;
  status: string;
  reason: string;
  onStatusChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  /** 'radio' = Approve/Reject only (most fields); 'select' = Pending/Approve/Reject
   *  (semester marksheets + exit certificates, matching the source exactly). */
  controlType: 'radio' | 'select';
  approveLabel?: string;
  rejectLabel?: string;
}

const SELECT_OPTIONS = ['Pending', 'Approve', 'Reject'];
const STATUS_TO_LABEL: Record<string, string> = { PENDING: 'Pending', APPROVED: 'Approve', REJECTED: 'Reject' };
const LABEL_TO_STATUS: Record<string, string> = { Pending: 'PENDING', Approve: 'APPROVED', Reject: 'REJECTED' };

/** Port of `.field-item` / `.decision-area` / `.rejection-box` in reviewOnboarding.html. */
export default function ReviewFieldControl({
  label,
  value,
  imageBase64,
  docs,
  noDocText,
  status,
  reason,
  onStatusChange,
  onReasonChange,
  controlType,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {imageBase64 ? (
        <Image
          source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      ) : (
        value !== undefined && <Text style={styles.value}>{value || 'N/A'}</Text>
      )}

      {docs?.map((doc) => (
        <TouchableOpacity key={doc.label} style={styles.docLink} onPress={doc.onPress}>
          <Feather name="download" size={13} color="#0369a1" />
          <Text style={styles.docLinkText}>{doc.label}</Text>
        </TouchableOpacity>
      ))}
      {(!docs || docs.length === 0) && noDocText && (
        <View style={styles.noDocRow}>
          <Feather name="minus-circle" size={13} color="#6c757d" />
          <Text style={styles.noDocText}> {noDocText}</Text>
        </View>
      )}

      <View style={styles.decisionArea}>
        {controlType === 'radio' ? (
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => onStatusChange('APPROVED')}
            >
              <View style={[styles.radioCircle, status === 'APPROVED' && styles.radioCircleChecked]} />
              <Text style={styles.approveLabel}>{approveLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => onStatusChange('REJECTED')}
            >
              <View style={[styles.radioCircle, status === 'REJECTED' && styles.radioCircleChecked]} />
              <Text style={styles.rejectLabel}>{rejectLabel}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SelectDropdown
            value={STATUS_TO_LABEL[status] || 'Pending'}
            options={SELECT_OPTIONS}
            onChange={(label) => onStatusChange(LABEL_TO_STATUS[label])}
          />
        )}

        {status === 'REJECTED' && (
          <TextInput
            style={styles.reasonInput}
            placeholder="Reason..."
            placeholderTextColor="#6c757d"
            value={reason}
            onChangeText={onReasonChange}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // .field-item { padding:1.25rem; border-bottom:1px solid #f1f5f9 }
  container: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  // .field-label { font-weight:700; color:#475569; font-size:.9rem }
  label: {
    fontWeight: '700',
    color: '#475569',
    fontSize: 14.4,
    marginBottom: 4,
  },
  // .field-value { color:#1e293b; font-weight:500 } fs-5
  value: {
    color: '#1e293b',
    fontWeight: '500',
    fontSize: 17,
    marginBottom: 6,
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginBottom: 6,
  },
  // .doc-link { background:#e0f2fe; color:#0369a1; padding:.5rem 1rem; border-radius:8px }
  docLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  docLinkText: {
    color: '#0369a1',
    fontWeight: '600',
    fontSize: 13.5,
  },
  noDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  noDocText: {
    color: '#6c757d',
    fontSize: 13,
  },
  // .decision-area { background:#fff; padding:1.25rem; border-radius:10px; border:1px solid #e2e8f0 }
  decisionArea: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#adb5bd',
  },
  radioCircleChecked: {
    borderColor: colors.attendanceBtnGreen,
    backgroundColor: colors.attendanceBtnGreen,
  },
  approveLabel: {
    color: '#198754',
    fontWeight: '700',
    fontSize: 13.5,
  },
  rejectLabel: {
    color: '#dc3545',
    fontWeight: '700',
    fontSize: 13.5,
  },
  reasonInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 13.5,
    color: '#212529',
    backgroundColor: colors.white,
  },
});
