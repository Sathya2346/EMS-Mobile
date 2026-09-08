# HR App — React Native (Auth flow + User dashboard)

Exact React Native conversion, delivered in batches and verified against the
Thymeleaf/CSS source for each screen before moving on.

## Batch 1 — Auth flow

| Thymeleaf template              | RN screen                          |
|-----------------------------------|-------------------------------------|
| `templates/login.html`            | `src/screens/auth/LoginScreen.tsx`  |
| `templates/forgot-password.html`  | `src/screens/auth/ForgotPasswordScreen.tsx` |
| `templates/verify-otp.html`       | `src/screens/auth/VerifyOtpScreen.tsx` |
| `templates/reset-password.html`   | `src/screens/auth/ResetPasswordScreen.tsx` |

## Batch 2 — User dashboard + shared navigation shell

| Thymeleaf template                 | RN file                                   |
|--------------------------------------|---------------------------------------------|
| `.sidebar` block (shared by every `templates/user/*.html`) | `src/components/user/UserSidebar.tsx` (drawer content) |
| `templates/user/userDashboard.html`  | `src/screens/user/UserDashboardScreen.tsx` |

The sidebar in the source is a fixed-position panel toggled in/out via a
plain JS class add/remove (`#sidebarToggle` → `.active-sidebar`,
`#closeSidebar` → removes it). A React Navigation **Drawer** reproduces that
exact slide-over-content behavior and additionally gives real multi-screen
navigation between the pages the original reaches via full page loads —
this is the direct RN equivalent, not a redesign.

## Project status
Login/auth, the full User side, and the full Admin side (as originally
scoped in this conversation) are converted and wired into real navigation.
**However, batch 15's audit found this app is not the complete source
project** — see "Batch 15" below for `onboardingForm.html`, `payroll.html`,
and `payslip.html`, which are real, unconverted features.

## Batch 3 — Attendance

| Thymeleaf template                    | RN file |
|------------------------------------------|-----------|
| `templates/user/userAttendance.html`      | `src/screens/user/UserAttendanceScreen.tsx` |
| `static/js/userAttendance.js` (check-in/break/meeting/check-out state machine, calendar, filter, PDF export) | ported into the same screen + `src/utils/attendanceTime.ts`, `src/utils/attendancePdf.ts`, `src/api/attendanceService.ts` |

New shared pieces: `Calendar.tsx` (month grid widget), `AttendanceTable.tsx`,
`StatusBadge.tsx`, `AttendanceActionButton.tsx` (Check-In/Break/Meeting/
Check-Out, including the pulsing `active-meeting` animation), `StatCard.tsx`,
`InfoCard.tsx`, `DateField.tsx` (native date picker standing in for
`<input type="date">`).

### Attendance notes — internal behavior deliberately not reproduced
Two things from `userAttendance.js` are **internal caching/sensing
mechanisms, not UI elements**, and are called out here rather than silently
dropped:
1. **Idle-time detection** (`idleTracker.js`, a global mouse/keyboard
   inactivity watcher) has no meaningful touch-device equivalent, so the
   "Idle Time" stat card is still present but always reads `0m 0s` rather
   than being faked with invented touch-idle heuristics.
2. **`localStorage` session caching** — the original caches check-in/break/
   meeting state in `localStorage` purely as an offline resilience layer;
   `loadUserAttendance()` (the server fetch) is always the actual source of
   truth and overwrites that cache on every load. The RN port keeps state
   in React state for the session and always defers to the server, which
   is the same effective behavior minus the redundant local cache.

Also **not** ported: the static `#downloadModal` and a second, duplicate
`#logoutWarningModal` in `userAttendance.html` — neither is referenced by
`userAttendance.js` (the real logout-guard modal is injected dynamically by
the separate, cross-cutting `userLogoutGuard.js`), so they were dead markup
in the source, not functioning UI.

### PDF export
`react-native-html-to-pdf` converts an HTML table (mirroring the original's
jsPDF + autotable layout/colors) into a PDF, then the OS share sheet
(`Share.share`) is used to save/send it — the mobile equivalent of a browser
file download. Needs native linking; see
https://github.com/christopherdro/react-native-html-to-pdf#installation.

### Reading onboarding documents
`react-native-fs` writes base64-encoded onboarding documents (Aadhar, PAN,
marksheets, certificates) to a temp file so they can be opened via the OS
share sheet. Follow its install steps for iOS (`pod install`) — Android
works out of the box with autolinking.
`@react-native-community/datetimepicker` replaces `<input type="date">` for
the From/To filter fields. Follow its install steps for iOS
(`pod install`) — Android works out of the box with autolinking.

## Batch 4 — Profile

| Thymeleaf template                | RN file |
|--------------------------------------|-----------|
| `templates/user/userProfile.html`     | `src/screens/user/UserProfileScreen.tsx` |

