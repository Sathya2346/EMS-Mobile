import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';

/**
 * Matches the original navigation/user flow:
 *   /login  --(Forgot Password?)-->  /forgot-password
 *   /forgot-password  --(Send OTP, on success)-->  /verify-otp
 *   /verify-otp  --(Verify OTP, on success)-->  /reset-password
 *   /reset-password  --(Reset Password, on success)-->  /login
 *   /forgot-password  --(Back to Login)-->  /login
 * No bottom-tab or drawer navigation exists for the unauthenticated
 * (pre-login) flow in the source app, so a plain stack is the correct
 * navigation adaptation here.
 */
export type AuthStackParamList = {
  Login: { loggedOut?: boolean } | undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string };
  ResetPassword: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // original pages render with no app header/nav chrome
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
}
