import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  AdminAttendanceRecord,
  EmployeeSearchResult,
  getAdminAttendanceRange,
  getAllEmployeesForSearch,
} from '../../api/adminAttendanceService';
import AdminAttendanceTable from '../../components/admin/AdminAttendanceTable';
import EmployeeSearchBox from '../../components/admin/EmployeeSearchBox';
import AttendanceActionButton from '../../components/user/AttendanceActionButton';
import DateField from '../../components/user/DateField';
import { colors } from '../../theme/colors';
import { exportAdminAttendancePdf } from '../../utils/adminAttendancePdf';

function todayIso(): string {
  const now = new Date();
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const y = ist.getFullYear();
  const m = String(ist.getMonth() + 1).padStart(2, '0');
  const d = String(ist.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Exact port of templates/admin/attendance.html + static/js/attendance.js.
 *
 * `loadAdminAttendance()` (fetches `/attendance/all` and renders a
 * status-badge-pill table) is defined in the source but never actually
 * invoked anywhere in `initAdminAttendance` — it's dead code. The table
 * really only ever gets populated by the Filter button's handler (colored
 * text status, not a pill), so that's the only rendering path reproduced
 * here; the screen starts with the same "Please select an employee and
 * date range" placeholder row as the source, not a pre-loaded all-employee
 * table.
 */
export default function AdminAttendanceScreen() {
  const [employees, setEmployees] = useState<EmployeeSearchResult[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSearchResult | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [rows, setRows] = useState<AdminAttendanceRecord[] | null>(null);
  const [busy, setBusy] = useState(false);

  const today = useMemo(() => todayIso(), []);

  useEffect(() => {
    getAllEmployeesForSearch()
      .then(setEmployees)
      .catch((e) => console.error('Error loading employees:', e));
  }, []);

  const handleSelectEmployee = (emp: EmployeeSearchResult) => {
    const displayName = `${emp.firstname || ''} ${emp.lastname || ''}`.trim() || emp.username;
    setSearchText(`${displayName} (${emp.username || emp.id})`);
    setSelectedEmployee(emp);
    const joiningDate = emp.companyDetails?.joiningDate;
    setFromDate(joiningDate || today);
    setToDate(today);
  };

  const resolveEmployee = (): EmployeeSearchResult | null => {
    const query = searchText.trim().toLowerCase();
    if (!query) return null;
    if (selectedEmployee) {
      const fn = (selectedEmployee.firstname || '').toLowerCase();
      const ln = (selectedEmployee.lastname || '').toLowerCase();
      const fullName = `${fn} ${ln}`.trim();
      const username = (selectedEmployee.username || '').toLowerCase();
      if (fullName.includes(query) || query.includes(fn) || query.includes(username)) {
        return selectedEmployee;
      }
    }
    const matched = employees.find((emp) => {
      const fn = (emp.firstname || '').toLowerCase();
      const ln = (emp.lastname || '').toLowerCase();
      const fullName = `${fn} ${ln}`.trim();
      const username = (emp.username || '').toLowerCase();
      const email = (emp.email || '').toLowerCase();
      return fullName.includes(query) || fn.includes(query) || ln.includes(query) || username.includes(query) || email.includes(query);
    });
    return matched || null;
  };

  const handleFilter = async () => {
    const emp = resolveEmployee();
    if (!emp) {
      Alert.alert('Please select or type an employee name');
      return;
    }
    setSelectedEmployee(emp);
    const from = fromDate || '2026-01-01';
    const to = toDate || today;
    setBusy(true);
    try {
      const data = await getAdminAttendanceRange(emp.id, from, to);
      setRows(data);
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadPdf = async () => {
    const emp = resolveEmployee();
    if (!emp) {
      Alert.alert('Select employee first');
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert('Select date range');
      return;
    }
    setBusy(true);
    try {
      const data = await getAdminAttendanceRange(emp.id, fromDate, toDate);
      const empName = `${emp.firstname || ''} ${emp.lastname || ''}`.trim();
      await exportAdminAttendancePdf(empName, fromDate, toDate, data);
    } catch (err: any) {
      Alert.alert(err?.message || 'Failed to generate PDF.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Feather name="list" size={20} color="#212529" style={styles.titleIcon} />
        <Text style={styles.title}>Attendance Overview</Text>
      </View>

      <View style={styles.filterCard}>
        <Text style={styles.fieldLabel}>Search Employee By Name</Text>
        <EmployeeSearchBox
          employees={employees}
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            if (!text.trim()) setSelectedEmployee(null);
          }}
          onSelect={handleSelectEmployee}
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
          <AttendanceActionButton title="Filter" variant="green" onPress={handleFilter} disabled={busy} />
          <AttendanceActionButton title="PDF" variant="orange" onPress={handleDownloadPdf} disabled={busy} />
        </View>
      </View>

      <AdminAttendanceTable rows={rows} placeholder="Please select an employee and date range." />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
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
});
