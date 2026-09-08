import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Wraps a screen's content so the on-screen keyboard never covers the
 * field currently being edited. Applied to every screen/modal with more
 * than one text field (forms), matching what a well-behaved native app
 * does automatically — the original web pages didn't need this (browsers
 * resize the viewport instead), but its RN equivalent is required for the
 * same fields to stay reachable on a phone here.
 */
export default function KeyboardAwareScreen({ children, style }: Props) {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
