import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';

interface Props {
  variant: 'green' | 'blue' | 'yellow' | 'purple';
  label: string;
  value: string;
  icon?: string;
  avatarSource?: ImageSourcePropType;
}

const BG: Record<Props['variant'], string> = {
  green: colors.cardGreen,
  blue: colors.cardBlue,
  yellow: colors.cardYellow,
  purple: colors.cardPurple,
};

// .info-card { border-radius:12px; padding:15px; display:flex; align-items:center; gap:10px; color:#333 }
export default function InfoCard({ variant, label, value, icon, avatarSource }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: BG[variant] }]}>
      {avatarSource ? (
        <Image source={avatarSource} style={styles.avatar} />
      ) : (
        icon && <Feather name={icon} size={26} color="#333333" />
      )}
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  // .info-card img { width:50px; height:50px; border-radius:50%; border:3px solid #fff }
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: colors.white,
  },
  textWrap: {
    flexShrink: 1,
  },
  // .info-card h6 { font-weight:600 }
  label: {
    fontWeight: '600',
    color: '#333333',
    fontSize: 14,
  },
  value: {
    color: '#333333',
    fontSize: 14,
    marginTop: 2,
  },
});
