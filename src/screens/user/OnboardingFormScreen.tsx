import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  getOnboardingForm,
  OnboardingFormData,
  submitOnboardingForm,
} from '../../api/onboardingSubmissionService';
import DateField from '../../components/user/DateField';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import OnboardingFieldContainer from '../../components/user/OnboardingFieldContainer';
import OnboardingFileField, { PickedFile } from '../../components/user/OnboardingFileField';
import SelectDropdown from '../../components/user/SelectDropdown';
import { colors } from '../../theme/colors';
import { useEmployee } from '../../context/EmployeeContext';
import {
  calculateAge,
  validateAadhar,
  validateAccount,
  validateEmergency,
  validateIfsc,
  validatePan,
  validatePhone,
} from '../../utils/onboardingValidation';

type Hint = { text: string; state: 'valid' | 'invalid' | 'pending' } | undefined;

/**
 * Exact port of templates/user/onboardingForm.html — the employee's own
 * self-service onboarding submission (the counterpart to
 * AdminReviewOnboardingScreen.tsx, which reviews what gets submitted
 * here). One deliberate, documented adaptation: the source's mobile
 * "quick select" day/month/year dropdowns for Date of Birth exist purely
 * to work around `<input type="date">` being awkward on some mobile
 * browsers — `DateField`'s native date picker (already used everywhere
 * else in this app) already solves exactly that problem natively, so the
 * dropdown workaround itself isn't reproduced; the single native date
 * picker replaces both the date input AND the dropdowns it was
 * synchronized with.
 */
