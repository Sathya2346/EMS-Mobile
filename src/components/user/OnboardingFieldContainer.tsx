import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

interface Props {
  label: string;
  status: string; // 'PENDING' | 'APPROVED' | 'REJECTED'
  rejectionReason?: string;
  hint?: { text: string; state: 'valid' | 'invalid' | 'pending' };
  children: React.ReactNode;
}

/**
 * Port of `.field-container` with its three status states:
 * - pending: white bg, `#e2e8f0` border
 * - approved: `#f0fff4` bg, `#c6f6d5` border, `pointer-events: none` (the
 *   field becomes read-only once HR approves it — reproduced via the
 *   `editable={false}` / `disabled` prop the caller passes to its own
 *   input control based on the same status, not by this wrapper)
 * - rejected: `#fff5f5` bg, `#fed7d7` border, plus the rejection reason
 *   shown in red below the field
 */
export default function OnboardingFieldContainer({ label, status, rejectionReason, hint, children }: Props) {
  const variant = status === 'APPROVED' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'pending';

  return (
    <View
      style={[
        styles.container,
        variant === 'approved' && styles.approved,
        variant === 'rejected' && styles.rejected,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {children}

      {hint && status !== 'APPROVED' && (
        <View style={styles.hintRow}>
          <Feather
            name={hint.state === 'valid' ? 'check-circle' : hint.state === 'invalid' ? 'alert-circle' : 'info'}
            size={12}
            color={hint.state === 'valid' ? '#2ecc71' : hint.state === 'invalid' ? '#e74c3c' : '#94a3b8'}
          />
          <Text
            style={[
              styles.hintText,
              hint.state === 'valid' && styles.hintValid,
              hint.state === 'invalid' && styles.hintInvalid,
              hint.state === 'pending' && styles.hintPending,
            ]}
          >
            {' '}
            {hint.text}
          </Text>
        </View>
      )}

      {status === 'APPROVED' && (
        <View style={styles.approvedRow}>
          <Feather name="check-circle" size={13} color="#2ecc71" />
          <Text style={styles.approvedText}> Verified</Text>
        </View>
      )}

      {status === 'REJECTED' && rejectionReason && (
        <View style={styles.rejectionBox}>
          <Feather name="x-circle" size={12} color="#e74c3c" />
          <Text style={styles.rejectionText}> {rejectionReason}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  approved: {
    backgroundColor: '#f0fff4',
    borderColor: '#c6f6d5',
    opacity: 0.85,
  },
  rejected: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
  },
  label: {
    fontWeight: '700',
    fontSize: 13,
    color: '#2c3e50',
    marginBottom: 6,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  hintText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  hintValid: {
    color: '#2ecc71',
  },
  hintInvalid: {
    color: '#e74c3c',
  },
  hintPending: {
    color: '#94a3b8',
  },
  approvedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  approvedText: {
    color: '#2ecc71',
    fontWeight: '600',
    fontSize: 12.5,
  },
  rejectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  rejectionText: {
    color: '#e74c3c',
    fontSize: 12.5,
    fontWeight: '600',
  },
});
