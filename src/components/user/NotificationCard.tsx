import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { NotificationItem } from '../../api/notificationService';
import { colors } from '../../theme/colors';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// #temporals.format(n.createdAt, 'dd MMM yyyy, hh:mm a')
function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

interface Props {
  notification: NotificationItem;
  read: boolean;
  onPress: () => void;
}

export default function NotificationCard({ notification, read, onPress }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, read ? styles.borderSecondary : styles.borderPrimary]}
    >
      <View style={styles.titleRow}>
        {notification.leaveStatus === 'Approved' && (
          <Feather name="check-circle" size={16} color="#198754" style={styles.icon} />
        )}
        {notification.leaveStatus === 'Rejected' && (
          <Feather name="x-circle" size={16} color="#dc3545" style={styles.icon} />
        )}
        <Text style={styles.title}>{notification.type} Notification</Text>
      </View>
      <Text style={styles.message}>{notification.message}</Text>
      <Text style={styles.timestamp}>{formatCreatedAt(notification.createdAt)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // .card.notification-card.mb-3.shadow-sm
  card: {
    backgroundColor: colors.white,
    borderRadius: 6,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  // Bootstrap .border-primary (#0d6efd) — unread
  borderPrimary: {
    borderColor: '#0d6efd',
  },
  // Bootstrap .border-secondary (#6c757d) — read
  borderSecondary: {
    borderColor: '#6c757d',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    marginRight: 6,
  },
  // .card-title (Bootstrap h6-ish, 1rem, bold)
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
  },
  message: {
    fontSize: 14,
    color: '#212529',
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12.5,
    color: '#6c757d',
  },
});