export default function OnboardingFormScreen() {
  const { data } = useEmployee();
  const employeeId = data?.employee.id;

  const [form, setForm] = useState<OnboardingFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [values, setValues] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, PickedFile | undefined>>({});

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getOnboardingForm(employeeId)
      .then((result) => {
        setForm(result);
        setValues(Object.fromEntries(Object.entries(result.fields).map(([k, v]) => [k, v || ''])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const setValue = (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value }));
  const setFile = (key: string, file: PickedFile) => setFiles((prev) => ({ ...prev, [key]: file }));

  const status = (key: string) => form?.statuses[`${key}Status`] || 'PENDING';
  const reason = (key: string) => form?.reasons[`${key}RejectionReason`];

  const overallStatus = form?.overallStatus;
  const fieldsetDisabled = overallStatus === 'DETAILS_SUBMITTED' || overallStatus === 'FULLY_APPROVED';
  const showSubmitButton = !fieldsetDisabled;
  const isLocked = (key: string) => fieldsetDisabled || status(key) === 'APPROVED';

  const phoneHint: Hint = useMemo(() => {
    const v = values.personalPhone || '';
    if (!v) return { text: '10 digits required', state: 'pending' };
    return validatePhone(v)
      ? { text: 'Looks perfect!', state: 'valid' }
      : { text: 'Exactly 10 digits required', state: 'invalid' };
  }, [values.personalPhone]);

  const emergencyHint: Hint = useMemo(() => {
    const v = values.personalEmergencyNumber || '';
    if (!v) return { text: 'Different from primary', state: 'pending' };
    const result = validateEmergency(v, values.personalPhone || '');
    return { text: result.message, state: result.valid ? 'valid' : 'invalid' };
  }, [values.personalEmergencyNumber, values.personalPhone]);

  const dobHint: Hint = useMemo(() => {
    const v = values.personalDateOfBirth || '';
    if (!v) return { text: 'Min 18 years old', state: 'pending' };
    const age = calculateAge(v);
    return age >= 18
      ? { text: 'Age verified (18+)', state: 'valid' }
      : { text: 'Must be at least 18 years old', state: 'invalid' };
  }, [values.personalDateOfBirth]);

  const aadharHint: Hint = useMemo(() => {
    const v = values.aadharNumber || '';
    if (!v) return { text: 'Numbers only', state: 'pending' };
    return validateAadhar(v)
      ? { text: 'Aadhar format valid', state: 'valid' }
      : { text: '12-digit number required', state: 'invalid' };
  }, [values.aadharNumber]);

  const panHint: Hint = useMemo(() => {
    const v = values.panNumber || '';
    if (!v) return { text: 'Standard format', state: 'pending' };
    return validatePan(v)
      ? { text: 'PAN format valid', state: 'valid' }
      : { text: 'e.g. ABCDE1234F', state: 'invalid' };
  }, [values.panNumber]);

  const accHint: Hint = useMemo(() => {
    const v = values.accountNumber || '';
    if (!v) return { text: '9-18 digits', state: 'pending' };
    return validateAccount(v)
      ? { text: 'Valid length', state: 'valid' }
      : { text: '9-18 digits required', state: 'invalid' };
  }, [values.accountNumber]);

  const ifscHint: Hint = useMemo(() => {
    const v = values.ifscCode || '';
    if (!v) return { text: '11 characters', state: 'pending' };
    return validateIfsc(v)
      ? { text: 'IFSC format valid', state: 'valid' }
      : { text: 'e.g. SBIN0001234', state: 'invalid' };
  }, [values.ifscCode]);

  const handleSubmit = async () => {
    if (!employeeId) return;
    setSubmitting(true);
    const result = await submitOnboardingForm(employeeId, values, files);
    setSubmitting(false);
    if (!result.ok) {
      Alert.alert(result.message || 'Failed to submit.');
      return;
    }
    Alert.alert(result.message || 'Submitted!');
    if (form) setForm({ ...form, overallStatus: 'DETAILS_SUBMITTED' });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.attendanceBtnGreen} />
      </View>
    );
  }

  if (error || !form) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Unable to load onboarding form.'}</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Onboarding Journey</Text>
          <Text style={styles.headerSubtitle}>Complete your profile to join our elite team.</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>ID: {employeeId}</Text>
          </View>
        </View>

        <View style={styles.bodyCard}>
          {overallStatus === 'FULLY_APPROVED' && (
            <View style={[styles.alert, styles.alertSuccess]}>
              <Feather name="check-circle" size={32} color="#198754" />
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertHeading}>Verification Complete!</Text>
                <Text style={styles.alertBody}>
                  Welcome aboard! Your documents have been successfully verified.
                </Text>
              </View>
            </View>
          )}
          {overallStatus === 'DETAILS_SUBMITTED' && (
            <View style={[styles.alert, styles.alertInfo]}>
              <ActivityIndicator color="#0dcaf0" />
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertHeading}>Under Review</Text>
                <Text style={styles.alertBodyMuted}>
                  Our HR team is currently verifying your details. This usually takes 24-48 hours.
                </Text>
              </View>
            </View>
          )}
          {overallStatus === 'CHANGES_REQUESTED' && (
            <View style={[styles.alert, styles.alertWarning]}>
              <Feather name="alert-triangle" size={32} color="#ffc107" />
              <View style={styles.alertTextWrap}>
                <Text style={styles.alertHeading}>Attention Required</Text>
                <Text style={styles.alertBody}>
                  Some information needs your attention. Please check the highlighted sections below.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <Feather name="user" size={18} color={colors.attendanceBtnGreen} />
            <Text style={styles.sectionHeaderText}> 1. Personal Profile</Text>
          </View>

          <OnboardingFieldContainer label="Primary Phone" status={status('phone')} rejectionReason={reason('phone')} hint={phoneHint}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalPhone}
              onChangeText={(v) => setValue('personalPhone', v)}
              placeholder="10-digit number"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!isLocked('phone')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Emergency Contact" status={status('emergency')} rejectionReason={reason('emergency')} hint={emergencyHint}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalEmergencyNumber}
              onChangeText={(v) => setValue('personalEmergencyNumber', v)}
              placeholder="Alternative Number"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!isLocked('emergency')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Date of Birth" status={status('dob')} rejectionReason={reason('dob')} hint={dobHint}>
            <DateField label="Date of Birth" value={values.personalDateOfBirth} onChange={(v) => setValue('personalDateOfBirth', v)} />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Gender" status={status('gender')} rejectionReason={reason('gender')}>
            <SelectDropdown
              value={values.personalGender || 'Select...'}
              options={['Male', 'Female', 'Other']}
              onChange={(v) => setValue('personalGender', v)}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Marital Status" status={status('maritalField')} rejectionReason={reason('maritalField')}>
            <SelectDropdown
              value={values.personalMaritalStatus || 'Select...'}
              options={['Single', 'Married']}
              onChange={(v) => setValue('personalMaritalStatus', v)}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Languages" status={status('language')} rejectionReason={reason('language')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalLanguage}
              onChangeText={(v) => setValue('personalLanguage', v)}
              placeholder="e.g. English, Hindi"
              editable={!isLocked('language')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Blood Group" status={status('blood')} rejectionReason={reason('blood')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalBloodGroup}
              onChangeText={(v) => setValue('personalBloodGroup', v)}
              placeholder="e.g. O+"
              editable={!isLocked('blood')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Full Address (As per Aadhar)" status={status('address')} rejectionReason={reason('address')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalAddress}
              onChangeText={(v) => setValue('personalAddress', v)}
              placeholder="Street, Building, Area"
              editable={!isLocked('address')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="City" status={status('city')} rejectionReason={reason('city')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalCity}
              onChangeText={(v) => setValue('personalCity', v)}
              editable={!isLocked('address')}
            />
          </OnboardingFieldContainer>

          <View style={styles.sectionHeader}>
            <Feather name="shield" size={18} color={colors.attendanceBtnGreen} />
            <Text style={styles.sectionHeaderText}> 2. Official Documents</Text>
          </View>

          <OnboardingFieldContainer
            label="Aadhar Number & Card Copy"
            status={status('aadhar')}
            rejectionReason={reason('aadhar')}
            hint={aadharHint}
          >
            <View style={styles.inputGroupRow}>
              <TextInput
                style={[styles.input, styles.inputGroupNumber]}
                placeholderTextColor="#94a3b8"
                value={values.aadharNumber}
                onChangeText={(v) => setValue('aadharNumber', v)}
                placeholder="12-digit UID"
                keyboardType="number-pad"
                maxLength={12}
                editable={!isLocked('aadhar')}
              />
              <View style={styles.inputGroupFile}>
                <OnboardingFileField
                  accept="imageOrPdf"
                  compact
                  disabled={isLocked('aadhar')}
                  selectedFileName={files.aadharFile?.name}
                  onPick={(f) => setFile('aadharFile', f)}
                />
              </View>
            </View>
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="PAN Number & Card Copy" status={status('pan')} rejectionReason={reason('pan')} hint={panHint}>
            <View style={styles.inputGroupRow}>
              <TextInput
                style={[styles.input, styles.inputGroupNumber]}
                placeholderTextColor="#94a3b8"
                value={values.panNumber}
                onChangeText={(v) => setValue('panNumber', v.toUpperCase())}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
                editable={!isLocked('pan')}
              />
              <View style={styles.inputGroupFile}>
                <OnboardingFileField
                  accept="imageOrPdf"
                  compact
                  disabled={isLocked('pan')}
                  selectedFileName={files.panFile?.name}
                  onPick={(f) => setFile('panFile', f)}
                />
              </View>
            </View>
          </OnboardingFieldContainer>

          <View style={styles.sectionHeader}>
            <Feather name="briefcase" size={18} color={colors.attendanceBtnGreen} />
            <Text style={styles.sectionHeaderText}> 3. Financial Details</Text>
          </View>

          <OnboardingFieldContainer label="Account Number" status={status('account')} rejectionReason={reason('account')} hint={accHint}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.accountNumber}
              onChangeText={(v) => setValue('accountNumber', v)}
              placeholder="Bank Account No."
              keyboardType="number-pad"
              editable={!isLocked('account')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Bank Name" status={status('bankName')} rejectionReason={reason('bankName')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.bankName}
              onChangeText={(v) => setValue('bankName', v)}
              placeholder="Full Bank Name"
              editable={!isLocked('bankName')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="IFSC Code" status={status('ifsc')} rejectionReason={reason('ifsc')} hint={ifscHint}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.ifscCode}
              onChangeText={(v) => setValue('ifscCode', v.toUpperCase())}
              placeholder="SBIN0001234"
              autoCapitalize="characters"
              editable={!isLocked('ifsc')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Branch Name" status={status('branch')} rejectionReason={reason('branch')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.personalBranch}
              onChangeText={(v) => setValue('personalBranch', v)}
              placeholder="Branch Location"
              editable={!isLocked('branch')}
            />
          </OnboardingFieldContainer>

          <View style={styles.sectionHeader}>
            <Feather name="book-open" size={18} color={colors.attendanceBtnGreen} />
            <Text style={styles.sectionHeaderText}> 4. Education & Documents</Text>
          </View>

          <OnboardingFieldContainer label="Profile Photo" status={status('photo')} rejectionReason={reason('photo')}>
            <OnboardingFileField
              accept="imageOnly"
              disabled={isLocked('photo')}
              selectedFileName={files.photoFile?.name}
              existingPreviewBase64={form.documents.photo ?? undefined}
              onPick={(f) => setFile('photoFile', f)}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="10th Marksheet (PDF)" status={status('mark10th')} rejectionReason={reason('mark10th')}>
            <OnboardingFileField
              accept="imageOrPdf"
              disabled={isLocked('mark10th')}
              selectedFileName={files.mark10thFile?.name}
              onPick={(f) => setFile('mark10thFile', f)}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="12th Marksheet (PDF)" status={status('mark12th')} rejectionReason={reason('mark12th')}>
            <OnboardingFileField
              accept="imageOrPdf"
              disabled={isLocked('mark12th')}
              selectedFileName={files.mark12thFile?.name}
              onPick={(f) => setFile('mark12thFile', f)}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="Highest Qualification" status={status('degreeName')} rejectionReason={reason('degreeName')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.degreeName}
              onChangeText={(v) => setValue('degreeName', v)}
              placeholder="e.g. B.Tech Computer Science"
              editable={!isLocked('degreeName')}
            />
          </OnboardingFieldContainer>

          <OnboardingFieldContainer label="University/College" status={status('degreeInst')} rejectionReason={reason('degreeInst')}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#94a3b8"
              value={values.degreeInstitution}
              onChangeText={(v) => setValue('degreeInstitution', v)}
              editable={!isLocked('degreeInst')}
            />
          </OnboardingFieldContainer>

          <Text style={styles.subHeading}>Semester Marksheets (Sem 1 - 8)</Text>
          <View style={styles.semesterGrid}>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => (
              <View key={n} style={styles.semesterItem}>
                <OnboardingFieldContainer label={`Sem ${n}`} status={status(`sem${n}`)} rejectionReason={reason(`sem${n}`)}>
                  <OnboardingFileField
                    accept="imageOrPdf"
                    compact
                    disabled={isLocked(`sem${n}`)}
                    selectedFileName={files[`sem${n}File`]?.name}
                    onPick={(f) => setFile(`sem${n}File`, f)}
                  />
                </OnboardingFieldContainer>
              </View>
            ))}
          </View>

          <View style={styles.certGrid}>
            <View style={styles.certItem}>
              <OnboardingFieldContainer label="Transfer Cert." status={status('transferCert')} rejectionReason={reason('transferCert')}>
                <OnboardingFileField
                  accept="imageOrPdf"
                  compact
                  disabled={isLocked('transferCert')}
                  selectedFileName={files.transferCertFile?.name}
                  onPick={(f) => setFile('transferCertFile', f)}
                />
              </OnboardingFieldContainer>
            </View>
            <View style={styles.certItem}>
              <OnboardingFieldContainer label="Provisional Cert." status={status('provisionalCert')} rejectionReason={reason('provisionalCert')}>
                <OnboardingFileField
                  accept="imageOrPdf"
                  compact
                  disabled={isLocked('provisionalCert')}
                  selectedFileName={files.provisionalCertFile?.name}
                  onPick={(f) => setFile('provisionalCertFile', f)}
                />
              </OnboardingFieldContainer>
            </View>
            <View style={styles.certItem}>
              <OnboardingFieldContainer label="Course Completion" status={status('courseCompletion')} rejectionReason={reason('courseCompletion')}>
                <OnboardingFileField
                  accept="imageOrPdf"
                  compact
                  disabled={isLocked('courseCompletion')}
                  selectedFileName={files.courseCompletionFile?.name}
                  onPick={(f) => setFile('courseCompletionFile', f)}
                />
              </OnboardingFieldContainer>
            </View>
          </View>

          {showSubmitButton && (
            <View style={styles.submitBlock}>
              <TouchableOpacity
                style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Feather name="send" size={16} color={colors.white} />
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Onboarding Details'}</Text>
              </TouchableOpacity>
              <Text style={styles.submitNote}>Double check all information before submission.</Text>
            </View>
          )}
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
    paddingBottom: 40,
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
  headerCard: {
    backgroundColor: colors.attendanceBtnGreen,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerTitle: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 22,
  },
  headerSubtitle: {
    color: colors.white,
    opacity: 0.85,
    marginTop: 4,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginTop: 12,
  },
  headerBadgeText: {
    color: colors.attendanceBtnGreen,
    fontWeight: '700',
    fontSize: 12.5,
  },
  bodyCard: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 15 },
    elevation: 2,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  alertSuccess: { backgroundColor: '#d1e7dd' },
  alertInfo: { backgroundColor: '#cff4fc' },
  alertWarning: { backgroundColor: '#fff3cd' },
  alertTextWrap: { flex: 1 },
  alertHeading: {
    fontWeight: '700',
    fontSize: 16,
    color: '#212529',
    marginBottom: 2,
  },
  alertBody: { color: '#212529' },
  alertBodyMuted: { color: '#6c757d' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.attendanceBtnGreen,
    paddingLeft: 12,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionHeaderText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#2c3e50',
    backgroundColor: '#ffffff',
  },
  inputGroupRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroupNumber: { flex: 1 },
  inputGroupFile: { flex: 1 },
  subHeading: {
    marginTop: 24,
    marginBottom: 10,
    color: '#6c757d',
    fontWeight: '700',
    fontSize: 13,
  },
  semesterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  semesterItem: { width: '47%' },
  certGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  certItem: { flex: 1, minWidth: '30%' },
  submitBlock: {
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  submitNote: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 12.5,
  },
});
