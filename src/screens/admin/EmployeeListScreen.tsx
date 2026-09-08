import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { EmployeeListItem, getEmployeeList } from '../../api/adminEmployeeService';
import EmployeeCard from '../../components/admin/EmployeeCard';
import FilterEmployeesModal from '../../components/admin/FilterEmployeesModal';
import { colors } from '../../theme/colors';

/**
 * Exact port of templates/admin/profile.html + static/js/profile.js. Both
 * "Search" and "Filter" operate on the already-loaded employee list
 * client-side in the original (no re-fetch), reproduced the same way here.
 */
export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [nameFilter, setNameFilter] = useState('');
  const [idFilter, setIdFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getEmployeeList()
      .then((result) => {
        setEmployees(result.employees);
        setTotalEmployees(result.totalEmployees);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const fullName = `${emp.firstname} ${emp.lastname}`.toLowerCase();
      const idStr = String(emp.id);

      if (appliedSearch) {
        const s = appliedSearch.toLowerCase();
        if (!fullName.includes(s) && !idStr.includes(s)) return false;
      }
      if (nameFilter && !fullName.includes(nameFilter.toLowerCase())) return false;
      if (idFilter && idStr !== idFilter) return false;
      return true;
    });
  }, [employees, appliedSearch, nameFilter, idFilter]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Top navbar avatar */}
      <View style={styles.topBar}>
        <Image source={require('../../assets/images/img2.png')} style={styles.avatarLogo} />
      </View>

      {/* Header row: count + search + filter */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>
          <Text style={styles.empCount}>{totalEmployees}</Text> Employee
        </Text>
      </View>
      <View style={styles.searchFilterRow}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#6c757d"
            value={searchValue}
            onChangeText={setSearchValue}
            onSubmitEditing={() => setAppliedSearch(searchValue.trim())}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={() => setAppliedSearch(searchValue.trim())}
          >
            <Feather name="search" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <Feather name="filter" size={14} color={colors.white} />
          <Text style={styles.filterBtnText}> Filter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.attendanceBtnGreen} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : visibleEmployees.length === 0 ? (
        <View style={styles.noEmployeeMsg}>
          <Text style={styles.noEmployeeText}>Employee Not Found</Text>
        </View>
      ) : (
        <View style={styles.cardsGrid}>
          {visibleEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </View>
      )}

      <FilterEmployeesModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(name, id) => {
          setNameFilter(name);
          setIdFilter(id);
        }}
      />
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
    marginBottom: 12,
  },
  avatarLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerRow: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
  },
  // .emp-count { color:#D44814; font-weight:bold }
  empCount: {
    color: '#D44814',
    fontWeight: '700',
  },
  searchFilterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    color: '#212529',
  },
  // .searchBar { background:#FF7423 }
  searchBtn: {
    backgroundColor: colors.attendanceBtnOrange,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // .filter-btn { background:#23d2aa; border-radius:7px }
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.attendanceBtnGreen,
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  filterBtnText: {
    color: colors.white,
    fontWeight: '600',
  },
  loader: {
    marginTop: 30,
  },
  errorText: {
    color: colors.alertDangerText,
    textAlign: 'center',
    marginTop: 20,
  },
  noEmployeeMsg: {
    marginTop: 30,
    alignItems: 'center',
  },
  noEmployeeText: {
    color: colors.alertDangerText,
    fontSize: 18,
    fontWeight: '600',
  },
  cardsGrid: {
    gap: 16,
  },
});
