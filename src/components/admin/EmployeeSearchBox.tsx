import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { EmployeeSearchResult } from '../../api/adminAttendanceService';
import { colors } from '../../theme/colors';

interface Props {
  employees: EmployeeSearchResult[];
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (employee: EmployeeSearchResult) => void;
  placeholder?: string;
}

function matches(emp: EmployeeSearchResult, query: string): boolean {
  const fn = (emp.firstname || '').toLowerCase();
  const ln = (emp.lastname || '').toLowerCase();
  const fullName = `${fn} ${ln}`.trim();
  const username = (emp.username || '').toLowerCase();
  const email = (emp.email || '').toLowerCase();
  const id = String(emp.id);
  return (
    fn.includes(query) ||
    ln.includes(query) ||
    fullName.includes(query) ||
    username.includes(query) ||
    email.includes(query) ||
    id.includes(query)
  );
}

/** Port of the `#employeeSearch` input + `#employeeSuggestions` dropdown list
 * (shared pattern in admin/attendance.html and admin/leave.html). */
export default function EmployeeSearchBox({ employees, value, onChangeText, onSelect, placeholder }: Props) {
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return [];
    return employees.filter((e) => matches(e, query));
  }, [employees, value]);

  const showList = focused && value.trim().length > 0;

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        placeholder={placeholder || 'Type employee name...'}
        placeholderTextColor="#6c757d"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
      />
      {showList && (
        <View style={styles.suggestionsBox}>
          {suggestions.length === 0 ? (
            <Text style={styles.noMatch}>No matching employees found</Text>
          ) : (
            <FlatList
              data={suggestions}
              keyExtractor={(item) => String(item.id)}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const displayName = `${item.firstname || ''} ${item.lastname || ''}`.trim() || item.username;
                const designation = item.companyDetails?.designation || item.designation || 'N/A';
                return (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => {
                      onSelect(item);
                      setFocused(false);
                    }}
                  >
                    <Text style={styles.suggestionText}>
                      {displayName} ({item.username || item.email || item.id} - {designation})
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    color: '#212529',
  },
  suggestionsBox: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 220,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 20,
  },
  list: {
    maxHeight: 220,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  suggestionText: {
    fontSize: 13.5,
    color: '#212529',
  },
  noMatch: {
    padding: 12,
    color: '#6c757d',
    fontSize: 13,
  },
});
