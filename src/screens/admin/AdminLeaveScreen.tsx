import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  AdminLeaveRecord,
  deleteAdminLeave,
  filterLeaves,
  filterLeavesForPdf,
  getAllLeaves,
  getLeaveSummary,
  LeaveSummary,
  updateLeaveStatus,
} from '../../api/adminLeaveService';
import { getAllEmployeesForSearch } from '../../api/adminAttendanceService';
import AdminLeaveTable from '../../components/admin/AdminLeaveTable';
import FadeInView from '../../components/shared/FadeInView';
import EmployeeSearchBox from '../../components/admin/EmployeeSearchBox';
import AttendanceActionButton from '../../components/user/AttendanceActionButton';
import DateField from '../../components/user/DateField';
import SelectDropdown from '../../components/user/SelectDropdown';
import LeaveSummaryCard from '../../components/user/LeaveSummaryCard';
import { colors } from '../../theme/colors';
import { exportAdminLeavePdf } from '../../utils/adminLeavePdf';

const STATUS_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

function todayIso(): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, '0');
  const d = String(ist.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Exact port of templates/admin/leave.html + static/js/leave.js: loads a
 * summary + the full leave list on mount (unlike admin/attendance.html,
 * this page's `loadAllLeaves()` genuinely is called on init), then
 * re-filters live as Name/Status/From/To change, matching the source's own
 * debounced auto-filter behavior.
 */
export default function AdminLeaveScreen() {
  const [employees, setEmployees] = useState<Awaited<ReturnType<typeof getAllEmployeesForSearch>>>([]);
  const [summary, setSummary] = useState<LeaveSummary>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [leaves, setLeaves] = useState<AdminLeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [status, setStatus] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const today = todayIso();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getAllEmployeesForSearch().then(setEmployees).catch(() => {});
    getLeaveSummary().then(setSummary).catch((e) => console.error('Error fetching summary:', e));
    setLoading(true);
    getAllLeaves()
      .then(setLeaves)
      .catch((e) => console.error('Error loading leave data:', e))
      .finally(() => setLoading(false));
  }, []);

  const runFilter = async () => {
    if (fromDate && fromDate > today) {
      Alert.alert('Future dates are not allowed!');
      return;
    }
    if (!name && status === 'All' && !fromDate && !toDate) {
      setLoading(true);
      try {
        setLeaves(await getAllLeaves());
      } finally {
        setLoading(false);
      }
      return;
    }
    setLoading(true);
    try {
      const data = await filterLeaves({
        name: name || undefined,
        status: status !== 'All' ? status : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setLeaves(data);
    } catch (err) {
      console.error('Error filtering leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(runFilter, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    runFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fromDate, toDate]);

  const handleApprove = (id: number) => {
    Alert.alert('Confirm', 'Are you sure you want to mark this leave as Approved?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => doUpdateStatus(id, 'Approved') },
    ]);
  };

  const handleReject = (id: number) => {
    Alert.alert('Confirm', 'Are you sure you want to mark this leave as Rejected?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes', onPress: () => doUpdateStatus(id, 'Rejected') },
    ]);
  };

  const doUpdateStatus = async (id: number, newStatus: 'Approved' | 'Rejected') => {
    try {
      const result = await updateLeaveStatus(id, newStatus);
      Alert.alert(result.message);
      await runFilter();
    } catch (err) {
      Alert.alert('Failed to update leave status.');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this leave record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const ok = await deleteAdminLeave(id);
          if (ok) {
            await runFilter();
          } else {
            Alert.alert('Failed to delete leave.');
          }
        },
      },
    ]);
  };

  const handleDownloadPdf = async () => {
    if (fromDate && fromDate > today) {
      Alert.alert('Future dates are not allowed!');
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert('Please select From and To dates first.');
      return;
    }
    setBusy(true);
    try {
      const data = await filterLeavesForPdf({
        name: name || undefined,
        status: status !== 'All' ? status : undefined,
        from: fromDate,
        to: toDate,
      });
      await exportAdminLeavePdf(name, fromDate, toDate, data);
    } catch (err: any) {
      Alert.alert(err?.message || 'Failed to generate Leave PDF. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Feather name="calendar" size={20} color="#212529" style={styles.titleIcon} />
        <Text style={styles.title}>Leave Overview</Text>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.fieldLabel}>Search Employee By Name</Text>
        <EmployeeSearchBox
          employees={employees}
          value={name}
          onChangeText={setName}
          onSelect={(e) => setName(`${e.firstname} ${e.lastname}`)}
        />

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>From Date</Text>
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>To Date</Text>
            <DateField label="To Date" value={toDate} onChange={setToDate} />
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <AttendanceActionButton title="Filter" variant="green" onPress={runFilter} disabled={busy} />
          <AttendanceActionButton title="PDF" variant="orange" onPress={handleDownloadPdf} disabled={busy} />
        </View>
      </View>

      {/* .row.g-3.fade-in in the source */}
      <FadeInView style={styles.summaryRow}>
        <LeaveSummaryCard value={summary.total} label="Total Leaves" backgroundColor={colors.leaveSummaryGreen} />
        <LeaveSummaryCard value={summary.approved} label="Approved Leave" backgroundColor={colors.leaveSummaryBlue} />
        <LeaveSummaryCard value={summary.pending} label="Pending Leave" backgroundColor={colors.leaveSummaryYellow} />
        <LeaveSummaryCard value={summary.rejected} label="Rejected Leave" backgroundColor={colors.leaveSummaryPurple} />
      </FadeInView>

      {/* .mt-4.fade-in in the source */}
      <FadeInView>
        <View style={styles.tableHeaderRow}>
          <Text style={styles.tableHeading}>Employee Leave Requests</Text>
          <View style={styles.statusFilterRow}>
            <Text style={styles.statusFilterLabel}>Filter:</Text>
            <View style={styles.statusDropdownWrap}>
              <SelectDropdown value={status} options={STATUS_OPTIONS} onChange={setStatus} />
            </View>
          </View>
        </View>

        <AdminLeaveTable
          leaves={leaves}
          loading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      </FadeInView>
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
    marginBottom: 16,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
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
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#212529',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  dateField: {
    flex: 1,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 10,
  },
  tableHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  statusFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusFilterLabel: {
    fontWeight: '600',
    color: '#212529',
  },
  statusDropdownWrap: {
    width: 150,
  },
});
