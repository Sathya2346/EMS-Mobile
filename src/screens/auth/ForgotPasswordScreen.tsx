import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { forgotPassword } from '../../api/authService';
import AlertBanner from '../../components/auth/AlertBanner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCardLayout from '../../components/auth/AuthCardLayout';
import AuthIllustration from '../../components/auth/AuthIllustration';
import FormInput from '../../components/auth/FormInput';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

/**
 * Exact port of templates/forgot-password.html.
 * DOM order preserved: .login-right (form) THEN .login-left (illustration) —
 * this template's DOM order is the reverse of login.html/reset-password.html,
 * and that is preserved exactly rather than "normalized".
 */
export default function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const result = await forgotPassword(email);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Something went wrong. Please try again.');
      return;
    }
    setMessage(result.message || 'OTP sent to your email.');
    navigation.navigate('VerifyOtp', { email });
  };

  return (
    <AuthCardLayout>
      <View style={styles.loginRight}>
        <Text style={styles.heading}>Forgot Password</Text>

        <View style={styles.field}>
          <FormInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <AuthButton title="Send OTP" variant="orange" loading={submitting} onPress={handleSubmit} />

        {error && (
          <AlertBanner
            variant="danger"
            message={error}
            onDismiss={() => setError(null)}
            style={styles.mt3}
          />
        )}
        {message && (
          <AlertBanner
            variant="success"
            message={message}
            onDismiss={() => setMessage(null)}
            style={styles.mt3}
          />
        )}

        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backLink}>Back to Login</Text>
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
  // <div class="mt-3 text-center"><a>Back to Login</a></div>
  backRow: {
    marginTop: 16,
    alignItems: 'center',
  },
  // default Bootstrap link color (<a> not restyled by login.css here)
  backLink: {
    ...typography.body,
    color: '#0d6efd',
  },
});
