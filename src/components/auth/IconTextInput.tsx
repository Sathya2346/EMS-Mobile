import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface IconTextInputProps extends TextInputProps {
  /** Feather icon name — 'mail' matches the original `bi-envelope` glyph */
  iconName: string;
}

/**
 * Port of the 2-segment `.input-group` used for the username field on
 * login.html:
 *
 * <div class="mb-3 input-group">
 *   <span class="input-group-text"><i class="bi bi-envelope"></i></span>
 *   <input class="form-control" ... />
 * </div>
 *
 * Resolved CSS cascade (see login.css `.input-group-text`,
 * `.input-group> :first-child`, `.input-group> :last-child` and
 * `.input-group .form-control`):
 * - icon cell: green 1px border on top/left/bottom, no right border,
 *   rounded on the left only
 * - input: full green 1px border on all sides, rounded on the right only
 *   (its own left border sits directly against the icon cell's open right
 *   edge, producing a single dividing line, not a double border)
 */
export default function IconTextInput({ iconName, ...inputProps }: IconTextInputProps) {
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={styles.group}>
      <View style={styles.iconCell}>
        <Feather name={iconName} size={18} color={colors.primaryGreen} />
      </View>
      <TextInput
        {...inputProps}
        placeholderTextColor="#6c757d"
        onFocus={(e) => {
          setFocused(true);
          inputProps.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          inputProps.onBlur?.(e);
        }}
        style={[styles.input, focused && styles.inputFocused, inputProps.style]}
      />
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
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    ...typography.body,
    color: '#212529',
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primaryGreen,
  },
});
