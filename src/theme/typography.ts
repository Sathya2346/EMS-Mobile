/**
 * Font family: 'Poppins' (Google Font, weights 400/500/600/700) — loaded in
 * <head> via https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700
 * in every auth template. The .ttf files must be linked into the RN project
 * (see README.md "Fonts" section) as:
 *   Poppins-Regular (400), Poppins-Medium (500),
 *   Poppins-SemiBold (600), Poppins-Bold (700)
 */

export const fonts = {
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
};

/**
 * User/Admin dashboard screens (static/css/user/userDashboard.css etc.) set
 * `body { font-family: 'Segoe UI', sans-serif; }` — Segoe UI is a
 * Windows-proprietary system font with no licensable .ttf to bundle into a
 * cross-platform RN app, so the OS default sans-serif is used as the
 * closest available match (Platform.OS === 'ios' ? 'System' triggers San
 * Francisco; Android defaults to Roboto), same as a browser would fall back
 * to its own sans-serif when Segoe UI isn't installed on non-Windows OSes.
 */
import { Platform } from 'react-native';
export const dashboardFont = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

/**
 * Bootstrap 5.3.2 <h3> default is font-size: 1.75rem (28px) at the base 16px
 * root size. login-left h3 additionally sets font-weight: 700 (login.css).
 * .fw-semibold (Bootstrap utility) = font-weight: 600.
 * Body text defaults to Bootstrap's 1rem (16px) / line-height 1.5.
 * .small / login-left p (14px) come directly from login.css / Bootstrap .small.
 */
export const typography = {
  h3: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 33.6,
  },
  h3SemiBold: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    lineHeight: 33.6,
  },
  // .login-right h3 at max-width: 576px → font-size: 24px (login.css media query)
  h3Mobile: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 28.8,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  // .login-left p
  paragraph: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  // .small / .forgot-link
  small: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
};

/**
 * Bootstrap 5.3.2 default heading sizes at the 16px root, used verbatim by
 * the dashboard/attendance/leave/profile screens (none of them override
 * heading font-size except where noted at each call site).
 */
export const dashboardTypography = {
  // .sidebar h4 { font-weight: 700 } — Bootstrap h4 default 1.5rem/24px
  sidebarHeading: { fontFamily: dashboardFont, fontWeight: '700' as const, fontSize: 24 },
  // .sidebar .nav-link { font-size: 1rem }
  navLink: { fontFamily: dashboardFont, fontWeight: '400' as const, fontSize: 16 },
  // Bootstrap h1 default 2.5rem/40px
  pageTitle: { fontFamily: dashboardFont, fontWeight: '400' as const, fontSize: 40 },
  // Bootstrap h3 default 1.75rem/28px
  sectionTitle: { fontFamily: dashboardFont, fontWeight: '400' as const, fontSize: 28 },
  // Bootstrap h4 default 1.5rem/24px, .fw-bold = 700
  cardName: { fontFamily: dashboardFont, fontWeight: '400' as const, fontSize: 24 },
  body: { fontFamily: dashboardFont, fontWeight: '400' as const, fontSize: 16 },
  small: { fontFamily: dashboardFont, fontWeight: '400' as const, fontSize: 14 },
};
