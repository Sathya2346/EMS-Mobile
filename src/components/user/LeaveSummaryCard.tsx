import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  value: number;
  label: string;
  backgroundColor: string;
}

// .summary-card { border-radius:12px; padding:20px 10px; text-align:center; min-height:100px }
export default function LeaveSummaryCard({ value, label, backgroundColor }: Props) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: 100,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // .summary-card h2 { font-weight:700; font-size:2rem }
  value: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginTop: 4,
    textAlign: 'center',
  },
});
