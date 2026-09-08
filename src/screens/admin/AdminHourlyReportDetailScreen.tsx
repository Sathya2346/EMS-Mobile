import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  filterHourlyReports,
  getHourlyReportsForEmployee,
  HourlyReportPageData,
  HourlyReportRow,
} from '../../api/adminHourlyReportService';
import AttendanceActionButton from '../../components/user/AttendanceActionButton';
import DateField from '../../components/user/DateField';
import { colors } from '../../theme/colors';
import { exportAdminHourlyReportPdf } from '../../utils/adminHourlyReportPdf';

/**
 * Exact port of templates/admin/adminHourlyReports.html +
 * adminHourlyReports.js. The source's 4-column table (Time Slot, Task
 * Description, Status, Submitted At) is rendered here as one bordered
 * label/value block per report — the standard "responsive table" mobile
 * adaptation, since 4 columns of free text (task descriptions especially)
 * don't fit a phone width without truncation the source doesn't do. All
 * four fields per report are still shown in full, in the same order.
 */
export default function AdminHourlyReportDetailScreen() {
  const route = useRoute<any>();
  const employeeId: number = route.params?.employeeId;

  const [page, setPage] = useState<HourlyReportPageData | null>(null);
  const [rows, setRows] = useState<HourlyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!employeeId) return;
    setLoading(true);
    getHourlyReportsForEmployee(employeeId)
      .then((data) => {
        setPage(data);
        setRows(data.reports);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [employeeId]);

  const handleFilter = async () => {
    try {
      const data = await filterHourlyReports(employeeId, fromDate || undefined, toDate || undefined);
      setRows(data);
    } catch (err) {
      Alert.alert('Failed to filter reports. See console for details.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!page) return;
    setBusy(true);
    try {
      await exportAdminHourlyReportPdf(`${page.employee.firstname} ${page.employee.lastname}`, rows);
    } catch (err: any) {
      Alert.alert(err?.message || 'Failed to generate PDF.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.attendanceBtnGreen} />
      </View>
    );
  }

  if (error || !page) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Employee not found.'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Feather name="list" size={18} color="#0d6efd" style={styles.headerIcon} />
        <Text style={styles.headerText}>
          Hourly Reports - {page.employee.firstname} {page.employee.lastname}{' '}
          <Text style={styles.headerId}>(ID: {page.employee.id})</Text>
        </Text>
      </View>

      <View style={styles.filterCard}>
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
          <AttendanceActionButton
            title="PDF"
            variant="orange"
            onPress={handleDownloadPdf}
            disabled={busy || rows.length === 0}
          />
        </View>
      </View>

      <View style={styles.tableContainer}>
        {rows.length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No reports found</Text>
          </View>
        ) : (
          rows.map((r, idx) => (
            <View key={idx} style={[styles.reportRow, idx > 0 && styles.reportRowDivider]}>
              <Text style={styles.rowLabel}>Time Slot</Text>
              <Text style={styles.rowValue}>{r.timeSlot || '-'}</Text>
              <Text style={styles.rowLabel}>Task Description</Text>
              <Text style={styles.rowValue}>{r.taskDescription || '-'}</Text>
              <Text style={styles.rowLabel}>Status</Text>
              <Text style={styles.rowValue}>{r.status || '-'}</Text>
              <Text style={styles.rowLabel}>Submitted At</Text>
              <Text style={styles.rowValue}>{r.createdAt || '-'}</Text>
            </View>
          ))
        )}
      </View>
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerIcon: {
    marginRight: 8,
    marginTop: 3,
  },
  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212529',
    flexShrink: 1,
  },
  headerId: {
    fontWeight: '400',
    color: '#6c757d',
    fontSize: 14,
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
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  fieldLabel: {
    fontWeight: '600',
    marginBottom: 6,
    color: '#212529',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  tableContainer: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 4,
  },
  reportRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  reportRowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
  },
  rowLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#6c757d',
    marginTop: 6,
  },
  rowValue: {
    fontSize: 14,
    color: '#212529',
  },
  emptyRow: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.bootstrapMuted,
  },
});
