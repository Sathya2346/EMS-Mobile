import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ProfileSummaryCard from '../../components/user/ProfileSummaryCard';
import ReadOnlyField from '../../components/user/ReadOnlyField';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';

/**
 * Exact port of templates/user/userProfile.html. Every field on this
 * screen is `readonly` in the source (no edit/save affordance exists on
 * this template — company/bank/user detail fields are additionally
 * `.bg-light` shaded), so nothing here is editable, matching the original
 * exactly.
 */
export default function UserProfileScreen() {
  const { data } = useEmployee();
  const employee = data?.employee;

  if (!employee) {
    return <View style={styles.screen} />;
  }

  const roleLabel =
    employee.userType === 'ROLE_USER'
      ? 'Employee'
      : employee.userType === 'ROLE_ADMIN'
      ? 'Administrator'
      : employee.userType;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* <div class="row align-items-center mb-4"><div class="col-md-6"><h3 class="fw-bold">Profile</h3></div></div> */}
      <Text style={styles.title}>Profile</Text>

      {/* col-lg-8 card: read-only employee form */}
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
        <ReadOnlyField label="Employee Email" value={employee.companyDetails?.employeeEmail} shaded />
        <ReadOnlyField label="Designation" value={employee.companyDetails?.designation} shaded />
        <ReadOnlyField label="Shift Timing" value={employee.companyDetails?.shiftTiming} shaded />
        <ReadOnlyField label="Joining Date" value={employee.companyDetails?.joiningDate} shaded />
        <ReadOnlyField label="Leaving Date" value={employee.companyDetails?.leavingDate} shaded />
        <ReadOnlyField label="Status" value={employee.companyDetails?.status} shaded />

        <Text style={[styles.sectionHeading, styles.sectionHeadingSpaced]}>Bank Details</Text>
        <ReadOnlyField label="Account Holder Name" value={employee.bankDetails?.accHolderName} shaded />
        <ReadOnlyField label="Branch Name" value={employee.bankDetails?.branchName} shaded />
        <ReadOnlyField label="Bank Name" value={employee.bankDetails?.bankName} shaded />
        <ReadOnlyField label="Account Number" value={employee.bankDetails?.accNumber} shaded />
        <ReadOnlyField label="IFSC Code" value={employee.bankDetails?.ifscCode} shaded />
        <ReadOnlyField label="PAN Card Number" value={employee.bankDetails?.panCard} shaded />

        <Text style={[styles.sectionHeading, styles.sectionHeadingSpaced]}>User Details</Text>
        <ReadOnlyField label="Role" value={roleLabel} shaded />
        <ReadOnlyField label="Username" value={employee.username} shaded />
      </View>

      {/* col-lg-4: profile summary card */}
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
  // .main-content { background:#fff; min-height:100vh } mobile padding:15px
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    padding: 15,
    paddingBottom: 40,
  },
  // h3.fw-bold (Bootstrap h3 default 1.75rem/28px)
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
  },
  // .card.shadow-sm.border-0 > .card-body (col-lg-8 collapses to full width on phone)
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
  // h5.mt-3 / h5.mt-4 (Bootstrap h5 default 1.25rem/20px)
  sectionHeading: {
    fontSize: 20,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 12,
  },
  sectionHeadingSpaced: {
    marginTop: 24,
  },
});
