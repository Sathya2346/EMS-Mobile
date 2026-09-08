import { Alert } from 'react-native';

/**
 * Some templates link to admin screens not yet converted in this delivery
 * (e.g. viewEmployeeDetails.html, updateEmployee.html,
 * pendingOnboarding.html). Rather than silently disabling those buttons —
 * which the source doesn't do — this keeps the real navigation call and
 * only falls back to a friendly notice if the target route isn't
 * registered yet, so the buttons will "just work" the moment each screen
 * lands in a later batch with zero code changes needed here.
 */
export function safeNavigate(navigation: any, routeName: string, params?: object) {
  try {
    navigation.navigate(routeName, params);
  } catch (err) {
    Alert.alert('Coming soon', 'This screen has not been converted yet in this build.');
  }
}
