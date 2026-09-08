import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Variant = 'login' | 'orange' | 'success';

interface AuthButtonProps {
  title: string;
  variant: Variant;
  onPress: (e: GestureResponderEvent) => void;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Three button variants used across the auth screens:
 * - 'login'   → .btn-login   (login.html, full width, background #10b981)
 * - 'orange'  → .orangeBtn   (forgot-password.html "Send OTP",
 *                             verify-otp.html "Verify OTP", background #FF7423)
 * - 'success' → Bootstrap .btn-success (reset-password.html "Reset Password",
 *                             background #198754)
 */
export default function AuthButton({
  title,
  variant,
  onPress,
  loading,
  fullWidth,
  style,
}: AuthButtonProps) {
  const variantStyle =
    variant === 'login'
      ? styles.loginBtn
      : variant === 'orange'
      ? styles.orangeBtn
      : styles.successBtn;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
      style={[
        styles.base,
        variantStyle,
        // Bootstrap .btn is inline-block (shrink-to-content) unless .w-100
        // is applied. Only .btn-login uses w-100 in the source templates;
        // .orangeBtn / .btn-success default to their ancestor's text-align
        // for horizontal placement, which each screen controls via `style`.
        fullWidth ? styles.fullWidth : styles.shrinkToContent,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  fullWidth: {
    width: '100%',
  },
  // default (non w-100) Bootstrap .btn placement: shrink-to-content,
  // aligned to the start of its block container (i.e. left, as in
  // forgot-password.html which has no ancestor .text-center)
  shrinkToContent: {
    alignSelf: 'flex-start',
  },
  // .btn-login { background-color: #10b981; padding: 12px 0; border-radius: 10px; margin-top: 15px; }
  loginBtn: {
    backgroundColor: colors.primaryGreen,
    paddingVertical: 12,
    marginTop: 15,
  },
  // .orangeBtn { background-color: #FF7423; } — Bootstrap .btn base padding (0.375rem 0.75rem → ~10px 15px used here for tap-target parity)
  orangeBtn: {
    backgroundColor: colors.orange,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6, // Bootstrap default .btn border-radius (not overridden by .orangeBtn)
  },
  // Bootstrap .btn-success { background-color: #198754; border-color: #198754; }
  successBtn: {
    backgroundColor: colors.bootstrapSuccessBtn,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  text: {
    ...typography.buttonText,
    color: colors.white,
  },
});
