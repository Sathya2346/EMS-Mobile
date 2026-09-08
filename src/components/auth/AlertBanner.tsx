import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

type Variant = 'danger' | 'success';

interface AlertBannerProps {
  variant: Variant;
  message: string;
  onDismiss: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Port of the Bootstrap 5.3.2 markup:
 * <div class="alert alert-{danger|success} alert-dismissible fade show
 *      d-flex align-items-center" role="alert">
 *   <div>{message}</div>
 *   <button type="button" class="btn-close" data-bs-dismiss="alert" ...></button>
 * </div>
 *
 * Used identically (same message-driven visibility) on login.html,
 * forgot-password.html, reset-password.html and verify-otp.html.
 */
export default function AlertBanner({ variant, message, onDismiss, style }: AlertBannerProps) {
  const isDanger = variant === 'danger';
  return (
    <View
      style={[
        styles.alert,
        {
          backgroundColor: isDanger ? colors.alertDangerBg : colors.alertSuccessBg,
          borderColor: isDanger ? colors.alertDangerBorder : colors.alertSuccessBorder,
        },
        style,
      ]}
      accessibilityRole="alert"
    >
      <Text
        style={[
          styles.text,
          { color: isDanger ? colors.alertDangerText : colors.alertSuccessText },
        ]}
      >
        {message}
      </Text>
      <TouchableOpacity
        onPress={onDismiss}
        accessibilityLabel="Close"
        style={styles.closeButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          style={[
            styles.closeGlyph,
            { color: isDanger ? colors.alertDangerText : colors.alertSuccessText },
          ]}
        >
          ×
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // .alert { padding: 1rem; margin-bottom: 1rem; border: 1px solid; border-radius: .375rem; }
  // .d-flex.align-items-center
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  text: {
    ...typography.body,
    flex: 1,
    flexShrink: 1,
  },
  closeButton: {
    marginLeft: 12,
  },
  closeGlyph: {
    fontSize: 20,
    lineHeight: 20,
    fontFamily: typography.body.fontFamily,
  },
});
