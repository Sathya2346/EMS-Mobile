import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

/**
 * Mirrors com.example.employeemanagement.controller.api.AuthRestController
 * exactly (verified against the actual source, not inferred from the web
 * frontend's JS). All requests are JSON (`@RequestBody Map<String,String>`
 * on the Java side), and auth is session-cookie based — a successful
 * /login response sets an HttpSession cookie that subsequent requests to
 * ANY endpoint (root-path or /api) automatically carry, the same way a
 * browser would.
 */

export interface ApiResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface LoginResult extends ApiResult {
  employeeId?: number;
  /** "USER" or "ADMIN" — exactly as AuthRestController.login() returns it
   *  (NOT "ROLE_USER"/"ROLE_ADMIN", which is a Spring Security internal
   *  authority string used elsewhere in the backend, not in this response). */
  role?: 'USER' | 'ADMIN';
  overallStatus?: string;
  firstname?: string;
  lastname?: string;
}

async function postJson(path: string, body: Record<string, string>): Promise<{ ok: boolean; data: any }> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, data };
}

// POST /api/auth/login  { username, password }
// -> { success, employeeId, id, username, email, role: "USER"|"ADMIN", overallStatus, firstname, lastname }
// Note: the backend also enforces account lockout after 5 failed attempts
// (HTTP 429) and fraud-detection logging — its `message` is surfaced as-is.
export async function login(username: string, password: string): Promise<LoginResult> {
  try {
    const { ok, data } = await postJson('/api/auth/login', { username, password });
    if (!ok) {
      return { success: false, error: data.message || 'Invalid username or password.' };
    }
    return {
      success: true,
      employeeId: data.employeeId ?? data.id,
      role: data.role,
      overallStatus: data.overallStatus,
      firstname: data.firstname,
      lastname: data.lastname,
    };
  } catch (err) {
    return { success: false, error: 'Unable to reach the server. Please check your connection.' };
  }
}

// POST /api/auth/logout
export async function logout(): Promise<void> {
  await fetch(`${API_BASE_URL}/api/auth/logout`, { ...DEFAULT_FETCH_OPTIONS, method: 'POST' }).catch(() => {});
}

// POST /api/auth/forgot-password  { email }
export async function forgotPassword(email: string): Promise<ApiResult> {
  try {
    const { ok, data } = await postJson('/api/auth/forgot-password', { email });
    return ok
      ? { success: true, message: data.message || 'OTP sent to your email.' }
      : { success: false, error: data.message || 'Failed to send OTP.' };
  } catch (err) {
    return { success: false, error: 'Unable to reach the server. Please check your connection.' };
  }
}

// POST /api/auth/verify-otp  { email, otp }
export async function verifyOtp(email: string, otp: string): Promise<ApiResult> {
  try {
    const { ok, data } = await postJson('/api/auth/verify-otp', { email, otp });
    return ok
      ? { success: true, message: data.message || 'OTP verified successfully.' }
      : { success: false, error: data.message || 'Invalid or expired OTP.' };
  } catch (err) {
    return { success: false, error: 'Unable to reach the server. Please check your connection.' };
  }
}

// The backend has no separate "resend OTP" endpoint — resending is just
// calling forgot-password again, which re-sends a fresh OTP to the same email.
export const resendOtp = forgotPassword;

// POST /api/auth/reset-password  { email, password }
// Requires a verified OTP earlier in the SAME session (server checks a
// session flag set by verify-otp), so this must be called from the same
// app session as verifyOtp, not a fresh one.
export async function resetPassword(email: string, password: string): Promise<ApiResult> {
  try {
    const { ok, data } = await postJson('/api/auth/reset-password', { email, password });
    return ok
      ? { success: true, message: data.message || 'Password changed successfully. Please login.' }
      : { success: false, error: data.message || 'Failed to reset password.' };
  } catch (err) {
    return { success: false, error: 'Unable to reach the server. Please check your connection.' };
  }
}
