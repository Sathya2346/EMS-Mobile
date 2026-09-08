import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../theme/colors';

type Variant = 'green' | 'orange' | 'purple';

interface Props {
  title: string;
  variant: Variant;
  onPress: () => void;
  disabled?: boolean;
  /** matches .btn-meeting.active-meeting (pulsing ring while in a meeting) */
  active?: boolean;
}

/**
 * Port of `.btn-month` / `#filterAttendanceBtn` (green), `.btn-download` /
 * `#downloadAttendanceBtn` (orange), and `.btn-meeting` (purple, with the
 * `pulse-meeting` keyframe: `animation: pulse-meeting 1.5s infinite` — a
 * ring that expands from the button's edge and fades out, repeating).
 *
 * That ring is built from an expanding-`box-shadow`, which has no Android
 * equivalent — plain RN `View`s only render `shadowOpacity`/`shadowRadius`
 * on iOS; Android silently drops them. So instead of shadow props (which
 * would make the pulse invisible on Android), the ring is a real
 * `Animated.View` — a rounded rectangle behind the button that scales up
 * while fading out, on a matching 1.5s loop — the standard cross-platform
 * RN equivalent of an expanding box-shadow pulse, rendering identically on
 * both platforms.
 */
export default function AttendanceActionButton({ title, variant, onPress, disabled, active }: Props) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1500, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.5, 0.25, 0] });

  const baseStyle =
    variant === 'green' ? styles.green : variant === 'orange' ? styles.orange : styles.purple;

  return (
    <TouchableOpacity
      style={styles.wrapper}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
    >
      {active && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulseRing,
            { opacity: ringOpacity, transform: [{ scale: ringScale }] },
          ]}
        />
      )}
      <View
        style={[
          styles.base,
          baseStyle,
          active && styles.activeMeeting,
          disabled && styles.disabled,
        ]}
      >
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // the expanding, fading ring behind the button (see class doc comment above)
  pulseRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
    backgroundColor: colors.attendanceMeetingPurple,
  },
  // shared: border-radius:8px !important; min-width:115px; padding:6px 10px
  base: {
    minWidth: 115,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // .btn-month, #filterAttendanceBtn { background-color:#23d2aa }
  green: {
    backgroundColor: colors.attendanceBtnGreen,
  },
  // .btn-download, #downloadAttendanceBtn { background-color:#FF7423 }
  orange: {
    backgroundColor: colors.attendanceBtnOrange,
  },
  // .btn-meeting { background-color:#7C3AED; font-weight:600 }
  purple: {
    backgroundColor: colors.attendanceMeetingPurple,
  },
  // .btn-meeting.active-meeting { background-color:#5B21B6; box-shadow: 0 0 0 3px rgba(124,58,237,.4) }
  activeMeeting: {
    backgroundColor: colors.attendanceMeetingPurpleActive,
    borderWidth: 3,
    borderColor: 'rgba(124, 58, 237, 0.4)',
  },
  // :disabled { opacity:.6 }
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
