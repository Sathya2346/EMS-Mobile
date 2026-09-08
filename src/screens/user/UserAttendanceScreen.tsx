import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {
  AttendanceRecord,
  endBreak,
  endMeeting,
  getByDate,
  getByRange,
  getLast5,
  saveAttendance,
  startBreak,
  startMeeting,
} from '../../api/attendanceService';
import AttendanceActionButton from '../../components/user/AttendanceActionButton';
import AttendanceTable, { AttendanceRow } from '../../components/user/AttendanceTable';
import Calendar from '../../components/user/Calendar';
import DateField from '../../components/user/DateField';
import InfoCard from '../../components/user/InfoCard';
import StatCard from '../../components/user/StatCard';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';
import {
  format12HourTime,
  formatDateForDB,
  formatDuration,
  formatTimeDisplay,
  formatTimeForDB,
  getISTDateTimeString,
  parseTimeToMs,
} from '../../utils/attendanceTime';
import { exportAttendancePdf } from '../../utils/attendancePdf';

interface Session {
  start: Date;
  end: Date | null;
}

/**
 * Exact port of templates/user/userAttendance.html + static/js/userAttendance.js.
 *
 * Two deliberate scope decisions (internal behavior, not UI elements — see
 * README "Attendance notes"):
 * 1. Idle-time detection (idleTracker.js, a global mouse/keyboard-inactivity
 *    watcher) has no touch-device equivalent, so `idleHour` stays at 0
 *    rather than being faked; the stat card itself is still present.
 * 2. The original also caches session state in `localStorage` purely as an
 *    offline/resilience cache — the server (`loadUserAttendance`) is always
 *    the source of truth and overwrites it on load, so that cache layer is
 *    not reproduced; state simply lives in React state for the session.
 * The static, unused `#downloadModal` and duplicate `#logoutWarningModal`
 * markup in the source (never referenced by userAttendance.js — the real
 * logout-guard modal is injected by the separate userLogoutGuard.js) is not
 * ported as dead markup.
 */
