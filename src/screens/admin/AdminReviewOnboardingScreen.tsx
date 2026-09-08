import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getOnboardingReview, OnboardingReviewDetails, submitOnboardingReview } from '../../api/onboardingService';
import ReviewFieldControl from '../../components/admin/ReviewFieldControl';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { colors } from '../../theme/colors';
import { openBase64Document } from '../../utils/openBase64Document';

interface FieldConfig {
  key: string;
  label: string;
  valueKey?: string;
  compose?: (fields: Record<string, string | null>) => string;
  docKey?: string;
  docLabel?: string;
  docMime?: 'application/pdf' | 'image/jpeg';
  controlType: 'radio' | 'select';
  approveLabel?: string;
  rejectLabel?: string;
  isPhoto?: boolean;
  noDocText?: string;
}

const PERSONAL_FIELDS: FieldConfig[] = [
  { key: 'phone', label: 'Phone Number', valueKey: 'personalPhone', controlType: 'radio' },
  { key: 'emergency', label: 'Emergency Number', valueKey: 'personalEmergencyNumber', controlType: 'radio' },
  { key: 'dob', label: 'Date of Birth', valueKey: 'personalDateOfBirth', controlType: 'radio' },
  { key: 'gender', label: 'Gender', valueKey: 'personalGender', controlType: 'radio' },
  { key: 'maritalField', label: 'Marital Status', valueKey: 'personalMaritalStatus', controlType: 'radio' },
  { key: 'language', label: 'Language', valueKey: 'personalLanguage', controlType: 'radio' },
  { key: 'blood', label: 'Blood Group', valueKey: 'personalBloodGroup', controlType: 'radio' },
  {
    key: 'address',
    label: 'Address & City',
    compose: (f) => `${f.personalAddress || 'N/A'}, ${f.personalCity || ''}`,
    controlType: 'radio',
  },
];

const IDENTITY_FIELDS: FieldConfig[] = [
  {
    key: 'aadhar',
    label: 'Aadhar Number & Document',
    valueKey: 'aadharNumber',
    docKey: 'aadhar',
    docLabel: 'View Aadhar Card',
    docMime: 'application/pdf',
    controlType: 'radio',
  },
  {
    key: 'pan',
    label: 'PAN Card',
    valueKey: 'panNumber',
    docKey: 'pan',
    docLabel: 'View PAN Card',
    docMime: 'application/pdf',
    controlType: 'radio',
  },
  { key: 'account', label: 'Bank Account', valueKey: 'accountNumber', controlType: 'radio' },
  { key: 'bankName', label: 'Bank Name', valueKey: 'bankName', controlType: 'radio' },
  { key: 'ifsc', label: 'IFSC Code', valueKey: 'ifscCode', controlType: 'radio' },
  { key: 'branch', label: 'Bank Branch', valueKey: 'personalBranch', controlType: 'radio' },
];

const DEGREE_FIELDS: FieldConfig[] = [
  { key: 'degreeName', label: 'Highest Degree', valueKey: 'degreeName', controlType: 'radio' },
  { key: 'degreeInst', label: 'University/Institution', valueKey: 'degreeInstitution', controlType: 'radio' },
  {
    key: 'mark10th',
    label: '10th Marksheet',
    docKey: 'mark10th',
    docLabel: 'Download 10th',
    docMime: 'application/pdf',
    controlType: 'radio',
  },
  {
    key: 'mark12th',
    label: '12th Marksheet',
    docKey: 'mark12th',
    docLabel: 'Download 12th',
    docMime: 'application/pdf',
    controlType: 'radio',
  },
];

const SEMESTER_FIELDS: FieldConfig[] = Array.from({ length: 8 }, (_, i) => {
  const n = i + 1;
  return {
    key: `sem${n}`,
    label: `Semester ${n}`,
    docKey: `sem${n}`,
    docLabel: `View Sem ${n}`,
    docMime: 'application/pdf' as const,
    controlType: 'select' as const,
    noDocText: 'No File',
  };
});

const CERT_FIELDS: FieldConfig[] = [
  {
    key: 'transferCert',
    label: 'Transfer Certificate',
    docKey: 'transferCert',
    docLabel: 'Download TC',
    docMime: 'application/pdf',
    controlType: 'select',
  },
  {
    key: 'provisionalCert',
    label: 'Provisional Cert.',
    docKey: 'provisionalCert',
    docLabel: 'Download Cert',
    docMime: 'application/pdf',
    controlType: 'select',
  },
  {
    key: 'courseCompletion',
    label: 'Course Completion',
    docKey: 'courseCompletion',
    docLabel: 'Download Cert',
    docMime: 'application/pdf',
    controlType: 'select',
  },
];

/**
 * Exact port of templates/admin/reviewOnboarding.html. The ~28 repeated
 * field-value + Approve/Reject(/Pending) + rejection-reason blocks in the
 * source are generated here from the `FieldConfig` arrays above rather
 * than hand-written 28 times, but every field, label, control type
 * (radio vs. the Pending/Approve/Reject select used only for semester
 * marksheets + exit certificates), and document link is preserved exactly.
 */
