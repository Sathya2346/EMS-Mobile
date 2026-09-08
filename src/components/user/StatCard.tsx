import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

interface Props {
  icon: string;
  value: string;
  label: string;
}

// .stat-card { background-color:#f3f4f6; border-radius:12px; padding:15px; text-align:center }
export default function StatCard({ icon, value, label }: Props) {
  return (
    <View style={styles.card}>
      <Feather name={icon} size={22} color="#495057" />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '30%',
    backgroundColor: colors.statCardBg,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginTop: 6,
  },
  label: {
    fontSize: 13,
    color: '#495057',
    marginTop: 2,
  },
});
