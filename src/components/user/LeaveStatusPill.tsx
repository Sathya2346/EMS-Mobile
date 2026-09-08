import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

const STATUS_COLOR: Record<string, string> = {
  approved: colors.leaveStatusApproved,
  pending: colors.leaveStatusPending,
  rejected: colors.leaveStatusRejected,
  rejectedleave: colors.leaveStatusRejected, // matches the "rejectedleave" class used by the leaveUpdated listener
  cancelled: colors.leaveStatusCancelled,
};

// .status { border-radius:5px; padding:8px 12px; font-weight:500; color:#fff }
export default function LeaveStatusPill({ status }: { status: string }) {
  const key = status.toLowerCase();
  return (
    <View style={[styles.pill, { backgroundColor: STATUS_COLOR[key] || colors.leaveStatusCancelled }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  text: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 13,
  },
});
