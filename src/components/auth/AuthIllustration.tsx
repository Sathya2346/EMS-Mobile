import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

/**
 * Exact port of the `.login-left` block reused by login.html,
 * forgot-password.html, reset-password.html and verify-otp.html:
 *
 * <div class="login-left text-center">
 *   <img th:src="@{images/img1.png}" alt="Team Illustration">
 *   <h3>Grow Your <span>Workspace</span> Experience</h3>
 *   <p>It is certainly important because it is only through hard work
 *      that we can achieve the goals of our life. Thus, we all must
 *      work hard.</p>
 * </div>
 *
 * The one-time floatIn/fadeIn/slideUp page-load keyframes elsewhere on
 * this block have no lasting visual effect (they settle to the exact same
 * static state with or without them) and are intentionally not
 * reproduced. `bounceIn` on the image is different: it's
 * `2s infinite alternate` — a continuous up/down float that never stops
 * for as long as the screen is open — so it IS reproduced here via
 * `Animated`, matching the keyframe's translateY(0) -> translateY(-10px).
 */
export default function AuthIllustration() {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -10,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 2000,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bounce]);

  return (
    <View style={styles.loginLeft}>
      <Animated.Image
        source={require('../../assets/images/img1.png')}
        style={[styles.image, { transform: [{ translateY: bounce }] }]}
        resizeMode="contain"
        accessibilityLabel="Team Illustration"
      />
      <Text style={styles.heading}>
        Grow Your <Text style={styles.headingAccent}>Workspace</Text> Experience
      </Text>
      <Text style={styles.paragraph}>
        It is certainly important because it is only through hard work that we
        can achieve the goals of our life. Thus, we all must work hard.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // .login-left { background-color: #d1fae5; padding: 50px 40px; ... }
  // Mobile (<=992px media query): padding: 40px 25px; text-align: center
  loginLeft: {
    backgroundColor: colors.leftBackground,
    paddingVertical: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // .login-left img { width: 250px; height: 250px; max-width: 350px; }
  image: {
    width: 250,
    height: 250,
    maxWidth: 280, // mobile media query: .login-left img { max-width: 280px }
  },
  // .login-left h3 { font-weight: 700; color: #111; margin-top: 25px; }
  heading: {
    ...typography.h3,
    color: colors.leftHeadingColor,
    marginTop: 25,
    textAlign: 'center',
  },
  // .login-left span { color: #10b981; }
  headingAccent: {
    color: colors.leftHeadingAccent,
  },
  // .login-left p { color: #333; font-size: 14px; text-align: center; max-width: 400px; margin-top: 10px; }
  paragraph: {
    ...typography.paragraph,
    color: colors.leftParagraphColor,
    textAlign: 'center',
    maxWidth: 400,
    marginTop: 10,
  },
});
