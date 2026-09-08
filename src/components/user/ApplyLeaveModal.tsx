import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { ApplyLeavePayload } from '../../api/leaveService';
import DateField from './DateField';
import { colors } from '../../theme/colors';

const LEAVE_TYPES = ['Paid Leave', 'Sick Leave', 'Casual Leave'];

interface Props {
  visible: boolean;
  employeeId: string;
  employeeName: string;
  onClose: () => void;
  onSubmit: (payload: ApplyLeavePayload) => Promise<{ ok: boolean; message?: string; field?: string }>;
}

/**
 * Port of `#leaveModal` / `#leaveForm`. The web `<select>` for Leave Type
 * (exactly 3 fixed options) is reproduced as a 3-way chip picker — the
 * closest native equivalent for a short, fixed option list on mobile,
 * carrying the same 3 options and nothing more.
 */
export default function ApplyLeaveModal({ visible, employeeId, employeeName, onClose, onSubmit }: Props) {
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setLeaveType('');
    setFromDate('');
    setToDate('');
    setReason('');
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};
    if (!leaveType) nextErrors.leaveType = 'Please select a leave type.';
    if (!fromDate) nextErrors.fromDate = 'Please select a start date.';
    if (!toDate) nextErrors.toDate = 'Please select an end date.';
    if (!reason.trim()) nextErrors.reason = 'Please provide a reason.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const days = Math.ceil((new Date(toDate).getTime() - new Date(fromDate).getTime()) / 86400000) + 1;
    if (days <= 0) {
      setErrors({ toDate: 'To Date cannot be before From Date.' });
      return;
    }

    setSubmitting(true);
    const result = await onSubmit({ leaveType, leaveFromDate: fromDate, leaveToDate: toDate, reason: reason.trim() });
    setSubmitting(false);

    if (!result.ok) {
      if (result.field) {
        setErrors({ [result.field]: result.message || 'Invalid value.' });
      }
      return;
    }
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <Pressable style={styles.overlayPressable} onPress={handleClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Feather name="x" size={20} color={colors.attendanceBtnGreen} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Apply for Leave</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Employee ID</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledText}>{employeeId}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Employee Name</Text>
              <View style={styles.disabledInput}>
                <Text style={styles.disabledText}>{employeeName}</Text>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Leave Type*</Text>
              <View style={styles.chipsRow}>
                {LEAVE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, leaveType === type && styles.chipSelected]}
                    onPress={() => setLeaveType(type)}
                  >
                    <Text style={[styles.chipText, leaveType === type && styles.chipTextSelected]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.leaveType && <Text style={styles.error}>{errors.leaveType}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>From Date*</Text>
              <DateField label="From Date" value={fromDate} onChange={setFromDate} />
              {errors.fromDate && <Text style={styles.error}>{errors.fromDate}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>To Date*</Text>
              <DateField label="To Date" value={toDate} onChange={setToDate} />
              {errors.toDate && <Text style={styles.error}>{errors.toDate}</Text>}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Reason*</Text>
              <TextInput
                style={styles.textarea}
                multiline
                numberOfLines={2}
                placeholder="Why are you taking leave?"
                placeholderTextColor="#6c757d"
                value={reason}
                onChangeText={setReason}
              />
              {errors.reason && <Text style={styles.error}>{errors.reason}</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>
                {submitting ? 'Submitting...' : 'Submit Request'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // .modal-overlay { background: rgba(0,0,0,.55) }
  overlay: {
    flex: 1,
  },
  overlayPressable: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  // .modal-content { border:2px solid #23d2aa; border-radius:12px; padding:25px; max-width:400px }
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.leaveModalBorder,
    borderRadius: 12,
    padding: 25,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#212529',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    marginBottom: 6,
    color: '#212529',
  },
  disabledInput: {
    borderWidth: 1.5,
    borderColor: '#bdeede',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
  },
  disabledText: {
    color: '#6c757d',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: '#bdeede',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipSelected: {
    backgroundColor: colors.attendanceBtnGreen,
    borderColor: colors.attendanceBtnGreen,
  },
  chipText: {
    color: '#212529',
    fontSize: 13,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  textarea: {
    borderWidth: 1.5,
    borderColor: '#bdeede',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 60,
    textAlignVertical: 'top',
    color: '#212529',
  },
  error: {
    color: colors.alertDangerText,
    fontSize: 12,
    marginTop: 4,
  },
  // #leaveForm button[type="submit"] { background-color:#23d2aa }
  submitBtn: {
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
