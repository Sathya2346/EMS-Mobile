import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getHourlyReportEmployees, HourlyReportCardEmployee } from '../../api/adminHourlyReportService';
import { colors } from '../../theme/colors';

/** Exact port of templates/admin/adminHourlyReportCards.html. */
export default function AdminHourlyReportCardsScreen() {
  const navigation = useNavigation<any>();
  const [employees, setEmployees] = useState<HourlyReportCardEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    getHourlyReportEmployees()
      .then(setEmployees)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return employees;
    return employees.filter((e) => `${e.firstname} ${e.lastname}`.toLowerCase().includes(query));
  }, [employees, search]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.navbar}>
        <View>
          <Text style={styles.navTitle}>Employee Hourly Reports</Text>
          <Text style={styles.navSubtitle}>Manage employee hourly activity</Text>
        </View>
        <Image source={require('../../assets/images/img2.png')} style={styles.avatar} />
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee..."
          placeholderTextColor="#6c757d"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.searchIconBtn}>
          <Feather name="search" size={16} color={colors.white} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.attendanceBtnGreen} style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.cardsGrid}>
          {visibleEmployees.map((emp) => (
            <View key={emp.id} style={styles.card}>
              <Text style={styles.name}>
                {emp.firstname} {emp.lastname}
              </Text>
              <Text style={styles.email}>{emp.email}</Text>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation.navigate('AdminHourlyReportDetail', { employeeId: emp.id })}
              >
                <Text style={styles.viewBtnText}>View Hourly Report</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
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
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  navTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#212529',
  },
  navSubtitle: {
    color: '#6c757d',
    fontSize: 12.5,
    marginTop: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  searchBox: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.white,
    color: '#212529',
  },
  searchIconBtn: {
    backgroundColor: colors.attendanceBtnOrange,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginTop: 30,
  },
  errorText: {
    color: colors.alertDangerText,
    textAlign: 'center',
    marginTop: 20,
  },
  cardsGrid: {
    gap: 14,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  name: {
    fontWeight: '700',
    fontSize: 16,
    color: '#212529',
  },
  email: {
    color: '#6c757d',
    fontSize: 13.5,
    marginTop: 4,
    marginBottom: 12,
  },
  viewBtn: {
    backgroundColor: colors.attendanceBtnOrange,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  viewBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13.5,
  },
});
