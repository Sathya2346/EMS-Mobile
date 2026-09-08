/**
 * Single source of truth for the backend base URL. This app talks to the
 * SAME Spring Boot backend that serves the existing Thymeleaf web
 * frontend (github.com/Sathya2346/employeemanagement) — there is no
 * separate "mobile backend".
 *
 * Two parallel API surfaces exist on that backend:
 * 1. `/api/**` — a clean REST layer (controller/api/*) built for
 *    external/mobile clients: auth, employee CRUD, admin onboarding
 *    decisions.
 * 2. Root-path `@ResponseBody` endpoints (e.g. `/attendance/**`,
 *    `/leave/**`, `/admin/settings/**`) — these are what the existing
 *    web frontend's own JavaScript calls via AJAX, and are reused here
 *    for everything that has no `/api` equivalent (attendance, leave,
 *    hourly reports, notifications, settings).
 *
 * Auth is session-cookie based (Spring Security + HttpSession), the same
 * as the web app — there is no bearer token. React Native's networking
 * layer persists cookies across requests the same way a browser does, so
 * logging in via POST /api/auth/login and then calling any other endpoint
 * in the same app session "just works" with no extra plumbing, as long as
 * `credentials` isn't stripped.
 *
 * Update this to point at your running backend:
 * - Local dev (Android emulator talking to your machine): 'http://10.0.2.2:8085'
 * - Local dev (iOS simulator / physical device on same network): 'http://<your-machine-LAN-IP>:8085'
 * - Deployed (e.g. Render): 'https://your-app.onrender.com'
 *
 * Port 8085 (not the Spring Boot default 8080) is set explicitly in the
 * backend's application.properties (`server.port=8085`) — verified
 * directly against that file, not assumed.
 */
export const API_BASE_URL = 'http://10.0.2.2:8085';

/** Default fetch options that make sure session cookies are sent/stored. */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: 'include',
};
