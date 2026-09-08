import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart, StackedBarChart } from 'react-native-chart-kit';
import Feather from 'react-native-vector-icons/Feather';
import { AttendanceSummary, getAttendanceSummary } from '../../api/adminService';
import AdminStatCard from '../../components/admin/AdminStatCard';
import { useAdmin } from '../../context/AdminContext';
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
  const today = new Date();
  return today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

const screenWidth = Dimensions.get('window').width;

/**
 * Exact port of templates/admin/dashboard.html + static/js/dashboard.js.
 * `chart.js` (grouped bar + doughnut) is replaced by
 * `react-native-chart-kit` (`StackedBarChart` + `PieChart`), the standard
 * RN equivalent, since Chart.js itself is a canvas/DOM library with no RN
 * build. `react-native-chart-kit`'s `BarChart` only draws a single series,
 * so `StackedBarChart` (which supports multiple series + a legend, same
 * Present/Absent data) is used instead of a true side-by-side grouped bar
 * — the closest available chart type carrying the same data and legend,
 * not a different visualization choice.
 *
 * Source quirk preserved rather than "fixed": the "Today Present" card uses
 * a `text-purple` class, but `admin/dashboard.html` only links Bootstrap +
 * `dashboard.css` — neither defines `.text-purple` (it only exists in
 * other pages' stylesheets, e.g. userAttendance.css, which this page never
 * loads) — so that class has no visual effect in the original and the
 * number renders in the default dark text color, not purple.
 */
export default function AdminDashboardScreen() {
  const { data, loading, error } = useAdmin();
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    getAttendanceSummary()
      .then(setSummary)
      .catch((err) => console.error('Error loading attendance data:', err));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.sidebarBackground} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Unable to load dashboard.'}</Text>
      </View>
    );
  }

  const chartWidth = screenWidth - 30 - 40; // screen padding (15*2) - card padding (20*2)

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Navbar: greeting + date (left), avatar (right) */}
      <View style={styles.navbar}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.dateText}>It's {getFormattedDate()}</Text>
        </View>
        <Image source={require('../../assets/images/img2.png')} style={styles.avatar} />
      </View>

      {/* Stat cards */}
      <View style={styles.statsRow}>
        <AdminStatCard value={data.totalEmployees} label="Total Employees" color="#198754" />
        {/* text-purple has no defined rule on this page — default text color */}
        <AdminStatCard value={data.attenPresent} label="Today Present" color="#212529" />
        <AdminStatCard value={data.attenAbsent} label="Today Absent" color="#0d6efd" />
      </View>
      <TouchableOpacity onPress={() => safeNavigate(navigation, 'AdminPendingOnboarding')}>
        <View style={styles.pendingCard}>
          <Text style={styles.pendingValue}>{data.pendingOnboardingCount}</Text>
          <View style={styles.pendingLabelRow}>
            <Feather name="clipboard" size={14} color="#e74c3c" />
            <Text style={styles.pendingLabel}> Pending Onboarding</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Charts */}
      <View style={styles.chartCard}>
        <Text style={styles.chartHeading}>Attendance For Last Week</Text>
        {summary ? (
          <StackedBarChart
            data={{
              labels: summary.days,
              legend: ['Present', 'Absent'],
              data: summary.days.map((_, i) => [summary.present[i] ?? 0, summary.absent[i] ?? 0]),
              barColors: ['rgba(75, 192, 192, 0.9)', 'rgba(255, 99, 132, 0.9)'],
            }}
            width={chartWidth}
            height={220}
            hideLegend={false}
            fromZero
            chartConfig={chartConfig}
            style={styles.chart}
          />
        ) : (
          <ActivityIndicator color={colors.sidebarBackground} />
        )}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.chartHeading}>Employee Structure</Text>
        <PieChart
          data={[
            {
              name: 'Male',
              population: data.maleCount,
              color: '#e74c3c',
              legendFontColor: '#333',
              legendFontSize: 13,
            },
            {
              name: 'Female',
              population: data.femaleCount,
              color: '#2ecc71',
              legendFontColor: '#333',
              legendFontSize: 13,
            },
          ]}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="0"
        />
      </View>
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(35, 210, 170, ${opacity})`,
  labelColor: () => '#495057',
  barPercentage: 0.6,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
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
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 20,
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
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  pendingCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pendingValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#e74c3c',
  },
  pendingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  pendingLabel: {
    color: '#e74c3c',
    fontSize: 14,
  },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 1,
  },
  chartHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
  },
});
