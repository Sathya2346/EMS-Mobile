import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { resendOtp, verifyOtp } from '../../api/authService';
import AlertBanner from '../../components/auth/AlertBanner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCardLayout from '../../components/auth/AuthCardLayout';
import AuthIllustration from '../../components/auth/AuthIllustration';
import FormInput from '../../components/auth/FormInput';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyOtp'>;

/**
 * Exact port of templates/verify-otp.html.
 * DOM order preserved: .login-right (form) THEN .login-left (illustration),
 * same as forgot-password.html.
 */
export default function VerifyOtpScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const result = await verifyOtp(email, otp);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Invalid or expired OTP.');
      return;
    }
    navigation.navigate('ResetPassword', { email });
  };

  const handleResend = async () => {
    setError(null);
    setMessage(null);
    const result = await resendOtp(email);
    if (!result.success) {
      setError(result.error || 'Could not resend OTP.');
      return;
    }
    setMessage(result.message || 'OTP resent successfully.');
  };

  return (
    <AuthCardLayout>
      <View style={styles.loginRight}>
        <Text style={styles.heading}>Enter OTP</Text>

        <View style={styles.field}>
          <FormInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter OTP"
            keyboardType="number-pad"
          />
        </View>

        <AuthButton
          title="Verify OTP"
          variant="orange"
          loading={submitting}
          onPress={handleVerify}
          style={styles.centeredButton}
        />

        {message && (
          <AlertBanner
            variant="success"
            message={message}
            onDismiss={() => setMessage(null)}
            style={styles.mt3}
          />
        )}
        {error && (
          <AlertBanner
            variant="danger"
            message={error}
            onDismiss={() => setError(null)}
            style={styles.mt3}
          />
        )}

        <View style={styles.resendRow}>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <AuthIllustration />
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  loginRight: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 25,
    backgroundColor: colors.rightBackground,
  },
  heading: {
    ...typography.h3Mobile,
    textAlign: 'center',
    color: '#212529',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  mt3: {
    marginTop: 16,
  },
  // .login-right.mx-auto.text-center — centers the (inline-block, non-w-100)
  // Verify OTP button
  centeredButton: {
    alignSelf: 'center',
  },
  // <div class="mt-3 text-center"><a>Resend OTP</a></div>
  resendRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendLink: {
    ...typography.body,
    color: '#0d6efd',
  },
});
