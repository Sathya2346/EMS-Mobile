import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { deleteEmployee, EmployeeFullDetails, getEmployeeDetails } from '../../api/adminEmployeeService';
import ProfileSummaryCard from '../../components/user/ProfileSummaryCard';
import ReadOnlyField from '../../components/user/ReadOnlyField';
import { colors } from '../../theme/colors';
import { safeNavigate } from '../../utils/safeNavigate';

/**
 * Exact port of templates/admin/viewEmployeeDetails.html. Reuses the same
 * `ReadOnlyField` / `ProfileSummaryCard` components built for
 * `userProfile.html`, since this admin screen renders the identical
 * read-only field set and profile-card markup for an arbitrary employee.
 */
export default function AdminViewEmployeeDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const employeeId: number = route.params?.employeeId;

  const [employee, setEmployee] = useState<EmployeeFullDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getEmployeeDetails(employeeId)
      .then(setEmployee)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const handleDelete = () => {
    Alert.alert(
      'Delete Employee',
      'Are you sure you want to delete this employee?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteEmployee(employeeId);
            if (ok) {
              navigation.navigate('AdminEmployeeList');
            } else {
              Alert.alert('Failed to delete employee.');
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.attendanceBtnGreen} />
      </View>
    );
  }

  if (error || !employee) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Employee not found.'}</Text>
      </View>
    );
  }

  const roleLabel =
    employee.userType === 'ROLE_USER'
      ? 'Employee'
      : employee.userType === 'ROLE_ADMIN'
      ? 'Administrator'
      : employee.userType;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Employee Details</Text>

      <View style={styles.formCard}>
        <Text style={styles.sectionHeading}>Basic Details</Text>
        <ReadOnlyField label="First Name" value={employee.firstname} />
        <ReadOnlyField label="Last Name" value={employee.lastname} />
        <ReadOnlyField label="Gender" value={employee.gender} />
        <ReadOnlyField label="Date of Birth" value={employee.dateOfBirth} />
        <ReadOnlyField label="Email" value={employee.email} />
        <ReadOnlyField label="Phone" value={employee.phone} />
        <ReadOnlyField label="Address" value={employee.address} />
        <ReadOnlyField label="City" value={employee.city} />
        <ReadOnlyField label="Blood Group" value={employee.blood} />
        <ReadOnlyField label="Emergency Number" value={employee.emergencyNumber} />
        <ReadOnlyField label="Languages Known" value={employee.language} />
        <ReadOnlyField label="Marital Status" value={employee.maritalStatus} />

        <Text style={[styles.sectionHeading, styles.sectionHeadingSpaced]}>Company Details</Text>
        <ReadOnlyField label="Employee Email" value={employee.companyDetails?.employeeEmail} />
        <ReadOnlyField label="Designation" value={employee.companyDetails?.designation} />
        <ReadOnlyField label="Shift Timing" value={employee.companyDetails?.shiftTiming} />
        <ReadOnlyField label="Joining Date" value={employee.companyDetails?.joiningDate} />
        <ReadOnlyField label="Leaving Date" value={employee.companyDetails?.leavingDate} />
        <ReadOnlyField label="Status" value={employee.companyDetails?.status} />

        <Text style={[styles.sectionHeading, styles.sectionHeadingSpaced]}>Bank Details</Text>
        <ReadOnlyField label="Account Holder Name" value={employee.bankDetails?.accHolderName} />
        <ReadOnlyField label="Branch Name" value={employee.bankDetails?.branchName} />
        <ReadOnlyField label="Bank Name" value={employee.bankDetails?.bankName} />
        <ReadOnlyField label="Account Number" value={employee.bankDetails?.accNumber} />
        <ReadOnlyField label="IFSC Code" value={employee.bankDetails?.ifscCode} />
        <ReadOnlyField label="PAN Card Number" value={employee.bankDetails?.panCard} />

        <Text style={[styles.sectionHeading, styles.sectionHeadingSpaced]}>User Details</Text>
        <ReadOnlyField label="Role" value={roleLabel} />
        <ReadOnlyField label="Username" value={employee.username} />

        <View style={styles.buttonsBlock}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.addBtn]}
            onPress={() => safeNavigate(navigation, 'AdminAddEmployee')}
          >
            <Text style={styles.actionBtnText}>+ Add New</Text>
          </TouchableOpacity>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.updateBtn]}
              onPress={() => navigation.navigate('AdminUpdateEmployee', { employeeId })}
            >
              <Text style={styles.actionBtnText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
              <Text style={styles.actionBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ProfileSummaryCard
        name={`${employee.firstname} ${employee.lastname}`}
        designation={employee.companyDetails?.designation || 'N/A'}
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
  sectionHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 12,
  },
  sectionHeadingSpaced: {
    marginTop: 24,
  },
  buttonsBlock: {
    marginTop: 24,
    alignItems: 'center',
    gap: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  addBtn: {
    backgroundColor: '#198754',
  },
  updateBtn: {
    backgroundColor: '#0d6efd',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});
