/**
 * Colors extracted directly from:
 * - resources/static/css/login.css
 * - Bootstrap 5.3.2 default alert/button colors (alert-danger, alert-success,
 *   btn-success, btn-outline-secondary) used as-is by login.html,
 *   forgot-password.html, reset-password.html and verify-otp.html.
 *
 * Do not add or change any value here without a matching value in the
 * original CSS — this file is the single source of truth for the RN styles.
 */

export const colors = {
  // body background (login.css `body`)
  bodyBackground: '#f9fdfb',

  // .login-container background
  containerBackground: '#ffffff',

  // .login-card background
  cardBackground: '#ffffff',
  // box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05)
  cardShadow: 'rgba(0, 0, 0, 0.05)',

  // .login-left background
  leftBackground: '#d1fae5',
  // .login-left h3 color
  leftHeadingColor: '#111111',
  // .login-left span color
  leftHeadingAccent: '#10b981',
  // .login-left p color
  leftParagraphColor: '#333333',

  // .login-right background
  rightBackground: '#ffffff',

  // .form-control border / .input-group-text border+color / focus ring base
  primaryGreen: '#10b981',
  // .btn-login:hover background
  primaryGreenHover: '#0ea37e',
  // .form-control:focus box-shadow rgba(16, 185, 129, 0.25)
  primaryGreenFocusRing: 'rgba(16, 185, 129, 0.25)',
  // .btn-login:hover box-shadow rgba(16, 185, 129, 0.3)
  primaryGreenHoverShadow: 'rgba(16, 185, 129, 0.3)',

  // .orangeBtn background
  orange: '#FF7423',

  // .forgot-link color
  linkColor: '#111111',
  // .forgot-link:hover color
  linkColorHover: '#10b981',

  // Bootstrap 5.3.2 .btn-success
  bootstrapSuccessBtn: '#198754',

  // Bootstrap 5.3.2 .btn-outline-secondary
  bootstrapSecondary: '#6c757d',

  // Bootstrap 5.3.2 .alert-danger
  alertDangerBg: '#f8d7da',
  alertDangerText: '#842029',
  alertDangerBorder: '#f5c2c7',

  // Bootstrap 5.3.2 .alert-success
  alertSuccessBg: '#d1e7dd',
  alertSuccessText: '#0f5132',
  alertSuccessBorder: '#badbcc',

  // ===== User dashboard (static/css/user/userDashboard.css) =====
  sidebarBackground: '#23d2aa',
  sidebarHoverBackground: '#50d2b3',
  dashboardBodyBackground: '#f5f9f8',
  purple: '#7C3AED', // .bg-purple
  dangerBadge: '#dc3545',

  // Bootstrap 5.3.2 .alert-warning (pending-company-details notice)
  alertWarningBg: 'rgba(255, 193, 7, 0.05)',
  alertWarningBorder: '#ffc107',
  alertWarningHeading: '#856404',
  bootstrapWarningIcon: '#ffc107',
  bootstrapMuted: '#6c757d',

  // ===== status-badges.css (shared Admin & User activity/status colors) =====
  statusWorking: '#16A34A',
  statusPresent: '#0F766E',
  statusBreak: '#F59E0B',
  statusMeeting: '#7C3AED',
  statusIdle: '#64748B',
  statusLeave: '#1D4ED8',
  statusAbsent: '#DC2626',
  statusPartial: '#8B8B8B',
  statusApproved: '#16A34A',
  statusPending: '#F59E0B',
  statusRejected: '#DC2626',
  statusCancelled: '#64748B',

  // ===== Attendance / Leave (static/css/user/userAttendance.css) =====
  attendanceBtnGreen: '#23d2aa', // .btn-month / #filterAttendanceBtn
  attendanceBtnGreenHover: '#50d2b3',
  attendanceBtnOrange: '#FF7423', // .btn-download / #downloadAttendanceBtn
  attendanceBtnOrangeHover: '#e65c0d',
  attendanceMeetingPurple: '#7C3AED', // .btn-meeting
  attendanceMeetingPurpleHover: '#6D28D9',
  attendanceMeetingPurpleActive: '#5B21B6',
  cardGreen: '#d2f8d2',
  cardBlue: '#cce5ff',
  cardYellow: '#fff3cd',
  cardPurple: '#e0d4f7',
  statCardBg: '#f3f4f6',
  calendarBg: '#e9faff',
  calendarLinkBlue: '#007bff',
  calendarTodayBg: '#198754', // bg-success
  calendarSelectedBg: '#0d6efd', // bg-primary
  tableHeaderBg: '#adf0da',
  tableRowHover: '#f8f9fa',

  // ===== Leave (static/css/user/userLeave.css) =====
  leaveSummaryGreen: '#b4f4a6',
  leaveSummaryBlue: '#a8d7ff',
  leaveSummaryYellow: '#ffe58a',
  leaveSummaryPurple: '#c6b8ff',
  leaveTableRow: '#a4cdc0',
  leaveStatusApproved: '#23d2aa',
  leaveStatusPending: '#f2cf42',
  leaveStatusRejected: '#f57c7c',
  leaveStatusCancelled: '#6c757d',
  leaveApplyBtn: '#FF7423',
  leaveModalBorder: '#23d2aa',

  white: '#ffffff',
  transparent: 'transparent',
} as const;
