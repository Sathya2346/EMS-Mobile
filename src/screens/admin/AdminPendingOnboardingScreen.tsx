import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getPendingOnboarding, PendingOnboardingEmployee } from '../../api/onboardingService';
import { colors } from '../../theme/colors';

/** Exact port of templates/admin/pendingOnboarding.html. */
export default function AdminPendingOnboardingScreen() {
  const navigation = useNavigation<any>();
  const [employees, setEmployees] = useState<PendingOnboardingEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getPendingOnboarding()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.titleRow}>
        <Feather name="clipboard" size={20} color="#198754" style={styles.titleIcon} />
        <Text style={styles.title}>Pending Onboarding Reviews</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.attendanceBtnGreen} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : employees.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="check-circle" size={48} color="#198754" />
          <Text style={styles.emptyHeading}>All caught up!</Text>
          <Text style={styles.emptyText}>No pending onboarding applications at this time.</Text>
        </View>
      ) : (
        employees.map((emp) => (
          <View key={emp.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatarCircle}>
                <Feather name="user" size={18} color="#0d6efd" />
              </View>
              <View style={styles.nameBlock}>
                <Text style={styles.name}>
                  {emp.firstname} {emp.lastname}
                </Text>
                <Text style={styles.idText}>ID: {emp.id}</Text>
              </View>
            </View>

            <Text style={styles.detailLine}>{emp.email}</Text>
            <Text style={styles.detailLine}>{emp.username}</Text>

            {emp.overallStatus === 'DETAILS_SUBMITTED' && (
              <View style={[styles.badge, styles.badgeReview]}>
                <Feather name="search" size={12} color="#744210" />
                <Text style={styles.badgeReviewText}> Ready for Review</Text>
              </View>
            )}
            {emp.overallStatus === 'CHANGES_REQUESTED' && (
              <View style={[styles.badge, styles.badgeCorrection]}>
                <Feather name="refresh-cw" size={12} color="#742a2a" />
                <Text style={styles.badgeCorrectionText}> Changes Pending</Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.reviewBtn}
              onPress={() => navigation.navigate('AdminReviewOnboarding', { employeeId: emp.id })}
            >
              <Text style={styles.reviewBtnText}>Review Details</Text>
              <Feather name="chevron-right" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>
        ))
      )}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6c757d',
  },
  loader: {
    marginTop: 30,
  },
  errorText: {
    color: colors.alertDangerText,
    textAlign: 'center',
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyHeading: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#3a3b45',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flexShrink: 1,
  },
  name: {
    fontWeight: '700',
    fontSize: 15,
    color: '#212529',
  },
  idText: {
    fontSize: 12.5,
    color: '#6c757d',
  },
  detailLine: {
    fontSize: 13.5,
    color: '#212529',
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  badgeReview: {
    backgroundColor: '#f6e05e',
  },
  badgeReviewText: {
    color: '#744210',
    fontSize: 12,
    fontWeight: '600',
  },
  badgeCorrection: {
    backgroundColor: '#feb2b2',
  },
  badgeCorrectionText: {
    color: '#742a2a',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0d6efd',
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
  },
  reviewBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
});
