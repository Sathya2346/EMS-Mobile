import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  AdminSettings,
  addShiftTiming,
  deleteShiftTiming,
  editShiftTiming,
  getAdminSettings,
  saveAdminSettings,
  ShiftTimingItem,
} from '../../api/adminSettingsService';
import AddEditShiftModal from '../../components/admin/AddEditShiftModal';
import EmailTemplateSection from '../../components/admin/EmailTemplateSection';
import KeyboardAwareScreen from '../../components/shared/KeyboardAwareScreen';
import SettingsTabs, { SettingsTabKey } from '../../components/admin/SettingsTabs';
import { colors } from '../../theme/colors';

/**
 * Exact port of templates/admin/settings.html. The three `.nav-tabs`
 * (Leave Configurations / Email Templates / Shift Configurations) share
 * one form and one "Save Configurations" button in the source, EXCEPT the
 * Shifts tab, whose save button is explicitly hidden via the
 * `shown.bs.tab` listener (shift add/edit/delete each submit their own
 * modal form immediately, independent of the main Save button) —
 * reproduced the same way: the save button only renders for the
 * leaves/emails tabs.
 */
export default function AdminSettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('leaves');
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [shifts, setShifts] = useState<ShiftTimingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [shiftModalVisible, setShiftModalVisible] = useState(false);
  const [shiftModalMode, setShiftModalMode] = useState<'add' | 'edit'>('add');
  const [editingShift, setEditingShift] = useState<ShiftTimingItem | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminSettings()
      .then((data) => {
        setSettings(data.settings);
        setShifts(data.shiftTimings);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const ok = await saveAdminSettings(settings);
    setSaving(false);
    Alert.alert(ok ? 'Configurations saved successfully!' : 'Failed to save configurations.');
  };

  const openAddShift = () => {
    setShiftModalMode('add');
    setEditingShift(null);
    setShiftModalVisible(true);
  };

  const openEditShift = (shift: ShiftTimingItem) => {
    setShiftModalMode('edit');
    setEditingShift(shift);
    setShiftModalVisible(true);
  };

  const handleShiftSubmit = async (name: string) => {
    setShiftModalVisible(false);
    const ok =
      shiftModalMode === 'add'
        ? await addShiftTiming(name)
        : await editShiftTiming(editingShift!.id, name);
    if (ok) {
      const data = await getAdminSettings();
      setShifts(data.shiftTimings);
    } else {
      Alert.alert('Failed to save shift timing.');
    }
  };

  const handleDeleteShift = (shift: ShiftTimingItem) => {
    Alert.alert(
      'Delete Shift Timing',
      `Are you sure you want to delete "${shift.name}"?\n\nEmployees currently assigned to this shift will need to be re-assigned.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Shift',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteShiftTiming(shift.id);
            if (ok) {
              setShifts((prev) => prev.filter((s) => s.id !== shift.id));
            } else {
              Alert.alert('Failed to delete shift timing.');
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

  if (error || !settings) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Unable to load settings.'}</Text>
      </View>
    );
  }

  const showSaveButton = activeTab !== 'shifts';

  return (
    <KeyboardAwareScreen>
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Feather name="sliders" size={18} color={colors.white} />
        <Text style={styles.headerText}> Configuration Console</Text>
      </View>

      <View style={styles.bodyCard}>
        <SettingsTabs active={activeTab} onChange={setActiveTab} />

        {activeTab === 'leaves' && (
          <View>
            <View style={styles.field}>
              <Text style={styles.label}>Default Paid Leave</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(settings.initialPaidLeave)}
                onChangeText={(v) => update('initialPaidLeave', Number(v) || 0)}
              />
              <Text style={styles.helpText}>Starting paid leaves for new employees.</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Default Sick Leave</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(settings.initialSickLeave)}
                onChangeText={(v) => update('initialSickLeave', Number(v) || 0)}
              />
              <Text style={styles.helpText}>Starting sick leaves for new employees.</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Default Casual Leave</Text>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={String(settings.initialCasualLeave)}
                onChangeText={(v) => update('initialCasualLeave', Number(v) || 0)}
              />
              <Text style={styles.helpText}>Starting casual leaves for new employees.</Text>
            </View>
          </View>
        )}

        {activeTab === 'emails' && (
          <View>
            <EmailTemplateSection
              icon="file-text"
              title="Welcome Email Template"
              subjectLabel="Welcome Email Subject"
              subjectValue={settings.welcomeEmailSubject}
              onSubjectChange={(v) => update('welcomeEmailSubject', v)}
              bodyLabel="Welcome Email Body"
              bodyValue={settings.welcomeEmailBody}
              onBodyChange={(v) => update('welcomeEmailBody', v)}
              bodyRows={6}
              placeholders={['{username}', '{email}', '{password}']}
            />
            <EmailTemplateSection
              icon="check-square"
              title="Onboarding Submission Receipt Email"
              subjectLabel="Receipt Email Subject"
              subjectValue={settings.receiptEmailSubject}
              onSubjectChange={(v) => update('receiptEmailSubject', v)}
              bodyLabel="Receipt Email Body"
              bodyValue={settings.receiptEmailBody}
              onBodyChange={(v) => update('receiptEmailBody', v)}
              bodyRows={5}
              placeholders={['{name}']}
            />
            <EmailTemplateSection
              icon="alert-triangle"
              title="Changes Requested (Rejection) Email"
              subjectLabel="Changes Requested Subject"
              subjectValue={settings.rejectionEmailSubject}
              onSubjectChange={(v) => update('rejectionEmailSubject', v)}
              bodyLabel="Changes Requested Body"
              bodyValue={settings.rejectionEmailBody}
              onBodyChange={(v) => update('rejectionEmailBody', v)}
              bodyRows={6}
              placeholders={['{name}', '{rejections}']}
            />
            <EmailTemplateSection
              icon="award"
              title="Onboarding Fully Approved Email"
              subjectLabel="Approval Email Subject"
              subjectValue={settings.approvalEmailSubject}
              onSubjectChange={(v) => update('approvalEmailSubject', v)}
              bodyLabel="Approval Email Body"
              bodyValue={settings.approvalEmailBody}
              onBodyChange={(v) => update('approvalEmailBody', v)}
              bodyRows={5}
              placeholders={['{name}']}
            />
            <EmailTemplateSection
              icon="lock"
              title="Password Reset OTP Email"
              subjectLabel="OTP Email Subject"
              subjectValue={settings.otpEmailSubject}
              onSubjectChange={(v) => update('otpEmailSubject', v)}
              bodyLabel="OTP Email Body"
              bodyValue={settings.otpEmailBody}
              onBodyChange={(v) => update('otpEmailBody', v)}
              bodyRows={4}
              placeholders={['{otp}', '{expiry_minutes}']}
            />
            <EmailTemplateSection
              icon="bell"
              title="Admin Onboarding Alert Email"
              subjectLabel="Alert Email Subject"
              subjectValue={settings.adminAlertEmailSubject}
              onSubjectChange={(v) => update('adminAlertEmailSubject', v)}
              bodyLabel="Alert Email Body"
              bodyValue={settings.adminAlertEmailBody}
              onBodyChange={(v) => update('adminAlertEmailBody', v)}
              bodyRows={5}
              placeholders={['{name}', '{email}', '{summary}']}
            />
            <EmailTemplateSection
              icon="calendar"
              title="Leave Approval Email"
              subjectLabel="Leave Approved Subject"
              subjectValue={settings.leaveApprovedEmailSubject}
              onSubjectChange={(v) => update('leaveApprovedEmailSubject', v)}
              bodyLabel="Leave Approved Body"
              bodyValue={settings.leaveApprovedEmailBody}
              onBodyChange={(v) => update('leaveApprovedEmailBody', v)}
              bodyRows={4}
              placeholders={['{name}', '{leave_type}', '{from_date}', '{to_date}']}
            />
            <EmailTemplateSection
              icon="x-square"
              title="Leave Rejection Email"
              subjectLabel="Leave Rejected Subject"
              subjectValue={settings.leaveRejectedEmailSubject}
              onSubjectChange={(v) => update('leaveRejectedEmailSubject', v)}
              bodyLabel="Leave Rejected Body"
              bodyValue={settings.leaveRejectedEmailBody}
              onBodyChange={(v) => update('leaveRejectedEmailBody', v)}
              bodyRows={4}
              placeholders={['{name}', '{leave_type}', '{from_date}', '{to_date}']}
            />
          </View>
        )}

        {activeTab === 'shifts' && (
          <View>
            <View style={styles.shiftsHeaderRow}>
              <Text style={styles.shiftsHeading}>
                <Feather name="clock" size={15} color="#0d6efd" /> Shift Timings
              </Text>
              <TouchableOpacity style={styles.addShiftBtn} onPress={openAddShift}>
                <Feather name="plus" size={14} color={colors.white} />
                <Text style={styles.addShiftBtnText}> Add New Shift</Text>
              </TouchableOpacity>
            </View>

            {shifts.length === 0 ? (
              <Text style={styles.noShiftsText}>No shift timings configured.</Text>
            ) : (
              shifts.map((shift, idx) => (
                <View key={shift.id} style={styles.shiftRow}>
                  <Text style={styles.shiftIndex}>{idx + 1}</Text>
                  <Text style={styles.shiftName}>{shift.name}</Text>
                  <View style={styles.shiftActions}>
                    <TouchableOpacity style={styles.editShiftBtn} onPress={() => openEditShift(shift)}>
                      <Feather name="edit-2" size={13} color="#0d6efd" />
                      <Text style={styles.editShiftBtnText}> Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteShiftBtn} onPress={() => handleDeleteShift(shift)}>
                      <Feather name="trash-2" size={13} color="#dc3545" />
                      <Text style={styles.deleteShiftBtnText}> Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {showSaveButton && (
          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            <Feather name="save" size={16} color={colors.white} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Configurations'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <AddEditShiftModal
        visible={shiftModalVisible}
        mode={shiftModalMode}
        initialName={editingShift?.name}
        onClose={() => setShiftModalVisible(false)}
        onSubmit={handleShiftSubmit}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.attendanceBtnGreen,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  bodyCard: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 1,
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
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: '#212529',
    backgroundColor: colors.white,
  },
  helpText: {
    color: '#6c757d',
    fontSize: 12.5,
    marginTop: 4,
  },
  shiftsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  shiftsHeading: {
    fontWeight: '700',
    color: '#0d6efd',
    fontSize: 15,
  },
  addShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#198754',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  addShiftBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
  noShiftsText: {
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 16,
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f1f1',
    gap: 10,
  },
  shiftIndex: {
    color: '#6c757d',
    width: 20,
  },
  shiftName: {
    flex: 1,
    fontWeight: '600',
    color: '#212529',
  },
  shiftActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0d6efd',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  editShiftBtnText: {
    color: '#0d6efd',
    fontWeight: '600',
    fontSize: 12.5,
  },
  deleteShiftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc3545',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  deleteShiftBtnText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 12.5,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
    alignSelf: 'flex-end',
    paddingHorizontal: 30,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: colors.white,
    fontWeight: '700',
  },
});
