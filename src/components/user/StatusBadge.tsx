import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const STATUS_COLOR: Record<string, string> = {
  working: colors.statusWorking,
  present: colors.statusPresent,
  break: colors.statusBreak,
  onbreak: colors.statusBreak,
  meeting: colors.statusMeeting,
  inmeeting: colors.statusMeeting,
  idle: colors.statusIdle,
  checkedout: colors.statusIdle,
  leave: colors.statusLeave,
  absent: colors.statusAbsent,
  partial: colors.statusPartial,
};

function classify(status: string): string {
  const s = status.toLowerCase().replace(/\s+/g, '');
  if (s.includes('present')) return 'present';
  if (s.includes('working')) return 'working';
  if (s.includes('break')) return 'break';
  if (s.includes('meeting')) return 'meeting';
  if (s.includes('idle') || s.includes('checkedout')) return 'idle';
  if (s.includes('leave')) return 'leave';
  if (s.includes('absent')) return 'absent';
  if (s.includes('partial')) return 'partial';
  return 'idle';
}

/**
 * Port of `.status-badge` (status-badges.css) combined with the
 * `.badge-*` background colors from userAttendance.css.
 */
export default function StatusBadge({ status }: { status: string }) {
  const key = classify(status);
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLOR[key] }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // .status-badge { padding:4px 12px; border-radius:20px; font-size:.78rem; font-weight:600; letter-spacing:.4px }
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  text: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