New shared pieces: `ReadOnlyField.tsx` (the `readonly`/`.bg-light`
`.form-control` inputs), `ProfileSummaryCard.tsx` (the `.profile-card`
block). Every field on this screen is read-only in the source — there's no
edit/save flow on `userProfile.html` itself — so the RN port has none
either.

## Batch 5 — Leave

| Thymeleaf template                | RN file |
|--------------------------------------|-----------|
| `templates/user/userLeave.html`       | `src/screens/user/UserLeaveScreen.tsx` |
| `static/js/userLeave.js`              | ported into the same screen + `src/utils/leavePdf.ts`, `src/api/leaveService.ts` |

New shared pieces: `LeaveSummaryCard.tsx` (the 4 colored balance cards),
`LeaveStatusPill.tsx`, `LeaveTable.tsx`, `ApplyLeaveModal.tsx`.

Notes:
- The original's "Filter" button filters the **already-loaded** table rows
  client-side by From-date rather than re-fetching from the server — the RN
  port does the same (`visibleLeaves` derived from `leaves`), not a new
  network call.
- The web `<select>` for Leave Type (exactly 3 fixed options: Paid/Sick/
  Casual) is reproduced as a 3-way chip picker in `ApplyLeaveModal` — the
  natural mobile equivalent for a short, fixed option list — carrying the
  same 3 options and nothing more.
- PDF export follows the same `react-native-html-to-pdf` + share-sheet
  approach as Attendance (see that section above for why).

## Batch 6 — Hourly Report + Notification (completes the User side)

| Thymeleaf template                     | RN file |
|-------------------------------------------|-----------|
| `templates/user/userHourlyReport.html`     | `src/screens/user/UserHourlyReportScreen.tsx` |
| `templates/user/userNotification.html`     | `src/screens/user/UserNotificationScreen.tsx` |

New shared pieces: `SelectDropdown.tsx` (RN equivalent of `<select>` for the
4-option Status field), `NotificationCard.tsx`.

Notes:
- **Hourly Report**: the dynamic-row table (Time Slot / Task Description /
  Status / Add-Remove) becomes one bordered block per row on mobile — same
  fields, same "at least one row needs a time slot + task description, the
  rest are silently skipped" submit validation as the inline `<script>`.
- **Notification**: the backend already marks notifications read when this
  page's data loads (per the original's own code comment); tapping a card
  only updates the local unread-border styling, exactly matching
  `userNotification.js` — no additional "mark as read" call was invented,
  since the source has none.

**The User side is now fully converted**: Login, Forgot Password, Verify
OTP, Reset Password, Dashboard, Profile, Attendance, Leave, Hourly Report,
and Notification all have real routes in `UserDrawerNavigator` / the
sidebar — no inert nav items remain.

## Batch 7 — Admin Dashboard + shared Admin navigation shell

| Thymeleaf template            | RN file |
|----------------------------------|-----------|
| `.sidebar` block (shared by every `templates/admin/*.html`) | `src/components/admin/AdminSidebar.tsx` (drawer content) |
| `templates/admin/dashboard.html`  | `src/screens/admin/AdminDashboardScreen.tsx` |

Same drawer-navigation approach as the User side (`AdminDrawerNavigator.tsx`).
`RootNavigator` now branches on the logged-in user's `userType`
(`ROLE_ADMIN` → Admin drawer, otherwise → User drawer), matching how the
Spring backend redirects to `/admin/dashboard` vs `/user/userDashboard/{id}`
after login.

New shared piece: `AdminStatCard.tsx` (the `.card-stats` blocks).

Notes:
- **Charts**: `chart.js` (grouped bar + doughnut) is replaced by
  `react-native-chart-kit`'s `StackedBarChart` + `PieChart` — the standard
  RN chart library (built on `react-native-svg`), since Chart.js itself is
  a canvas/DOM library with no RN build. `react-native-chart-kit`'s plain
  `BarChart` only draws one series, so `StackedBarChart` (multi-series +
  legend) carries the same Present/Absent data and legend instead of a true
  side-by-side grouped bar — the closest available chart type, not a
  different visualization choice.