export default function UserAttendanceScreen() {
  const { data } = useEmployee();
  const employee = data?.employee;
  const companyDetails = employee?.companyDetails;

  // ===== attendance state machine (mirrors userAttendance.js) =====
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null);
  const [breakSessions, setBreakSessions] = useState<Session[]>([]);
  const [meetingSessions, setMeetingSessions] = useState<Session[]>([]);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [isInMeeting, setIsInMeeting] = useState(false);
  const [tick, setTick] = useState(0); // forces 1s re-render while timers run

  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // ===== derived durations =====
  const totalBreakMs = useMemo(() => {
    return breakSessions.reduce((total, b) => total + ((b.end ?? new Date()).getTime() - b.start.getTime()), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakSessions, tick]);

  const totalMeetingMs = useMemo(() => {
    return meetingSessions.reduce((total, m) => total + ((m.end ?? new Date()).getTime() - m.start.getTime()), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingSessions, tick]);

  const workMs = useMemo(() => {
    if (!checkInTime) return 0;
    const end = checkOutTime ?? (isOnBreak ? null : new Date());
    if (!end) return null; // paused display while on break, matches original (timer cleared)
    return end.getTime() - checkInTime.getTime() - totalBreakMs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInTime, checkOutTime, isOnBreak, totalBreakMs, tick]);

  const shiftTiming = companyDetails?.shiftTiming || '-';

  const buildTodayRow = useCallback((): AttendanceRow => {
    const date = formatDateForDB(new Date()) || '';
    const meetingTotal = meetingSessions.length > 0 ? `${meetingSessions.length} session(s)` : '-';
    const status = checkOutTime
      ? 'Present'
      : isInMeeting
      ? 'In Meeting'
      : isOnBreak
      ? 'On Break'
      : checkInTime
      ? 'Working'
      : 'Not Checked In';
    return {
      date,
      shift: shiftTiming,
      checkIn: checkInTime ? formatTimeDisplay(checkInTime) : '--:--',
      checkOut: checkOutTime ? formatTimeDisplay(checkOutTime) : '--:--',
      meeting: meetingTotal,
      remarks: '-',
      status,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkInTime, checkOutTime, isInMeeting, isOnBreak, meetingSessions, shiftTiming]);

  // ===== remarks (port of the remarks-building block in loadUserAttendance) =====
  const buildRemarks = (record: AttendanceRecord): string => {
    const remarks: string[] = [];
    if (record.earlyInMinutes && record.earlyInMinutes > 0) {
      remarks.push(`Early Login (+${formatDuration(record.earlyInMinutes * 60000)})`);
    }
    if (record.lateIn || record.isLateIn) {
      remarks.push(`Late (+${formatDuration((record.lateMinutes || 0) * 60000)})`);
    }
    if (record.earlyOut) {
      remarks.push(`Early Leave (-${formatDuration((record.earlyLeaveMinutes || 0) * 60000)})`);
    }
    return remarks.length > 0 ? remarks.join(', ') : '-';
  };

  const recordToRow = (record: AttendanceRecord): AttendanceRow => {
    const meetingMin = record.totalMeetingTime ?? 0;
    return {
      date: record.attendanceDate,
      shift: record.employee?.companyDetails?.shiftTiming || shiftTiming,
      checkIn: format12HourTime(record.checkInTime),
      checkOut: format12HourTime(record.checkOutTime),
      meeting: meetingMin > 0 ? formatDuration(meetingMin * 60000) : '-',
      remarks: buildRemarks(record),
      status: record.status ?? 'Not Checked In',
    };
  };

  // ===== load last 5 records, live-patch today's row =====
  const loadUserAttendance = useCallback(async () => {
    if (!employee) return;
    try {
      const records = await getLast5(employee.id);
      const today = formatDateForDB(new Date());
      const mapped = records.map((r) => (r.attendanceDate === today ? buildTodayRow() : recordToRow(r)));
      if (!mapped.some((r) => r.date === today)) {
        mapped.unshift(buildTodayRow());
      }
      setRows(mapped);
    } catch (err) {
      // matches original's console.error-and-continue on load failure
      console.error('Error loading user attendance:', err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, buildTodayRow]);

  useEffect(() => {
    loadUserAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee?.id]);

  // ===== button handlers =====
  const handleCheckIn = async () => {
    if (checkInTime) return Alert.alert('Already checked in!');
    const now = new Date();
    setCheckInTime(now);
    if (!employee) return;
    await saveAttendance(employee.id, {
      attendanceDate: formatDateForDB(now)!,
      checkInTime: formatTimeForDB(now),
      username: `${employee.firstname} ${employee.lastname}`,
    });
    await loadUserAttendance();
  };

  const handleBreak = async () => {
    if (!checkInTime) return Alert.alert('Check in first!');
    if (checkOutTime) return Alert.alert('Already checked out!');
    if (isInMeeting) return Alert.alert('Please end your meeting before taking a break!');

    if (!isOnBreak) {
      setBreakSessions((prev) => [...prev, { start: new Date(), end: null }]);
      setIsOnBreak(true);
      await startBreak(getISTDateTimeString());
    } else {
      setBreakSessions((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((b) => !b.end);
        if (idx >= 0) copy[idx] = { ...copy[idx], end: new Date() };
        return copy;
      });
      setIsOnBreak(false);
      await endBreak(getISTDateTimeString());
    }
    await loadUserAttendance();
  };

  const handleMeeting = async () => {
    if (!checkInTime) return Alert.alert('Please check in first before starting a meeting!');
    if (checkOutTime) return Alert.alert('You have already checked out for today!');
    if (isOnBreak) return Alert.alert('Please end your break before starting a meeting!');

    if (!isInMeeting) {
      setMeetingSessions((prev) => [...prev, { start: new Date(), end: null }]);
      setIsInMeeting(true);
      try {
        await startMeeting();
      } catch (e) {
        console.error('Error starting meeting:', e);
      }
    } else {
      setMeetingSessions((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((m) => !m.end);
        if (idx >= 0) copy[idx] = { ...copy[idx], end: new Date() };
        return copy;
      });
      setIsInMeeting(false);
      try {
        await endMeeting();
      } catch (e) {
        console.error('Error ending meeting:', e);
      }
    }
    await loadUserAttendance();
  };

  const handleCheckOut = async () => {
    if (!checkInTime) return Alert.alert('Not checked in!');
    if (checkOutTime) return Alert.alert('Already checked out!');
    if (!employee) return;

    let finalMeetingSessions = meetingSessions;
    if (isInMeeting) {
      finalMeetingSessions = meetingSessions.map((m) => (m.end ? m : { ...m, end: new Date() }));
      setMeetingSessions(finalMeetingSessions);
      setIsInMeeting(false);
      await endMeeting();
    }
    let finalBreakSessions = breakSessions;
    if (isOnBreak) {
      finalBreakSessions = breakSessions.map((b) => (b.end ? b : { ...b, end: new Date() }));
      setBreakSessions(finalBreakSessions);
      setIsOnBreak(false);
    }

    const now = new Date();
    setCheckOutTime(now);

    const totalBreak = finalBreakSessions.reduce(
      (t, b) => t + ((b.end ?? now).getTime() - b.start.getTime()),
      0,
    );
    const totalWorkMins = Math.max(0, Math.round((now.getTime() - checkInTime.getTime() - totalBreak) / 60000));
    const totalBreakMins = Math.max(0, Math.round(totalBreak / 60000));

    await saveAttendance(employee.id, {
      attendanceDate: formatDateForDB(now)!,
      checkInTime: formatTimeForDB(checkInTime),
      checkOutTime: formatTimeForDB(now),
      totalWorkTime: totalWorkMins,
      totalBreakTime: totalBreakMins,
      idleTime: 0,
      username: `${employee.firstname} ${employee.lastname}`,
    });
    await loadUserAttendance();
    Alert.alert('Checked out successfully!');
  };

  // ===== calendar day selection =====
  const handleSelectDate = async (isoDate: string) => {
    if (!employee) return;
    try {
      const records = await getByDate(employee.id, isoDate);
      setRows(records.map(recordToRow));
    } catch (err) {
      console.error(err);
    }
  };

  // ===== filter =====
  const handleFilter = async () => {
    if (!fromDate && !toDate) {
      Alert.alert('Please select a From Date or To Date to filter!');
      return;
    }
    if (!employee) return;
    setBusy(true);
    try {
      const records = await getByRange(employee.id, fromDate || '1970-01-01', toDate || '2099-12-31');
      if (records.length > 0) {
        setRows(records.map(recordToRow));
      } else {
        setRows([]);
        Alert.alert('No attendance records found for the selected date range.');
      }
    } catch (err) {
      console.error('Error filtering attendance:', err);
    } finally {
      setBusy(false);
    }
  };

  // ===== PDF export =====
  const handleDownloadPdf = async () => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      Alert.alert("Please select both 'From' and 'To' dates.");
      return;
    }
    const today = formatDateForDB(new Date())!;
    if (toDate && toDate > today) {
      Alert.alert("The 'To' date cannot be greater than today's date.");
      return;
    }
    setBusy(true);
    try {
      let reportRows = rows;
      let dateRangeLabel = `Generated: ${new Date().toLocaleDateString()}`;
      if (fromDate && toDate && employee) {
        const records = await getByRange(employee.id, fromDate, toDate);
        reportRows = records.map(recordToRow);
        dateRangeLabel = `Period: ${fromDate} to ${toDate}`;
      }
      await exportAttendancePdf(
        employee ? `${employee.firstname} ${employee.lastname}` : 'N/A',
        dateRangeLabel,
        reportRows,
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

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* <div class="navbar-custom"><h3><i class="bi bi-clock-history"></i> My Attendance</h3></div> */}
      <View style={styles.navbarCustom}>
        <View style={styles.titleRow}>
          <Feather name="clock" size={20} color="#212529" style={styles.titleIcon} />
          <Text style={styles.title}>My Attendance</Text>
        </View>
      </View>

      {/* Filters card */}
      <View style={styles.filterCard}>
        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <Text style={styles.fieldLabel}>From Date</Text>
            <DateField label="From Date" value={fromDate} onChange={setFromDate} />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.fieldLabel}>To Date</Text>
            <DateField label="To Date" value={toDate} onChange={setToDate} />
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
          value={companyDetails?.joiningDate || '-'}
        />
        <InfoCard
          variant="purple"
          icon="briefcase"
          label="Designation"
          value={companyDetails?.designation || '-'}
        />
      </View>

      {/* Action buttons */}
      <View style={styles.actionButtonsRow}>
        <AttendanceActionButton
          title="Check-In"
          variant="green"
          onPress={handleCheckIn}
          disabled={!!checkInTime}
        />
        <AttendanceActionButton
          title={isOnBreak ? 'Resume' : 'Break'}
          variant="orange"
          onPress={handleBreak}
          disabled={!checkInTime || !!checkOutTime}
        />
        <AttendanceActionButton
          title={isInMeeting ? 'End Meeting' : 'Start Meeting'}
          variant="purple"
          onPress={handleMeeting}
          active={isInMeeting}
          disabled={!checkInTime || !!checkOutTime}
        />
        <AttendanceActionButton
          title="Check-Out"
          variant="green"
          onPress={handleCheckOut}
          disabled={!checkInTime || !!checkOutTime}
        />
      </View>

      {/* Stats + Calendar */}
      <View style={styles.statsCalendarRow}>
        <View style={styles.statsGrid}>
          <StatCard icon="watch" value={workMs == null ? formatDuration(0) : formatDuration(workMs)} label="Working Hours" />
          <StatCard icon="clock" value={checkInTime ? formatTimeDisplay(checkInTime) : '--:--:--'} label="In Time" />
          <StatCard icon="clock" value={checkOutTime ? formatTimeDisplay(checkOutTime) : '--:--:--'} label="Out Time" />
          <StatCard icon="rotate-ccw" value={formatDuration(totalBreakMs)} label="Break Time" />
          <StatCard icon="video" value={formatDuration(totalMeetingMs)} label="Meeting Time" />
          <StatCard icon="user-x" value={formatDuration(0)} label="Idle Time" />
        </View>
        <Calendar onSelectDate={handleSelectDate} />
      </View>

      {/* Attendance Table */}
      <AttendanceTable rows={rows} />
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
  navbarCustom: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
  },
  // .card.p-4.shadow-sm.mb-4
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
    marginTop: 10,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 20,
  },
  statsCalendarRow: {
    gap: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
