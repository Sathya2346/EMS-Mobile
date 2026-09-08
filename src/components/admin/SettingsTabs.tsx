import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

export type SettingsTabKey = 'leaves' | 'emails' | 'shifts';

const TABS: { key: SettingsTabKey; label: string; icon: string }[] = [
  { key: 'leaves', label: 'Leave Configurations', icon: 'calendar' },
  { key: 'emails', label: 'Email Templates', icon: 'mail' },
  { key: 'shifts', label: 'Shift Configurations', icon: 'clock' },
];

// Port of `.nav-tabs .nav-link` / `.nav-tabs .nav-link.active`
export default function SettingsTabs({
  active,
  onChange,
}: {
  active: SettingsTabKey;
  onChange: (tab: SettingsTabKey) => void;
}) {
  return (
    <View style={styles.row}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onChange(tab.key)}
          >
            <Feather name={tab.icon} size={14} color={isActive ? colors.attendanceBtnGreen : '#718096'} />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    marginBottom: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -2,
  },
  tabActive: {
    borderBottomColor: colors.attendanceBtnGreen,
  },
  tabText: {
    color: '#718096',
    fontWeight: '600',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#1abc9c',
  },
});