export default function AdminReviewOnboardingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const employeeId: number = route.params?.employeeId;

  const [details, setDetails] = useState<OnboardingReviewDetails | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getOnboardingReview(employeeId)
      .then((result) => {
        setDetails(result);
        setStatuses(result.statuses);
        setReasons(result.reasons);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const setStatus = (key: string, value: string) => {
    setStatuses((prev) => {
      const next = { ...prev, [`${key}Status`]: value };
      if (key === 'address') {
        next.cityStatus = value;
      }
      return next;
    });
    if (value !== 'REJECTED') {
      setReasons((prev) => ({ ...prev, [`${key}RejectionReason`]: '' }));
    }
  };

  const setReason = (key: string, value: string) => {
    setReasons((prev) => ({ ...prev, [`${key}RejectionReason`]: value }));
  };

  const renderField = (config: FieldConfig) => {
    if (!details) return null;
    const value = config.compose
      ? config.compose(details.fields)
      : config.valueKey
      ? details.fields[config.valueKey]
      : undefined;
    const doc = config.docKey ? details.documents[config.docKey] : undefined;

    return (
      <ReviewFieldControl
        key={config.key}
        label={config.label}
        value={config.isPhoto ? undefined : value ?? undefined}
        imageBase64={config.isPhoto ? doc ?? undefined : undefined}
        docs={
          !config.isPhoto && doc && config.docLabel
            ? [
                {
                  label: config.docLabel,
                  onPress: () =>
                    openBase64Document(doc, `${config.key}_${employeeId}`, config.docMime || 'application/pdf'),
                },
              ]
            : undefined
        }
        noDocText={config.noDocText}
        status={statuses[`${config.key}Status`] || 'PENDING'}
        reason={reasons[`${config.key}RejectionReason`] || ''}
        onStatusChange={(v) => setStatus(config.key, v)}
        onReasonChange={(v) => setReason(config.key, v)}
        controlType={config.controlType}
        approveLabel={config.approveLabel}
        rejectLabel={config.rejectLabel}
      />
    );
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await submitOnboardingReview(employeeId, statuses, reasons);
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert(result.errorMessage || 'Failed to submit review.');
      return;
    }
    Alert.alert('Review submitted', 'The employee has been notified and their portal status updated.');
    navigation.navigate('AdminPendingOnboarding');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.attendanceBtnGreen} />
      </View>
    );
  }

  if (error || !details) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Submission not found.'}</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('AdminPendingOnboarding')}>
          <Feather name="arrow-left" size={14} color="#495057" />
          <Text style={styles.backBtnText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Reviewing:{' '}
          <Text style={styles.headerName}>
            {details.employee.firstname} {details.employee.lastname || ''}
          </Text>
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="user" size={16} color={colors.white} />
          <Text style={styles.cardHeaderText}> 1. Personal Details</Text>
        </View>
        <View style={styles.cardBody}>{PERSONAL_FIELDS.map(renderField)}</View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="shield" size={16} color={colors.white} />
          <Text style={styles.cardHeaderText}> 2. Identity & Banking Documents</Text>
        </View>
        <View style={styles.cardBody}>{IDENTITY_FIELDS.map(renderField)}</View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Feather name="book-open" size={16} color={colors.white} />
          <Text style={styles.cardHeaderText}> 3. Photo & Educational Documents</Text>
        </View>
        <View style={styles.cardBody}>
          <ReviewFieldControl
            label="Profile Photo"
            imageBase64={details.documents.photo ?? undefined}
            status={statuses.photoStatus || 'PENDING'}
            reason={reasons.photoRejectionReason || ''}
            onStatusChange={(v) => setStatus('photo', v)}
            onReasonChange={(v) => setReason('photo', v)}
            controlType="radio"
            approveLabel="OK"
            rejectLabel="X"
          />
          {DEGREE_FIELDS.map(renderField)}

          <Text style={styles.subHeading}>Semester Marksheets</Text>
          {SEMESTER_FIELDS.map(renderField)}

          <Text style={styles.subHeading}>Degree & Completion Certificates</Text>
          {CERT_FIELDS.map(renderField)}

          <View style={styles.submitBlock}>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Feather name="send" size={16} color={colors.white} />
              <Text style={styles.submitBtnText}>
                {submitting ? 'Submitting...' : 'Submit Final HR Decision'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.submitNote}>
              Submitting will notify the employee and update their portal status.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dashboardBodyBackground,
  },
  content: {
    padding: 15,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: colors.alertDangerText,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  backBtnText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 13,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212529',
    flexShrink: 1,
  },
  headerName: {
    color: colors.attendanceBtnGreen,
  },
  card: {
    borderRadius: 12,
    backgroundColor: colors.white,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    backgroundColor: colors.attendanceBtnGreen,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  cardHeaderText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15.5,
  },
  cardBody: {
    padding: 16,
  },
  subHeading: {
    marginTop: 20,
    marginBottom: 10,
    color: '#495057',
    fontWeight: '700',
    fontSize: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    paddingBottom: 8,
  },
  submitBlock: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dee2e6',
    alignItems: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 30,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  submitNote: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 12.5,
    textAlign: 'center',
  },
});
