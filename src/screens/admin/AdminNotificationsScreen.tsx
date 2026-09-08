import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AdminNotification,
  getAdminNotifications,
  markAdminNotificationRead,
} from '../../api/adminNotificationService';
import AdminNotificationCard from '../../components/admin/AdminNotificationCard';
import { colors } from '../../theme/colors';
import { safeNavigate } from '../../utils/safeNavigate';

function getGreeting(): string {
  const hours = new Date().getHours();
  if (hours >= 5 && hours < 12) return 'Good Morning!!!';
  if (hours >= 12 && hours < 17) return 'Good Afternoon!!!';
  if (hours >= 17 && hours < 21) return 'Good Evening!!!';
  return 'Good Night!!!';
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Route each notification's "view" tap to the equivalent screen, mirroring notification.js's redirectUrl logic. */
function routeFor(n: AdminNotification): { screen: string; params?: object } {
  if (n.type === 'Leave' || n.type === 'Approved Leave' || n.type === 'Rejected Leave') {
    return { screen: 'AdminLeave' };
  }
  if (n.type === 'Onboarding') {
    return { screen: 'AdminReviewOnboarding', params: { employeeId: n.referenceId } };
  }
  if (n.type === 'HourlyReport') {
    return { screen: 'AdminHourlyReportDetail', params: { employeeId: n.referenceId } };
  }
  if (n.type === 'Attendance') {
    return { screen: 'AdminAttendance' };
  }
  return { screen: 'AdminDashboard' };
}

/** Exact port of templates/admin/adminNotifications.html + static/js/notification.js. */
export default function AdminNotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAdminNotifications()
      .then(setNotifications)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleView = async (n: AdminNotification) => {
    await markAdminNotificationRead(n.id);
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, readStatus: true } : x)));
    const { screen, params } = routeFor(n);
    safeNavigate(navigation, screen, params);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.navbar}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.dateText}>It's {getFormattedDate()}</Text>
        </View>
        <Image source={require('../../assets/images/img2.png')} style={styles.avatar} />
      </View>

      <Text style={styles.title}>Notifications</Text>

      {loading ? (
        <ActivityIndicator color={colors.attendanceBtnGreen} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        notifications.map((n) => (
          <AdminNotificationCard key={n.id} notification={n} onView={() => handleView(n)} />
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
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  greeting: {
    fontWeight: '600',
    fontSize: 16,
    color: '#212529',
  },
  dateText: {
    color: '#6c757d',
    fontSize: 13,
    marginTop: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '400',
    color: '#212529',
    marginBottom: 16,
  },
  loader: {
    marginTop: 30,
  },
  errorText: {
    color: colors.alertDangerText,
    textAlign: 'center',
    marginTop: 20,
  },
});
