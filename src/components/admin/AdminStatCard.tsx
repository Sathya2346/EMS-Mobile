import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  value: number;
  label: string;
  color: string;
}

// .card-stats { border-radius:8px; background:#fff; text-align:center; padding:20px }
export default function AdminStatCard({ value, label, color }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  // .card-stats h3 { font-weight:bold }
  value: {
    fontSize: 24,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    marginTop: 4,
    flexDirection: 'row',
  },
});
