import React from 'react';
import { StyleSheet, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Port of the 3-segment `.input-group` used for the password field on
 * login.html and reset-password.html:
 *
 * <div class="mb-3 input-group">
 *   <span class="input-group-text"><i class="bi bi-lock"></i></span>
 *   <input class="form-control" id="password" ... />
 *   <button class="btn btn-outline-secondary" id="togglePassword">
 *     <i class="bi bi-eye-slash" id="toggleIcon"></i>
 *   </button>
 * </div>
 *
 * Resolved CSS cascade for the 3-segment case:
 * - icon cell: green border top/left/bottom, no right border, rounded left only
 * - input (middle child): green border top/left/bottom, no right border, no radius
 *   (`.input-group>:not(:first-child):not(:last-child)` has higher specificity
 *   than `.input-group .form-control`, so its `border-right: none` wins)
 * - toggle button: NOT `.input-group-text`/`.form-control`, keeps Bootstrap's
 *   default `.btn-outline-secondary` grey (#6c757d) border on top/right/bottom,
 *   no left border, rounded right only — i.e. a different border color than
 *   the rest of the group, exactly as in the original markup.
 *
 * Toggle behavior matches the inline <script> in login.html / reset-password.html:
 * clicking the button flips the TextInput between secure/visible and swaps
 * the eye / eye-off icon.
 */
export default function PasswordInputGroup(props: TextInputProps) {
  const [visible, setVisible] = React.useState(false);
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.group}>
      <View style={styles.iconCell}>
        <Feather name="lock" size={18} color={colors.primaryGreen} />
      </View>
      <TextInput
        {...props}
        secureTextEntry={!visible}
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
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setVisible((v) => !v)}
        accessibilityLabel={visible ? 'Hide password' : 'Show password'}
      >
        <Feather
          name={visible ? 'eye' : 'eye-off'}
          size={18}
          color={colors.bootstrapSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  iconCell: {
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.transparent,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primaryGreen,
    borderRightWidth: 0,
    borderRadius: 0,
    paddingVertical: 10,
    paddingHorizontal: 15,
    ...typography.body,
    color: '#212529',
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primaryGreen,
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: colors.bootstrapSecondary,
    borderLeftWidth: 0,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});
