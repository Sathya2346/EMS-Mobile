import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { addEmployee, AddEmployeePayload } from '../../api/adminEmployeeService';
import SelectDropdown from '../../components/user/SelectDropdown';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { colors } from '../../theme/colors';
import { safeNavigate } from '../../utils/safeNavigate';

const ROLE_OPTIONS = ['Employee (User)', 'Administrator'];
const roleToUserType = (label: string): AddEmployeePayload['userType'] =>
  label === 'Administrator' ? 'ROLE_ADMIN' : 'ROLE_USER';

/**
 * Exact port of templates/admin/addEmployee.html. The `<input type="hidden"
 * name="profileFile" value="">` in the source is always empty on this form
 * (the employee uploads their own photo later, during onboarding), so no
 * file picker was added here — reproducing an always-empty hidden field
 * with a visible upload control would be adding functionality the original
 * doesn't have on this screen.
 */
export default function AddEmployeeScreen() {
  const navigation = useNavigation<any>();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setFieldErrors({});
    setErrorMessage(null);
    setSubmitting(true);
    const result = await addEmployee({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      username: username.trim(),
      userType: roleToUserType(role),
    });
    setSubmitting(false);

    if (!result.ok) {
      // The REST API returns one general message, not per-field errors
      // (unlike the web form), so this surfaces as a single banner.
      if (result.errorMessage) setErrorMessage(result.errorMessage);
      return;
    }

    Alert.alert('Employee account created and email sent!');
    navigation.navigate('AdminDashboard');
  };

  return (
    <KeyboardAwareScreen>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headingBlock}>
        <View style={styles.headingRow}>
          <Feather name="user-plus" size={20} color="#0d6efd" style={styles.headingIcon} />
          <Text style={styles.heading}>Create Employee Account</Text>
        </View>
        <Text style={styles.subheading}>
          Enter the employee's basic info and login credentials. The employee will receive their
          username and password via email and complete the rest of their profile through the
          onboarding portal.
        </Text>
      </View>

      {errorMessage && (
        <View style={styles.errorAlert}>
          <Feather name="alert-triangle" size={16} color={colors.alertDangerText} />
          <Text style={styles.errorAlertText}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>
            First Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!fieldErrors.firstname && styles.inputInvalid]}
            placeholder="e.g. Ravi"
            placeholderTextColor="#6c757d"
            value={firstname}
            onChangeText={setFirstname}
          />
          {fieldErrors.firstname && <Text style={styles.fieldError}>{fieldErrors.firstname}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Last Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!fieldErrors.lastname && styles.inputInvalid]}
            placeholder="e.g. Kumar"
            placeholderTextColor="#6c757d"
            value={lastname}
            onChangeText={setLastname}
          />
          {fieldErrors.lastname && <Text style={styles.fieldError}>{fieldErrors.lastname}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Email Address <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!fieldErrors.email && styles.inputInvalid]}
            placeholder="employee@company.com"
            placeholderTextColor="#6c757d"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}
          <Text style={styles.helpText}>Login credentials will be sent to this email.</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Username <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, !!fieldErrors.username && styles.inputInvalid]}
            placeholder="e.g. ravi.kumar"
            placeholderTextColor="#6c757d"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          {fieldErrors.username && <Text style={styles.fieldError}>{fieldErrors.username}</Text>}
          <Text style={styles.helpText}>
            The employee's personal email will be set as the default password and emailed to them.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Role <Text style={styles.required}>*</Text>
          </Text>
          <SelectDropdown value={role} options={ROLE_OPTIONS} onChange={setRole} />
        </View>

        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.saveBtn, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Feather name="send" size={15} color={colors.white} />
            <Text style={styles.saveBtnText}>
              {submitting ? 'Creating...' : 'Create Account & Send Email'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('AdminDashboard')}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoAlert}>
        <Feather name="info" size={16} color="#055160" style={styles.infoIcon} />
        <Text style={styles.infoText}>
          <Text style={styles.infoBold}>What happens next? </Text>
          The employee will receive an email with their login credentials. When they log in, they
          will be directed to the onboarding portal to fill in all their personal details, bank
          information, Aadhar, certificates and photo. You can then review each section from{' '}
          <Text
            style={styles.infoLink}
            onPress={() => safeNavigate(navigation, 'AdminPendingOnboarding')}
          >
            Pending Onboarding
          </Text>
          .
        </Text>
      </View>
    </ScrollView>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa', // .bg-light
  },
  content: {
    padding: 15,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  headingBlock: {
    marginBottom: 16,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headingIcon: {
    marginRight: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
  },
  subheading: {
    color: '#6c757d',
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
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
  card: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  required: {
    color: colors.alertDangerText,
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
  inputInvalid: {
    borderColor: '#dc3545',
  },
  fieldError: {
    color: '#dc3545',
    fontSize: 12.5,
    marginTop: 4,
  },
  helpText: {
    color: '#6c757d',
    fontSize: 12.5,
    marginTop: 4,
  },
  buttonsRow: {
    marginTop: 8,
    gap: 10,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#198754',
    borderRadius: 8,
    paddingVertical: 12,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d',
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  infoAlert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#cff4fc',
    borderColor: '#b6effb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 14,
    marginTop: 16,
    marginBottom: 30,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: '#055160',
    fontSize: 13.5,
    lineHeight: 19,
  },
  infoBold: {
    fontWeight: '700',
  },
  infoLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
