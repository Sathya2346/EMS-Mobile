import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';

interface AuthCardLayoutProps {
  children: React.ReactNode;
}

/**
 * Port of:
 * <div class="login-container">
 *   <div class="login-card shadow"> ... </div>
 * </div>
 *
 * .login-container { min-height:100vh; display:flex; align-items:center;
 *   justify-content:center; background-color:#fff; padding:20px; }
 * .login-card { background-color:#fff; border-radius:15px;
 *   box-shadow:0 8px 25px rgba(0,0,0,.05); max-width:950px; width:100%; }
 *
 * @media (max-width: 992px) { .login-card { flex-direction: column; } }
 * A phone viewport is always narrower than 992px, so the mobile
 * (stacked/column) layout is the correct — and only — adaptation here,
 * per the original design's own responsive rules (not a redesign).
 *
 * Section order (which child renders first) is preserved per-screen by
 * the caller, matching each template's own DOM order.
 *
 * These 4 auth screens run with `headerShown: false` (no app header/nav
 * chrome, matching the source), so — unlike the User/Admin drawer screens,
 * whose native header already reserves safe-area space — this layout
 * needs its own `SafeAreaView` to avoid rendering under the status
 * bar/notch or the home indicator on notched devices.
 */
export default function AuthCardLayout({ children }: AuthCardLayoutProps) {
  return (
    <SafeAreaView style={styles.flexFill} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
    backgroundColor: colors.containerBackground,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.containerBackground,
    padding: 20,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 15,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 950,
    // box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
});
