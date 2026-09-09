/**
 * Single source of truth for the Spring Boot EMS backend URL.
 *
 * Expo development:
 * - Android emulator: EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8085
 * - Physical device: EXPO_PUBLIC_API_BASE_URL=http://<PC-LAN-IP>:8085
 * - iOS simulator: EXPO_PUBLIC_API_BASE_URL=http://localhost:8085
 *
 * The value can be supplied through Expo's EXPO_PUBLIC_* environment
 * variables. The Android-emulator URL remains the safe local default.
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || 'http://10.0.2.2:8085';

/** Session-cookie based Spring Security API requests. */
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  credentials: 'include',
};
