import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { login } from '../../api/authService';
import AlertBanner from '../../components/auth/AlertBanner';
import AuthButton from '../../components/auth/AuthButton';
import AuthCardLayout from '../../components/auth/AuthCardLayout';
import AuthIllustration from '../../components/auth/AuthIllustration';
import IconTextInput from '../../components/auth/IconTextInput';
import PasswordInputGroup from '../../components/auth/PasswordInputGroup';
import { useSession } from '../../context/SessionContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

/**
 * Exact port of templates/login.html.
 * DOM order preserved: .login-left (illustration) THEN .login-right (form).
 */
export default function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useSession();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // th:if="${param.error != null or error != null}" -> 'Invalid username or password.'
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // th:if="${param.logout}" -> 'You have been logged out.'
  const [showLogoutMessage, setShowLogoutMessage] = useState(!!route.params?.loggedOut);

  const handleLogin = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    const result = await login(username, password);
    setSubmitting(false);
    if (!result.success || result.employeeId == null) {
      setErrorMessage(result.error || 'Invalid username or password.');
      return;
    }
    // Successful login: RootNavigator swaps to UserDrawerNavigator once
    // employeeId is set, matching the server's redirect to /user/userDashboard/{id}.
    signIn(result.employeeId, result.role || 'USER');
  };

  return (
    <AuthCardLayout>
      <AuthIllustration />

      <View style={styles.loginRight}>
        <Text style={styles.heading}>Login</Text>

        <View style={styles.field}>
          <IconTextInput
            iconName="mail"
            value={username}
            onChangeText={setUsername}
            placeholder="Enter User name or Email"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.field}>
          <PasswordInputGroup
            value={password}
            onChangeText={setPassword}
            placeholder="Enter Your Password"
          />
        </View>

        <View style={styles.forgotRow}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotLink}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <AuthButton
          title="Login"
          variant="login"
          fullWidth
          loading={submitting}
          onPress={handleLogin}
          style={styles.mb3}
        />

        {errorMessage && (
          <AlertBanner
            variant="danger"
            message={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {showLogoutMessage && (
          <AlertBanner
            variant="success"
            message="You have been logged out."
            onDismiss={() => setShowLogoutMessage(false)}
          />
        )}
      </View>
    </AuthCardLayout>
  );
}

const styles = StyleSheet.create({
  // .login-right { padding: 50px 40px; } -> mobile media query: padding: 40px 25px
  loginRight: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 25,
    backgroundColor: colors.rightBackground,
  },
  // h3.text-center.fw-semibold.mb-3
  heading: {
    ...typography.h3Mobile,
    textAlign: 'center',
    color: '#212529',
    marginBottom: 16,
  },
  // .mb-3
  field: {
    marginBottom: 16,
  },
  // d-flex justify-content-between align-items-center mb-3
  forgotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  // .forgot-link { font-size: 14px; color: #111; }
  forgotLink: {
    ...typography.small,
    color: colors.linkColor,
  },
  mb3: {
    marginBottom: 16,
  },
});
