import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getUserNotifications, NotificationItem } from '../../api/notificationService';
import NotificationCard from '../../components/user/NotificationCard';
import { useEmployee } from '../../context/EmployeeContext';
import { colors } from '../../theme/colors';

/**
 * Exact port of templates/user/userNotification.html. The backend already
 * marks notifications as read when this page's data is fetched (per the
 * original's own comment: "Notifications are already marked as read by the
 * backend when the page loads"); tapping a card here only updates the local
 * unread-border styling, matching userNotification.js exactly — it does not
 * call any additional "mark as read" endpoint, since none exists.
 */
export default function UserNotificationScreen() {
  const { data } = useEmployee();
  const employee = data?.employee;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!employee) return;
    setLoading(true);
    getUserNotifications(employee.id)
      .then(setNotifications)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [employee?.id]);

  const markRead = (id: number) => {
    setReadIds((prev) => new Set(prev).add(id));
  };

  if (!employee) {
    return <View style={styles.screen} />;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top navbar with avatar (right-aligned, as in the source) */}
      <View style={styles.topBar}>
        <Image
          source={
            employee.profileImageSrc
              ? { uri: employee.profileImageSrc }
              : require('../../assets/images/default-avatar.png')
          }
          style={styles.avatar}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.attendanceBtnGreen} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : notifications.length === 0 ? (
        // .alert.alert-info.text-center
        <View style={styles.emptyAlert}>
          <Text style={styles.emptyAlertText}>No notifications available.</Text>
        </View>
      ) : (
        notifications.map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            read={readIds.has(n.id) || n.readStatus}
            onPress={() => markRead(n.id)}
          />
        ))
      )}
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
  // .navbar.bg-white.shadow-sm.sticky-top .container-fluid.justify-content-end
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    marginBottom: 16,
  },
  // .avatar { width:60px; height:60px; border-radius:50% }
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  loader: {
    marginTop: 30,
  },
  errorText: {
    color: colors.alertDangerText,
    textAlign: 'center',
    marginTop: 20,
  },
  // .alert.alert-info.text-center (Bootstrap alert-info)
  emptyAlert: {
    backgroundColor: '#cff4fc',
    borderColor: '#b6effb',
    borderWidth: 1,
    borderRadius: 6,
    padding: 16,
    alignItems: 'center',
  },
  emptyAlertText: {
    color: '#055160',
  },
});