- **Source quirk preserved rather than "fixed"**: the "Today Present" stat
  card uses a `text-purple` class in the HTML, but `dashboard.html` only
  links Bootstrap + `dashboard.css` — neither defines `.text-purple` (it
  only exists in other pages' stylesheets that this page never loads) — so
  that class has zero visual effect in the original, and the number renders
  in the default dark text color, not purple. The RN port matches that
  exactly rather than "correcting" it to purple.

## Batch 8 — Add Employee + Employee List

| Thymeleaf template                | RN file |
|--------------------------------------|-----------|
| `templates/admin/addEmployee.html`    | `src/screens/admin/AddEmployeeScreen.tsx` |
| `templates/admin/profile.html`        | `src/screens/admin/EmployeeListScreen.tsx` |

New shared pieces: `EmployeeCard.tsx` (the `.emp-card` block, including the
activity badge and status pill), `FilterEmployeesModal.tsx`.

Notes:
- **Add Employee**: the source's `<input type="hidden" name="profileFile"
  value="">` is always empty on this form (the employee uploads their own
  photo later, during onboarding) — no file picker was added here, since
  that would be new functionality the original doesn't have on this screen.
- **Employee List**: both "Search" and "Filter" operate on the
  already-loaded employee list client-side in the original (`profile.js`),
  not a re-fetch — matched exactly.
- **Forward links to not-yet-built screens**: `addEmployee.html` links to
  "Pending Onboarding", and `profile.html`'s employee cards link to
  View/Edit Employee Details — none of those three screens are converted
  yet. Rather than removing those links or disabling them (which the
  source doesn't do), `src/utils/safeNavigate.ts` keeps the real
  `navigation.navigate` call and only shows a "coming soon" notice if the
  target route isn't registered — so these links will work with zero code
  changes the moment each target screen lands in a later batch.

## Batch 9 — View/Update Employee Details

| Thymeleaf template                        | RN file |
|-----------------------------------------------|-----------|
| `templates/admin/viewEmployeeDetails.html`     | `src/screens/admin/AdminViewEmployeeDetailsScreen.tsx` |
| `templates/admin/updateEmployee.html`          | `src/screens/admin/AdminUpdateEmployeeScreen.tsx` |

These two reuse `ReadOnlyField` and `ProfileSummaryCard` from the User side
(`src/components/user/`) rather than duplicating them, since both templates
render the identical read-only field set / profile-card markup as
`userProfile.html`, just for an arbitrary employee instead of "me".

Notes:
- **View Employee Details**: Add New / Update / Delete actions at the
  bottom, with the same delete confirmation as the source's
  `onclick="return confirm(...)"`.
- **Update Employee**: only Company Details are editable here (Employee
  Email, Designation, Shift Timing, Joining Date, Leaving Date, Status) —
  matching the source form exactly; everything else is read-only, shown on
  the View screen instead. The inline "Strict Validation Script" in the
  source only ever wires up one field (its `fields` config object has a
  single entry for `companyDetails.employeeEmail`), so the PAN-card-specific
  and auto-focus-next branches inside that script are unreachable dead code
  on this form — only the live email-format check + submit-button gating
  that the config actually exercises was reproduced.
- `AdminViewEmployeeDetails` / `AdminUpdateEmployee` are now real registered
  routes, so the `safeNavigate` calls from the Employee List cards (batch 8)
  now resolve normally instead of showing "coming soon".

## Batch 10 — Pending Onboarding + Review Onboarding

| Thymeleaf template                    | RN file |
|-------------------------------------------|-----------|
| `templates/admin/pendingOnboarding.html`    | `src/screens/admin/AdminPendingOnboardingScreen.tsx` |
| `templates/admin/reviewOnboarding.html`     | `src/screens/admin/AdminReviewOnboardingScreen.tsx` |

New shared pieces: `ReviewFieldControl.tsx` (the repeated field-value +
Approve/Reject or Pending/Approve/Reject + rejection-reason block used
~28 times in the source), `openBase64Document.ts`.

Notes:
- **Review Onboarding** is config-driven (`FieldConfig[]` arrays in the
  screen file) rather than 28 hand-written copies of the same JSX block —
  but every field, its exact label, its control type (plain Approve/Reject
  radios for most fields vs. the Pending/Approve/Reject select used only
  for the 8 semester marksheets + 3 exit certificates), and every document
  link is preserved 1:1 from the source.
- The hidden `cityStatus` field, which the source keeps silently synced to
  `addressStatus` (`<input type="hidden" th:field="*{cityStatus}"
  th:value="*{addressStatus}">`), is reproduced the same way — there's no
  separate visible control for it.
- **Document links**: Aadhar/PAN/marksheets/certificates are base64-encoded
  files with `data:application/pdf;base64,...` download links in the
  source. `openBase64Document.ts` writes that same base64 to a temp file
  (via `react-native-fs`) and hands it to the OS share sheet, so the admin
  can open it in any installed PDF viewer or save it — the mobile
  equivalent of a browser file download, same pattern as the Attendance/
  Leave PDF export.
- `AdminPendingOnboarding` / `AdminReviewOnboarding` are now real
  registered routes, so the `safeNavigate` calls from the Dashboard and
  Add Employee screens (batches 7–8) now resolve normally.

## Batch 11 — Admin Attendance

| Thymeleaf template                | RN file |
|--------------------------------------|-----------|
| `templates/admin/attendance.html`     | `src/screens/admin/AdminAttendanceScreen.tsx` |
| `static/js/attendance.js`             | ported into the same screen + `src/utils/adminAttendancePdf.ts`, `src/api/adminAttendanceService.ts` |

New shared piece: `EmployeeSearchBox.tsx` (the name-search-with-suggestions
box — also reused as-is by Admin Leave, batch 12, which has the identical
pattern), `AdminAttendanceTable.tsx`.

Notes:
- **Dead code not reproduced**: `attendance.js` defines `loadAdminAttendance()`
  (fetches `/attendance/all` and renders the table with status-badge pills),
  but that function is never actually called anywhere in
  `initAdminAttendance` — it's unused. The table in the real app only ever
  gets populated by the Filter button's own handler (colored text status,
  not a pill), so that's the only rendering path this screen reproduces.
  The screen starts with the same "Please select an employee and date
  range" placeholder as the source, not a pre-loaded all-employee table.
- Employee search resolves the same way as the source: exact/partial name,
  username, or email match against the already-loaded `/admin/all` list,
  client-side — no separate search endpoint.
- PDF export follows the same `react-native-html-to-pdf` + share-sheet
  pattern as the User-side Attendance/Leave PDFs, matching the source's
  landscape layout and column order exactly.

## Batch 12 — Admin Leave

| Thymeleaf template            | RN file |
|----------------------------------|-----------|
| `templates/admin/leave.html`      | `src/screens/admin/AdminLeaveScreen.tsx` |
| `static/js/leave.js`              | ported into the same screen + `src/utils/adminLeavePdf.ts`, `src/api/adminLeaveService.ts` |

New shared piece: `AdminLeaveTable.tsx` (reuses `LeaveStatusPill` from the
User side — same status/color system). `EmployeeSearchBox.tsx` from batch
11 is reused as-is here too.

Notes:
- Unlike `admin/attendance.html`'s dead `loadAdminAttendance()`, this
  page's `loadAllLeaves()` genuinely **is** called on init in `leave.js` —
  so, matching that, the screen loads the full leave list and summary
  immediately on mount rather than starting from a placeholder.
- **Live auto-filtering** matches the source exactly: typing in the name
  field re-filters after a debounce, while changing the status dropdown or
  either date re-filters immediately — same as the `input`/`change`
  listeners in `leave.js`. When every filter is empty, it falls back to the
  same "show everything" behavior as `filterLeaves()`.
- Approve/Reject/Delete all show the same confirmation prompt as the
  source's `confirm(...)` calls before hitting the network.
- Summary card **labels intentionally don't match their variable names** —
  e.g. the card populated from `data.approved` is labeled "Approved Leave"
  but sits in a `bg-blue` card, not green — reproduced exactly as authored
  in the source HTML, not "corrected" to more intuitive colors.

## Batch 13 — Admin Hourly Reports (+ cards)

| Thymeleaf template                          | RN file |
|--------------------------------------------------|-----------|
| `templates/admin/adminHourlyReportCards.html`      | `src/screens/admin/AdminHourlyReportCardsScreen.tsx` |
| `templates/admin/adminHourlyReports.html`          | `src/screens/admin/AdminHourlyReportDetailScreen.tsx` |
| `static/js/adminHourlyReports.js`                  | ported into the detail screen + `src/utils/adminHourlyReportPdf.ts`, `src/api/adminHourlyReportService.ts` |

Notes:
- **Cards screen**: search-by-name (client-side, matching the source's
  `keyup` listener) over employee cards, each linking to that employee's
  report detail screen.
- **Detail screen's table**: the source's 4-column table (Time Slot, Task
  Description, Status, Submitted At) is rendered as one bordered
  label/value block per report instead of literal columns — the standard
  mobile "responsive table" adaptation, since free-text task descriptions
  don't fit alongside 3 other columns on a phone width without truncating
  content the source never truncates. All four fields are still shown in
  full, in the same order, for every report.

## Responsiveness & font audit (applies across every batch so far)

Beyond the per-screen work above, this pass specifically checked two
things the user asked about directly: **does every screen behave properly
across device sizes**, and **does the font actually match**.

**Fixed:**
- `AuthCardLayout` (the only header-less screens — Login/Forgot Password/
  Verify OTP/Reset Password all use `headerShown: false`) had no
  `SafeAreaView`, so content could render under the status bar/notch or
  the home indicator on notched phones. Added `SafeAreaView` from
  `react-native-safe-area-context`. The User/Admin drawer screens don't
  need this — their native header already reserves safe-area space.
- Added `KeyboardAvoidingView` (or the new shared `KeyboardAwareScreen`
  wrapper) to every multi-field form/modal that was missing it: Add
  Employee, Update Employee, Hourly Report (user-side), Review Onboarding,
  Apply Leave modal, Filter Employees modal. Without this, the on-screen
  keyboard could cover the field being edited — something the original
  web pages never had to handle (browsers resize the viewport instead).

**Verified already correct:**
- Every screen is wrapped in a `ScrollView`, so content can't get clipped
  vertically regardless of screen height.
- Card/info grids use `flexWrap: 'wrap'` with `gap`, not fixed side-by-side
  columns, so they reflow correctly from the smallest phones up through
  tablets.
- Wide data tables (Attendance, Leave, Hourly Reports) use a horizontal
  `ScrollView` with fixed column widths — the direct RN equivalent of the
  source's own `.table-container { overflow-x: auto }`, not a new pattern.
- Fixed-pixel elements ported from the CSS (e.g. the 250×250 illustration
  image, 120×120 profile avatars, the 150px status-filter dropdown) all
  fit comfortably within the narrowest common device width (~320dp) with
  room to spare, so they were left at their exact source pixel values
  rather than being scaled — changing them would mean deviating from the
  original's own fixed sizing for no benefit.
- **Fonts**: every Auth-flow file (`src/screens/auth/*`,
  `src/components/auth/*`) references the shared Poppins `typography`
  object — confirmed via a full-repo grep, not spot-checked — so all four
  weights (400/500/600/700) are applied exactly as declared in
  `login.css`. Dashboard-style screens (User/Admin) don't set an explicit
  `fontFamily` and so fall back to React Native's own default (San
  Francisco on iOS, Roboto on Android) — this is the correct match for the
  source's `body { font-family: 'Segoe UI', sans-serif }`, since Segoe UI
  is a Windows-only font that any non-Windows browser already falls back
  to its own platform sans-serif for; RN doing the same thing is
  equivalent behavior, not an approximation.

## Batch 14 — Admin Notifications + Settings (completes the app)

| Thymeleaf template                    | RN file |
|-------------------------------------------|-----------|
| `templates/admin/adminNotifications.html`   | `src/screens/admin/AdminNotificationsScreen.tsx` |
| `templates/admin/settings.html`             | `src/screens/admin/AdminSettingsScreen.tsx` |

New shared pieces: `AdminNotificationCard.tsx`, `SettingsTabs.tsx`,
`EmailTemplateSection.tsx` (the repeated 8 email-template blocks),
`AddEditShiftModal.tsx`.

Notes:
- **Notifications**: per-type icon/color and card content exactly matches
  `notification.js`'s per-`type` branches (Leave/Approved Leave/Rejected
  Leave, Onboarding, HourlyReport, Attendance, default). Tapping "view"
  marks the notification read and routes to the equivalent screen
  (Leave→Attendance/Leave list, Onboarding→that employee's review screen,
  HourlyReport→that employee's report detail, Attendance→attendance list),
  same as the source's `redirectUrl` logic — via `safeNavigate` since some
  of those targets are screens built in earlier batches.
- **Settings**: 3 tabs sharing one form, matching the source's own
  structure — Leave Configurations (3 number fields), Email Templates (8
  full subject+body+placeholder sections, all 8 reproduced), and Shift
  Configurations (list + Add/Edit modals + delete confirmation). The
  source explicitly **hides** the main "Save Configurations" button while
  the Shifts tab is active (shift add/edit/delete each save immediately
  via their own modal, independent of the main form) — reproduced exactly:
  the save button only renders for the Leaves/Emails tabs.
- The delete-shift confirmation is a native `Alert.alert` (with the shift
  name and the same "employees will need to be re-assigned" warning text)
  rather than a custom modal — equivalent content and behavior to the
  source's Bootstrap confirmation modal, using the platform's native
  confirm dialog instead of reproducing a bespoke modal for one bit of
  static text.

**This completes the entire application** — every screen in both
`templates/user/` and `templates/admin/` now has a real, registered route.
Both `UserSidebar.tsx` and `AdminSidebar.tsx` have zero inert
(`route: null`) items remaining.

## Batch 15 — Full audit (colors, icons, hover, animation, responsiveness) + one important correction

Requested explicitly: a complete re-check of UI fidelity, hover/press
feedback, responsiveness, color accuracy, and animations across every
batch — not just the newest one. Method: grepped every CSS file in the
source for `:hover`, `@keyframes`, `animation:`, and `transition` to build
a complete inventory, then cross-checked it against what was built, rather
than spot-checking a few screens.

### Correction to the earlier "this completes the entire application" claim
That claim was **wrong**. The audit surfaced templates that were never
converted:

| Template | What it is | Status |
|---|---|---|
| `templates/user/onboardingForm.html` (654 lines) | The employee's own self-service onboarding wizard — the actual submission side of the flow `reviewOnboarding.html` (batch 10) reviews | **Not converted — real gap** |
| `templates/payroll.html` | A distinct Payroll feature | **Not converted — real gap** |
| `templates/payslip.html` | A distinct Payslip feature | **Not converted — real gap** |
| `templates/error.html` | Generic error page | Not converted (low priority) |
| `templates/user/userDetails.html` | Posts to the same `/admin/save` endpoint as `addEmployee.html`, on a page titled "User \|\| DashBoard" inside an **admin** sidebar shell | Almost certainly a superseded draft, not a live route — flagged, not built |
| `templates/admin/dummy.html` | Near-duplicate of `addEmployee.html`'s sidebar/layout | Almost certainly dead/orphaned — flagged, not built |
| `templates/user/DummyUser.html` | Near-duplicate of `viewEmployeeDetails.html`'s content | Almost certainly dead/orphaned — flagged, not built |

`onboardingForm.html`, `payroll.html`, and `payslip.html` are genuine,
sizeable gaps that should be treated as new batches, not covered by
anything delivered so far.

### Animation audit — 2 real bugs found and fixed
- **Login/Forgot Password/Verify OTP/Reset Password illustration image**:
  `login.css` applies `animation: bounceIn 2s infinite alternate` to the
  image — a gentle up/down float that runs **continuously**, not once on
  load. Earlier notes had dismissed all of that block's animations
  (`fadeIn`/`slideUp`/`floatIn`/`bounceIn`) as "one-time, no lasting visual
  difference" — true for the first three, wrong for `bounceIn`, which
  never stops. Fixed in `AuthIllustration.tsx` with a looping `Animated`
  translateY(0 ↔ -10) matching the keyframe exactly.
- **Meeting-in-progress pulse** (`AttendanceActionButton.tsx`, batch 3):
  the original implementation animated `shadowOpacity`/`shadowRadius` on a
  plain `View` — those props are **iOS-only**; a plain RN `View` on
  Android ignores them entirely, so the pulse would have been invisible on
  every Android device. Rebuilt as an `Animated.View` ring that scales up
  while fading out — the standard cross-platform RN pulse pattern, which
  actually renders on both platforms. A full-codebase grep confirmed this
  was the only place animating shadow props (every static card shadow
  elsewhere correctly pairs `shadowOpacity`/`shadowRadius` with an
  `elevation` fallback for Android).
- **`.fade-in` entrance** on the Leave screens: `userLeave.html` and
  `admin/leave.html` both apply a `fade-in` class directly in the markup
  (not conditionally via JS) to the summary-cards row and the table
  section — a real, unconditional 0.8s fade+slide-up on every page load.
  This had been missed entirely. Added a new `FadeInView` wrapper and
  applied it at the exact two spots the source does, in both
  `UserLeaveScreen.tsx` and `AdminLeaveScreen.tsx`.
- Everything else animation-related in the source (`fadeIn`/`slideUp`
  page-load transitions on the login card itself, `pulse-meeting`'s
  timing already covered above) settles to an identical static end state
  whether or not the transition plays, so those remain correctly excluded.

### Hover effects
Mobile has no mouse, so `:hover` (129 rules across the CSS) has no direct
target — this isn't a gap, it's a difference in input model. The correct
mobile equivalent is **press feedback**, which was already present
everywhere: every interactive element is a `TouchableOpacity` (dims on
press by default) or a `Pressable`. No interactive element in the app is
missing touch feedback.

### Colors
Spot-checked a broad, representative sample directly against the CSS
rather than trusting memory: `status-badges.css`'s all 12 status colors
(exact match), the sidebar's base/hover/active colors (`#23d2aa`/`#50d2b3`,
exact match), and the `#f5f9f8` shared body background (exact match).
Combined with the fact that every color in `theme/colors.ts` carries an
inline comment citing the exact source CSS rule it came from, color
fidelity is solid.

### Icons
Extracted all 50 distinct icon names used anywhere in the app (literal
`Feather name="..."` props, plus every dynamic one driven from a config
array or prop) and validated every single one against the real
`Feather.json` glyph map shipped by `react-native-vector-icons` — **all 50
are valid**, so no icon silently renders blank from a typo'd name.

### Responsiveness
Re-confirms batch 13's audit still holds after this pass's changes:
`tsc --noEmit` clean, no `Animated`-driven shadow props anywhere else,
`SafeAreaView`/`KeyboardAvoidingView` coverage unchanged and correct.

## Batch 16 — Real backend integration (github.com/Sathya2346/employeemanagement)

Everything above was built by reverse-engineering the static HTML/CSS/JS
you provided, without ever seeing server-side code — so every API
endpoint in `src/api/*.ts` was an educated guess. This batch clones and
reads the **actual** Spring Boot backend/web-frontend repo and corrects
every guess against the real source, endpoint by endpoint.

### What the real backend looks like
It's a single Spring Boot app (`server.port=8085`, MySQL) that serves
**both** the existing Thymeleaf web frontend **and** this app. Auth is
session-cookie based (Spring Security + `HttpSession`) — there is no
bearer token; React Native's networking layer persists cookies the same
way a browser does, so logging in once and then calling other endpoints
in the same app session works with no extra plumbing.

There are genuinely **two parallel API surfaces** on that one backend:
1. `controller/api/*` — a clean REST layer (`/api/**`) clearly built for
   external/non-browser clients: auth, employee CRUD, admin onboarding
   decisions, notifications, settings.
2. Root-path controllers with `@ResponseBody` on individual methods
   (`/attendance/**`, `/leave/**`, `/admin/settings/**`, etc.) — what the
   *existing web frontend's own JavaScript* calls via AJAX. Many of these
   controllers mix JSON methods (`@ResponseBody`) with plain
   Thymeleaf-view methods on the *same* class, so each endpoint had to be
   checked individually — the URL pattern alone doesn't tell you which
   kind it is.

### Corrections made (verified against the actual `.java` source, not inferred)
| Area | Was assumed | Actually is |
|---|---|---|
| Login/forgot-password/OTP/reset | root `/login` etc. | `/api/auth/**` (`AuthRestController`) — JSON, session-cookie based |
| Login role field | `"ROLE_USER"` / `"ROLE_ADMIN"` | `"USER"` / `"ADMIN"` (a simplified string distinct from the DB's `userType`, which *does* keep `"ROLE_USER"`/`"ROLE_ADMIN"` — both were right, just for different fields) |
| Resend OTP | separate endpoint | doesn't exist — resending is just calling forgot-password again |
| Add/Update/Delete employee | root `/admin/save` etc. | `/api/employees/**` (`EmployeeRestController`) — the root-path equivalents are Thymeleaf redirects with no JSON at all |
| Update employee payload | flat fields | nested under `companyDetails: {...}` |
| Shift timings source | standalone endpoint | part of `GET /admin/settings`'s response (no separate endpoint) |
| Settings (leave defaults, 8 email templates, shifts) | root `/admin/settings/**` | `/api/admin/settings/**` (`SettingsRestController`) — the root controller is 100% Thymeleaf view/redirect, zero JSON |
| Shift add/edit/delete paths | `/shifts/save`, `/shifts/edit/{id}`, `/shifts/delete/{id}` (POST) | `/shift/add`, `/shift/update/{id}` (POST), `/shift/delete/{id}` (**DELETE**) |
| Onboarding review — fetching one employee's full submission | assumed dedicated GET endpoint | doesn't exist; use `GET /api/employees/{id}` and read the nested `employeeDetails` object (byte[] fields auto-serialize as base64) |
| Onboarding review — pending list & decision | `/admin/onboarding/**` | `/api/admin/onboarding/**` (`AdminOnboardingRestController`) — root path is Thymeleaf-only |
| User's own onboarding form data | assumed dedicated GET endpoint | same fix — `GET /api/employees/{id}` |
| Onboarding submit | — | confirmed correct as originally built: `POST /api/onboarding/submit`, multipart, flat `EmployeeDetails` fields + per-document file parts |
| User dashboard data | `/user/userDashboard/{id}` | Thymeleaf-only; use `GET /api/employees/{id}` + derive `pendingCompanyDetails` the same way `LeaveController` itself checks it, + `GET /api/notifications/unread/count` for the badge |
| User notifications list | `/user/notification/{id}` | Thymeleaf-only; use `GET /api/notifications/user/{id}` (`NotificationRestController`) |
| Admin dashboard aggregates | assumed `/admin/dashboard` returned JSON | Thymeleaf-only, and there's no aggregate-stats REST endpoint at all — computed client-side from `GET /api/employees/all` instead (see code comment in `adminService.ts` for exactly how `attenPresent`/`attenAbsent` are derived, since there's no historical "everyone's attendance today" endpoint either) |
| Admin weekly attendance chart | — | confirmed correct as originally built: `GET /admin/api/attendanceSummary` is genuinely `@ResponseBody` |
| User leave data | `/leave/userLeave/{id}` | Thymeleaf-only; use `/leave/user/{id}` (list) + `/leave/balance/{id}` (returns the `Employee`, whose `totalLeaves`/`paidLeaveBalance`/`sickLeaveBalance`/`casualLeaveBalance` fields are read directly) |
| Apply leave, cancel leave, admin leave summary/filter/update-status, attendance save/range/last5/break/meeting, hourly report submit, admin notifications list | — | confirmed correct as originally built |

Every corrected file has an inline comment citing which real controller
class it maps to, so future changes to either side can be traced back to
the actual source.

### One more thing worth flagging
`application.properties` in the cloned repo contains a live Gmail SMTP
app password committed in plaintext. Not something I can or should act
on, but worth rotating that credential and keeping it out of version
control (e.g. via environment variables) regardless of anything to do
with this mobile app.

### "Dispatch"/running everything together — what's realistic from here
I can't literally deploy or run a live multi-service system from this
sandboxed environment — there's no Maven Central access to build the Java
backend (only a fixed allowlist of package registries), no MySQL, and no
app-store/hosting infrastructure to distribute the RN app to a phone.
What I *can* do, and did, is make this app's entire API layer correctly
match the real backend, verified against its actual source rather than
guessed. To actually run all three pieces together on your machine:

1. **Backend** (also serves the existing web frontend): in `repo-source/`
   (or wherever you clone `github.com/Sathya2346/employeemanagement`),
   make sure MySQL is running with a database named `employeemanagement`,
   then `./mvnw spring-boot:run` (or your IDE's run button). It starts on
   `http://localhost:8085`.
2. **Mobile app**: update `src/api/config.ts`'s `API_BASE_URL` —
   `http://10.0.2.2:8085` for the Android emulator, your machine's LAN IP
   for a physical device or iOS simulator on the same network — then
   `npm install` and `npx react-native run-android` /
   `npx react-native run-ios` from this project.
3. Log in with the same credentials the web frontend uses — same
   database, same session mechanism, same accounts.

## Scope / what was NOT touched
Nothing was added beyond what exists in the converted templates and their
CSS/JS. No extra fields, buttons, icons, or screens were introduced. Notable
source quirks preserved exactly rather than "fixed":
- `forgot-password.html` and `verify-otp.html` render the form (`.login-right`)
  **before** the illustration (`.login-left`) in the DOM — the reverse of
  `login.html` / `reset-password.html`. Each screen's component order matches
  its own template.
- The password-field eye-toggle button keeps Bootstrap's default grey
  (`#6c757d`) border, distinct from the green (`#10b981`) border on the rest
  of that input group — this is what the original CSS cascade actually
  produces (see comments in `PasswordInputGroup.tsx`), not a bug in the port.

## Setup

```bash
npm install
cd ios && pod install && cd ..   # iOS only
```

### Fonts (Poppins)
The original app loads Poppins 400/500/600/700 from Google Fonts via a
`<link>` tag — there's no bundled font file in the source project to copy
1:1, so download the matching weights and link them locally:

1. Download `Poppins-Regular.ttf`, `Poppins-Medium.ttf`,
   `Poppins-SemiBold.ttf`, `Poppins-Bold.ttf` from
   https://fonts.google.com/specimen/Poppins
2. Place them in `src/assets/fonts/`
3. Run `npx react-native-asset` (uses the `assets` entry in
   `react-native.config.js`) to link them into iOS/Android
4. Rebuild the app

### Icons
`react-native-vector-icons` (Feather set) stands in for Bootstrap Icons,
which is a web icon font with no direct RN equivalent:

| Bootstrap Icon      | Feather icon used |
|----------------------|--------------------|
| `bi-envelope`         | `mail`             |
| `bi-lock`              | `lock`              |
| `bi-eye` / `bi-eye-slash` | `eye` / `eye-off` |

Follow the standard `react-native-vector-icons` linking steps for your RN
version (Android: fonts are auto-linked via Gradle; iOS: add the Feather
font to `Info.plist` `UIAppFonts` and copy from
`node_modules/react-native-vector-icons/Fonts/Feather.ttf` into the Xcode
project).

### Backend
See "Batch 16 — Real backend integration" above for the full, verified
endpoint mapping. In short: set `API_BASE_URL` in `src/api/config.ts` to
your running instance of `github.com/Sathya2346/employeemanagement`
(default port `8085`). Login goes through `POST /api/auth/login`, which
sets a session cookie and returns `{ employeeId, role: "USER"|"ADMIN" }`
used to route into the User or Admin drawer.

### Onboarding document picker
`react-native-document-picker` lets employees pick images/PDFs for the
onboarding form's 12 file fields, the RN equivalent of
`<input type="file">`. Needs native linking; see
https://github.com/rnmods/react-native-document-picker#installation.

## Assets used as-is
- `src/assets/images/img1.png` — copied unchanged from
  `resources/static/images/img1.png` (the illustration on all 4 auth screens)
- `src/assets/images/default-avatar.png` — copied unchanged from
  `resources/static/images/default-avatar.png`, used as the dashboard
  profile-image fallback (the original's own fallback path, `/images/profile.png`,
  isn't present in the provided resources, so the one default-avatar asset
  that does exist is used instead)
