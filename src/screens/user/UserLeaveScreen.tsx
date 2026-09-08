import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { applyLeave, cancelLeave, getUserLeaveData, LeaveRecord } from '../../api/leaveService';
import AttendanceActionButton from '../../components/user/AttendanceActionButton';
import ApplyLeaveModal from '../../components/user/ApplyLeaveModal';
import DateField from '../../components/user/DateField';
import InfoCard from '../../components/user/InfoCard';
import LeaveSummaryCard from '../../components/user/LeaveSummaryCard';
import LeaveTable from '../../components/user/LeaveTable';
import FadeInView from '../../components/shared/FadeInView';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';
import { exportLeavePdf } from '../../utils/leavePdf';

/**
 * Exact port of templates/user/userLeave.html + static/js/userLeave.js.
 * The client-side "Filter" behavior in the original hides/shows existing
 * table rows by From-date rather than re-fetching — reproduced the same
 * way here via a derived `visibleLeaves` filter over the already-loaded
 * `leaves` state.
 */
export default function UserLeaveScreen() {
  const { data } = useEmployee();
  const employee = data?.employee;

  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [balances, setBalances] = useState({ totalLeaves: 0, paidLeaves: 0, sickLeaves: 0, casualLeaves: 0 });
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [visibleLeaves, setVisibleLeaves] = useState<LeaveRecord[] | null>(null); // null = show all (no filter applied yet)
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setLoading(true);
    getUserLeaveData(employee.id)
      .then((result) => {
        setLeaves(result.leaves);
        setBalances({
          totalLeaves: result.totalLeaves ?? 0,
          paidLeaves: result.paidLeaves ?? 0,
          sickLeaves: result.sickLeaves ?? 0,
          casualLeaves: result.casualLeaves ?? 0,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [employee?.id]);

  const handleApplyLeave = async (payload: Parameters<typeof applyLeave>[0]) => {
    const result = await applyLeave(payload);
    if (!result.ok) {
      if (!result.field) {
        Alert.alert(result.message || 'Failed to apply leave!');
      }
      return result;
    }
    if (result.leave) {
      setLeaves((prev) => [result.leave as LeaveRecord, ...prev]);
    }
    setVisibleLeaves(null);
    setModalVisible(false);
    Alert.alert(result.message || 'Leave applied successfully!');
    return result;
  };

  const handleCancel = (leaveId: number) => {
    Alert.alert('Cancel Leave', 'Are you sure you want to cancel this leave request?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          const result = await cancelLeave(leaveId);
          if (result.ok) {
            Alert.alert(result.message || 'Leave cancelled successfully.');
            if (employee) {
              const refreshed = await getUserLeaveData(employee.id);
              setLeaves(refreshed.leaves);
              setVisibleLeaves(null);
            }
          } else {
            Alert.alert(result.message || 'Failed to cancel leave.');
          }
        },
      },
    ]);
  };

  const handleFilter = () => {
    if (!fromFilter && !toFilter) {
      Alert.alert('Please select a From Date or To Date to filter!');
      return;
    }
    const fromMs = fromFilter ? new Date(fromFilter).getTime() : 0;
    const toMs = toFilter ? new Date(toFilter).getTime() : Infinity;
    const filtered = leaves.filter((l) => {
      const rowMs = new Date(l.leaveFromDate).getTime();
      return rowMs >= fromMs && rowMs <= toMs;
    });
    setVisibleLeaves(filtered);
    if (filtered.length === 0) {
      Alert.alert('No leave records found for the selected date range.');
    }
  };

  const handleDownloadPdf = async () => {
    setBusy(true);
    try {
      await exportLeavePdf(
        employee ? `${employee.firstname} ${employee.lastname}` : 'Employee',
        visibleLeaves ?? leaves,
      );
    } catch (err: any) {
      Alert.alert(err?.message || 'Could not generate the PDF report.');
    } finally {
      setBusy(false);
    }
  };

  if (!employee) {
    return <View style={styles.screen} />;
  }

  const rows = visibleLeaves ?? leaves;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Feather name="calendar" size={20} color="#212529" style={styles.titleIcon} />
        <Text style={styles.title}>Leave Management</Text>
      </View>

      {/* Filters card */}
      <View style={styles.filterCard}>
        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <Text style={styles.fieldLabel}>From Date</Text>
            <DateField label="From Date" value={fromFilter} onChange={setFromFilter} />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.fieldLabel}>To Date</Text>
            <DateField label="To Date" value={toFilter} onChange={setToFilter} />
          </View>
        </View>
        <View style={styles.filterButtonsRow}>
          <AttendanceActionButton title="Filter" variant="green" onPress={handleFilter} disabled={busy} />
          <AttendanceActionButton title="PDF" variant="orange" onPress={handleDownloadPdf} disabled={busy} />
        </View>
      </View>

      {/* Info cards */}
      <View style={styles.infoCardsRow}>
        <InfoCard
          variant="green"
          label="Employee Name"
          value={`${employee.firstname} ${employee.lastname}`}
          avatarSource={
            employee.profileImageSrc
              ? { uri: employee.profileImageSrc }
              : require('../../assets/images/default-avatar.png')
          }
        />
        <InfoCard variant="blue" icon="user-check" label="Employee Id" value={String(employee.id)} />
        <InfoCard
          variant="yellow"
          icon="calendar"
          label="Joining Date"
          value={employee.companyDetails?.joiningDate || '-'}
        />
        <InfoCard
          variant="purple"
          icon="briefcase"
          label="Designation"
          value={employee.companyDetails?.designation || '-'}
        />
      </View>

      {/* Summary cards (.row.g-3.fade-in in the source) */}
      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.attendanceBtnGreen} />
      ) : (
        <FadeInView style={styles.summaryRow}>
          <LeaveSummaryCard
            value={balances.totalLeaves}
            label="Total Available Leaves"
            backgroundColor={colors.leaveSummaryGreen}
          />
          <LeaveSummaryCard value={balances.paidLeaves} label="Paid Leave" backgroundColor={colors.leaveSummaryBlue} />
          <LeaveSummaryCard value={balances.sickLeaves} label="Sick Leave" backgroundColor={colors.leaveSummaryYellow} />
          <LeaveSummaryCard
            value={balances.casualLeaves}
            label="Casual Leave"
            backgroundColor={colors.leaveSummaryPurple}
          />
        </FadeInView>
      )}

      {/* Table section (.mt-4.fade-in in the source) */}
      <FadeInView>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeading}>All Requested Leaves</Text>
          <TouchableOpacity style={styles.applyBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.applyBtnText}>+ Apply Leave</Text>
          </TouchableOpacity>
        </View>

        <LeaveTable leaves={rows} onCancel={handleCancel} />
      </FadeInView>

      <ApplyLeaveModal
        visible={modalVisible}
        employeeId={String(employee.id)}
        employeeName={`${employee.firstname} ${employee.lastname}`}
        onClose={() => setModalVisible(false)}
        onSubmit={handleApplyLeave}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.dashboardBodyBackground,
  },
  content: {
    padding: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
  },
  filterCard: {
    backgroundColor: colors.white,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterField: {
    flex: 1,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#212529',
  },
  filterButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  infoCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  tableHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  applyBtn: {
    backgroundColor: colors.leaveApplyBtn,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  applyBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
});
