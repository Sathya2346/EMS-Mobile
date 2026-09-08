import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { BankDetails } from '../../api/employeeService';
import { colors } from '../../theme/colors';

interface Props {
  name: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  bankDetails: BankDetails | null | undefined;
  avatarSource: ImageSourcePropType;
}

// Port of the `.profile-card` block in userProfile.html
export default function ProfileSummaryCard({
  name,
  designation,
  email,
  phone,
  city,
  dateOfBirth,
  bankDetails,
  avatarSource,
}: Props) {
  return (
    <View style={styles.card}>
      {/* .profile-header { background-color:#23d2aa; height:90px } */}
      <View style={styles.header} />
      {/* .profile-img { width:90px; height:90px; border-radius:50%; border:4px solid #fff; position:absolute; top:40px } */}
      <Image source={avatarSource} style={styles.avatar} />

      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.designation}>{designation}</Text>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoItem}>
            <Feather name="mail" size={16} color={colors.attendanceBtnGreen} style={styles.infoIcon} />
            <Text style={styles.infoText}>{email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="phone" size={16} color={colors.attendanceBtnGreen} style={styles.infoIcon} />
            <Text style={styles.infoText}>{phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="map-pin" size={16} color={colors.attendanceBtnGreen} style={styles.infoIcon} />
            <Text style={styles.infoText}>{city}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={16} color={colors.attendanceBtnGreen} style={styles.infoIcon} />
            <Text style={styles.infoText}>{dateOfBirth}</Text>
          </View>
        </View>

        <Text style={styles.bankTitle}>Bank Information</Text>
        <View style={styles.bankInfo}>
          <Text style={styles.bankLine}>
            <Text style={styles.bold}>Bank Name: </Text>
            {bankDetails?.bankName || 'N/A'}
          </Text>
          <Text style={styles.bankLine}>
            <Text style={styles.bold}>Account Number: </Text>
            {bankDetails?.accNumber || 'N/A'}
          </Text>
          <Text style={styles.bankLine}>
            <Text style={styles.bold}>IFSC Code: </Text>
            {bankDetails?.ifscCode || 'N/A'}
          </Text>
          <Text style={styles.bankLine}>
            <Text style={styles.bold}>Pan Card Number: </Text>
            {bankDetails?.panCard || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // .profile-card { max-width:400px; border-radius:15px; box-shadow:0 4px 12px rgba(0,0,0,.1); overflow:hidden }
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 15,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginTop: 24,
  },
  header: {
    backgroundColor: colors.attendanceBtnGreen,
    height: 90,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: colors.white,
    alignSelf: 'center',
    marginTop: -45, // centers the 90px avatar over the header/body seam (profile-img top:40px on a 90px header)
  },
  // .profile-body { padding:70px 25px 25px; text-align:center }
  body: {
    paddingTop: 16,
    paddingHorizontal: 25,
    paddingBottom: 25,
    alignItems: 'center',
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: '#212529',
    marginBottom: 2,
  },
  // .profile-body p { color:#888; font-size:14px; margin-bottom:20px }
  designation: {
    color: '#888888',
    fontSize: 14,
    marginBottom: 20,
  },
  // .section-title, .bank-title { color:#ff5733; font-weight:600; font-size:15px }
  sectionTitle: {
    color: '#ff5733',
    fontWeight: '600',
    fontSize: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
  },
  bankTitle: {
    color: '#ff5733',
    fontWeight: '600',
    fontSize: 15,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 8,
  },
  // .info-box, .bank-info { border-radius:10px; padding:15px 20px; border:1px solid #eee }
  infoBox: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  bankInfo: {
    width: '100%',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eeeeee',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#212529',
  },
  bankLine: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  bold: {
    fontWeight: '700',
  },
});
