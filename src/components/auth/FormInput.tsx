import React from 'react';
import { StyleSheet, TextInput, TextInputProps } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Port of a bare `.form-control` (no `.input-group` wrapper), as used for
 * the email field in forgot-password.html and the otp field in
 * verify-otp.html:
 *
 * .form-control {
 *   border-radius: 10px;
 *   border: 1px solid #10b981;
 *   padding: 10px 15px;
 * }
 * .form-control:focus {
 *   box-shadow: 0 0 0 0.2rem rgba(16, 185, 129, 0.25);
 *   border-color: #10b981;
 * }
 */
export default function FormInput(props: TextInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <TextInput
      {...props}
      placeholderTextColor="#6c757d"
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e);
      }}
      style={[styles.input, focused && styles.inputFocused, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    paddingVertical: 10,
    paddingHorizontal: 15,
    ...typography.body,
    color: '#212529',
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primaryGreen,
    // approximates box-shadow: 0 0 0 0.2rem rgba(16,185,129,.25)
    shadowColor: colors.primaryGreen,
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
});
