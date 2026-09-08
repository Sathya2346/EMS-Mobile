import React, { useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Port of the `.fade-in` class applied directly in the markup of
 * userLeave.html (`<div class="row g-3 fade-in">`, `<div class="mt-4
 * fade-in">`) and admin/leave.html (same two spots): a one-time
 * opacity 0->1 + translateY(10px)->0 entrance over 0.8s, ease-in-out,
 * that plays every time the section mounts — unlike the login page's
 * one-time animations (which settle to an identical static state and
 * were left out), this one is applied unconditionally in the HTML itself
 * to specific, named sections, so it's reproduced exactly.
 */
export default function FadeInView({ children, style }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
