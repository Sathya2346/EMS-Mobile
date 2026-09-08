import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  EmployeeFullDetails,
  getEmployeeDetails,
  updateEmployee,
} from '../../api/adminEmployeeService';
import { getAdminSettings } from '../../api/adminSettingsService';
import DateField from '../../components/user/DateField';
import ProfileSummaryCard from '../../components/user/ProfileSummaryCard';
import SelectDropdown from '../../components/user/SelectDropdown';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { colors } from '../../theme/colors';

const STATUS_OPTIONS = ['Active', 'Inactive'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Exact port of templates/admin/updateEmployee.html — only Company Details
 * are editable here (Employee Email, Designation, Shift Timing, Joining
 * Date, Leaving Date, Status), matching the source form exactly; all other
 * employee fields are shown read-only in `viewEmployeeDetails.html`, not
 * here.
 *
 * The inline "Strict Validation Script" in the source only ever wires up
 * one field (`companyDetails.employeeEmail`) — its `fields` config object
 * has a single entry, so the PAN-card-specific and auto-focus-next branches
 * inside that script are unreachable dead code (no field with those names
 * exists on this form). Only the live email-format check + submit-button
 * gating that the config actually exercises is reproduced.
 */
export default function AdminUpdateEmployeeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const employeeId: number = route.params?.employeeId;

  const [employee, setEmployee] = useState<EmployeeFullDetails | null>(null);
  const [shiftOptions, setShiftOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [employeeEmail, setEmployeeEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [shiftTiming, setShiftTiming] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [leavingDate, setLeavingDate] = useState('');
  const [status, setStatus] = useState('');

  const [emailError, setEmailError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    Promise.all([getEmployeeDetails(employeeId), getAdminSettings()])
      .then(([emp, settingsResult]) => {
        const shifts = settingsResult.shiftTimings.map((s) => s.name);
        setEmployee(emp);
        setShiftOptions(shifts);
        setEmployeeEmail(emp.companyDetails?.employeeEmail || '');
        setDesignation(emp.companyDetails?.designation || '');
        setShiftTiming(emp.companyDetails?.shiftTiming || shifts[0] || '');
        setJoiningDate(emp.companyDetails?.joiningDate || '');
        setLeavingDate(emp.companyDetails?.leavingDate || '');
        setStatus(emp.companyDetails?.status || STATUS_OPTIONS[0]);
      })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    if (!employeeEmail) {
      setEmailError(null);
      return;
    }
    setEmailError(EMAIL_REGEX.test(employeeEmail) ? null : 'Invalid email format');
  }, [employeeEmail]);

  const canSubmit = !!employeeEmail && !emailError && !submitting;

  const handleSubmit = async () => {
    setFieldErrors({});
    setErrorMessage(null);
    setSubmitting(true);
    const result = await updateEmployee(employeeId, {
      employeeEmail,
      designation,
      shiftTiming,
      joiningDate,
      leavingDate,
      status,
    });
    setSubmitting(false);

    if (!result.ok) {
      // The REST API returns one general message, not per-field errors.
      if (result.errorMessage) setErrorMessage(result.errorMessage);
      return;
    }

    Alert.alert('Employee updated successfully!');
    navigation.navigate('AdminEmployeeList');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.attendanceBtnGreen} />
      </View>
    );
  }

  if (loadError || !employee) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{loadError || 'Employee not found.'}</Text>
      </View>
    );
  }

  return (
    <KeyboardAwareScreen>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Employee Details</Text>

      <View style={styles.formCard}>
        {errorMessage && (
          <View style={styles.errorAlert}>
            <Feather name="alert-triangle" size={16} color={colors.alertDangerText} />
            <Text style={styles.errorAlertText}>{errorMessage}</Text>
          </View>
        )}

        <Text style={styles.sectionHeading}>Company Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Employee Email*</Text>
          <TextInput
            style={[styles.input, (!!fieldErrors.employeeEmail || !!emailError) && styles.inputInvalid]}
            keyboardType="email-address"
            autoCapitalize="none"
            value={employeeEmail}
            onChangeText={setEmployeeEmail}
          />
          {(emailError || fieldErrors.employeeEmail) && (
            <Text style={styles.fieldError}>{emailError || fieldErrors.employeeEmail}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Designation*</Text>
          <TextInput
            style={[styles.input, !!fieldErrors.designation && styles.inputInvalid]}
            value={designation}
            onChangeText={setDesignation}
          />
          {fieldErrors.designation && <Text style={styles.fieldError}>{fieldErrors.designation}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Shift Timing*</Text>
          <SelectDropdown
            value={shiftTiming || 'Select Shift'}
            options={shiftOptions.length > 0 ? shiftOptions : ['Select Shift']}
            onChange={setShiftTiming}
          />
          {fieldErrors.shiftTiming && <Text style={styles.fieldError}>{fieldErrors.shiftTiming}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Joining Date*</Text>
          <DateField label="Joining Date" value={joiningDate} onChange={setJoiningDate} />
          {fieldErrors.joiningDate && <Text style={styles.fieldError}>{fieldErrors.joiningDate}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Leaving Date</Text>
          <DateField label="Leaving Date" value={leavingDate} onChange={setLeavingDate} />
          {fieldErrors.leavingDate && <Text style={styles.fieldError}>{fieldErrors.leavingDate}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Status*</Text>
          <SelectDropdown value={status || 'Select'} options={STATUS_OPTIONS} onChange={setStatus} />
          {fieldErrors.status && <Text style={styles.fieldError}>{fieldErrors.status}</Text>}
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.updateBtn, !canSubmit && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
          >
            <Feather name="check-circle" size={15} color={colors.white} />
            <Text style={styles.updateBtnText}>{submitting ? 'Updating...' : 'Update'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.navigate('AdminEmployeeList')}
          >
            <Feather name="x-circle" size={15} color={colors.white} />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ProfileSummaryCard
        name={`${employee.firstname} ${employee.lastname}`}
        designation={designation || 'N/A'}
        email={employee.email}
        phone={employee.phone || ''}
        city={employee.city || ''}
        dateOfBirth={employee.dateOfBirth || ''}
        bankDetails={employee.bankDetails}
        avatarSource={
          employee.profileImageSrc
            ? { uri: employee.profileImageSrc }
            : require('../../assets/images/default-avatar.png')
        }
      />
    </ScrollView>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.alertDangerBg,
    borderColor: colors.alertDangerBorder,
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  errorAlertText: {
    color: colors.alertDangerText,
    flex: 1,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 12,
  },
  field: {
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
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#212529',
    backgroundColor: colors.white,
  },
  inputInvalid: {
    borderColor: '#dc3545',
  },
  fieldError: {
    color: '#dc3545',
    fontSize: 12.5,
    marginTop: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  updateBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#bdc3c7',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});
