import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { resetPassword } from '../../api/authService';
import AlertBanner from '../../components/auth/AlertBanner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCardLayout from '../../components/auth/AuthCardLayout';
import AuthIllustration from '../../components/auth/AuthIllustration';
import PasswordInputGroup from '../../components/auth/PasswordInputGroup';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

/**
 * Exact port of templates/reset-password.html.
 * DOM order preserved: .login-left (illustration) THEN .login-right (form),
 * same as login.html. The <input type="hidden" name="email"> is represented
 * by the `email` route param instead of a hidden form field (mobile has no
 * DOM to hide it in) and is submitted alongside the password.
 */
export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setMessage(null);
    const result = await resetPassword(email, password);
    setSubmitting(false);
    if (!result.success) {
      setError(result.error || 'Something went wrong. Please try again.');
      return;
    }
    setMessage(result.message || 'Password reset successfully.');
    navigation.navigate('Login', { loggedOut: false });
  };

  return (
    <AuthCardLayout>
      <AuthIllustration />

      <View style={styles.loginRight}>
        <Text style={styles.heading}>Reset Password</Text>

        <View style={styles.field}>
          <PasswordInputGroup
            value={password}
            onChangeText={setPassword}
            placeholder="New Password"
          />
        </View>

        <AuthButton
          title="Reset Password"
          variant="success"
          loading={submitting}
          onPress={handleSubmit}
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
      </View>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  // .login-right.mx-auto.text-center — text-center affects the (inline-block,
  // non-w-100) Reset Password button's horizontal position, not the
  // block-level input group, so only the button gets centered (see
  // `centeredButton` below) rather than the whole panel.
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
  centeredButton: {
    alignSelf: 'center',
  },
});
