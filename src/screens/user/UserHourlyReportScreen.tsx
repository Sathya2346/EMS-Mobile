import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { submitHourlyReports } from '../../api/hourlyReportService';
import SelectDropdown from '../../components/user/SelectDropdown';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';

const STATUS_OPTIONS = ['In Progress', 'Completed', 'Pending Review', 'In Meeting'];

interface ReportRow {
  id: number;
  timeSlot: string;
  taskDescription: string;
  status: string;
}

let nextRowId = 1;
const makeRow = (): ReportRow => ({ id: nextRowId++, timeSlot: '', taskDescription: '', status: STATUS_OPTIONS[0] });

/**
 * Exact port of templates/user/userHourlyReport.html: a dynamic-row form
 * (Time Slot, Task Description, Status, Add/Remove) submitted in bulk to
 * `/user/submitHourlyReports`, matching the inline `<script>` behavior
 * exactly (same validation: at least one row needs both a time slot and a
 * task description; other rows are silently skipped, same as the original).
 */
export default function UserHourlyReportScreen() {
  const { data } = useEmployee();
  const employee = data?.employee;
  const [rows, setRows] = useState<ReportRow[]>([makeRow()]);
  const [submitting, setSubmitting] = useState(false);

  const updateRow = (id: number, patch: Partial<ReportRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, makeRow()]);
  const removeRow = (id: number) => setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const handleSubmit = async () => {
    if (!employee) return;
    const employeeName = `${employee.firstname} ${employee.lastname}`;
    const reports = rows
      .filter((r) => r.timeSlot.trim() && r.taskDescription.trim())
      .map((r) => ({
        employeeId: String(employee.id),
        employeeName,
        timeSlot: r.timeSlot.trim(),
        taskDescription: r.taskDescription.trim(),
        status: r.status,
      }));

    if (reports.length === 0) {
      Alert.alert('Please enter at least one time slot and task description before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const ok = await submitHourlyReports(reports);
      if (ok) {
        Alert.alert('Hourly report submitted successfully!');
        setRows([makeRow()]);
      } else {
        Alert.alert('Error submitting reports.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!employee) {
    return <View style={styles.screen} />;
  }

  return (
    <KeyboardAwareScreen>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Feather name="clock" size={18} color="#495057" style={styles.titleIcon} />
        <Text style={styles.title}>Hourly Work Report</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>Submit Work Entries</Text>
          <TouchableOpacity style={styles.addBtnOutline} onPress={addRow}>
            <Feather name="plus" size={14} color="#198754" />
            <Text style={styles.addBtnOutlineText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        {rows.map((row) => (
          <View key={row.id} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.fieldLabel}>Time Slot</Text>
              {rows.length > 1 && (
                <TouchableOpacity onPress={() => removeRow(row.id)} accessibilityLabel="Remove row">
                  <Feather name="trash-2" size={16} color={colors.alertDangerText} />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10:00 AM - 11:00 AM"
              placeholderTextColor="#6c757d"
              value={row.timeSlot}
              onChangeText={(v) => updateRow(row.id, { timeSlot: v })}
            />

            <Text style={styles.fieldLabel}>Task Description</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Enter task details..."
              placeholderTextColor="#6c757d"
              value={row.taskDescription}
              onChangeText={(v) => updateRow(row.id, { taskDescription: v })}
              multiline
              numberOfLines={2}
            />

            <Text style={styles.fieldLabel}>Status</Text>
            <SelectDropdown
              value={row.status}
              options={STATUS_OPTIONS}
              onChange={(v) => updateRow(row.id, { status: v })}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Feather name="send" size={16} color={colors.white} />
          <Text style={styles.submitBtnText}>
            {submitting ? 'Submitting...' : 'Submit All Reports'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAwareScreen>
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
    marginBottom: 20,
  },
  titleIcon: {
    marginRight: 8,
  },
  // h4.fw-bold.text-secondary (Bootstrap h4 default 1.5rem/24px, text-secondary #6c757d)
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6c757d',
  },
  // .card.shadow-sm.border-0.rounded-4
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  // .btn.btn-sm.btn-outline-success
  addBtnOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#198754',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 4,
  },
  addBtnOutlineText: {
    color: '#198754',
    fontWeight: '600',
    fontSize: 13,
  },
  // one table row -> one bordered block per work-entry on mobile
  row: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#212529',
    backgroundColor: colors.white,
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  // button[type=submit].btn-primary (Bootstrap default #0d6efd)
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0d6efd',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
