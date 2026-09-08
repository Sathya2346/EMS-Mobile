import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

/**
 * Admin onboarding review — rewritten against the real
 * AdminOnboardingRestController (`/api/admin/onboarding/**`).
 *
 * Important: that controller has no endpoint that returns one employee's
 * full onboarding submission (values + statuses + reasons + documents) as
 * JSON — only GET /pending (list) and POST /review/{id} (submit a
 * decision). The actual data comes from GET /api/employees/{id}
 * (EmployeeRestController), which returns the full Employee entity
 * including a nested `employeeDetails` object with every
 * personalX / xStatus / xRejectionReason field and every xData byte[]
 * field (which Jackson serializes as a base64 string automatically) —
 * exactly the shape this screen needs, just nested one level deeper than
 * originally assumed.
 */

export interface PendingOnboardingEmployee {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  overallStatus: 'DETAILS_SUBMITTED' | 'CHANGES_REQUESTED' | string;
}

export interface OnboardingReviewDetails {
  employee: { id: number; firstname: string; lastname: string | null };
  fields: Record<string, string | null>;
  documents: Record<string, string | null>;
  statuses: Record<string, string>;
  reasons: Record<string, string>;
}

export interface SubmitReviewResult {
  ok: boolean;
  errorMessage?: string;
}

/** Every EmployeeDetails property that has a matching `{key}Status` field. */
const REVIEW_FIELD_KEYS = [
  'phone', 'address', 'city', 'gender', 'dob', 'emergency', 'maritalField', 'language', 'blood',
  'aadhar', 'pan', 'account', 'bankName', 'ifsc', 'branch',
  'degreeName', 'degreeInst', 'photo', 'mark10th', 'mark12th',
  'sem1', 'sem2', 'sem3', 'sem4', 'sem5', 'sem6', 'sem7', 'sem8',
  'transferCert', 'provisionalCert', 'courseCompletion',
];

/** Maps each review key to the EmployeeDetails property holding its display value (not every key has one — e.g. photo/marksheets are file-only). */
const VALUE_FIELD_MAP: Record<string, string> = {
  phone: 'personalPhone',
  address: 'personalAddress',
  city: 'personalCity',
  gender: 'personalGender',
  dob: 'personalDateOfBirth',
  emergency: 'personalEmergencyNumber',
  maritalField: 'personalMaritalStatus',
  language: 'personalLanguage',
  blood: 'personalBloodGroup',
  aadhar: 'aadharNumber',
  pan: 'panNumber',
  account: 'accountNumber',
  bankName: 'bankName',
  ifsc: 'ifscCode',
  branch: 'personalBranch',
  degreeName: 'degreeName',
  degreeInst: 'degreeInstitution',
};

/** Maps each file-bearing review key to the EmployeeDetails byte[]/base64 property. */
const DOCUMENT_FIELD_MAP: Record<string, string> = {
  aadhar: 'aadharData',
  pan: 'panData',
  photo: 'photoData',
  mark10th: 'mark10thData',
  mark12th: 'mark12thData',
  sem1: 'sem1Data',
  sem2: 'sem2Data',
  sem3: 'sem3Data',
  sem4: 'sem4Data',
  sem5: 'sem5Data',
  sem6: 'sem6Data',
  sem7: 'sem7Data',
  sem8: 'sem8Data',
  transferCert: 'transferCertData',
  provisionalCert: 'provisionalCertData',
  courseCompletion: 'courseCompletionData',
};

// GET /api/admin/onboarding/pending -> Employee[]
export async function getPendingOnboarding(): Promise<PendingOnboardingEmployee[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/onboarding/pending`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load pending onboarding list.');
  }
  const employees = await response.json();
  return employees.map((e: any) => ({
    id: e.id,
    firstname: e.firstname,
    lastname: e.lastname,
    email: e.email,
    username: e.username,
    overallStatus: e.overallStatus,
  }));
}

// GET /api/employees/{id} -> Employee (with nested employeeDetails)
export async function getOnboardingReview(employeeId: number): Promise<OnboardingReviewDetails> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load onboarding submission.');
  }
  const employee = await response.json();
  const details = employee.employeeDetails || {};

  const fields: Record<string, string | null> = {};
  Object.values(VALUE_FIELD_MAP).forEach((prop) => {
    fields[prop] = details[prop] ?? null;
  });

  const documents: Record<string, string | null> = {};
  const statuses: Record<string, string> = {};
  const reasons: Record<string, string> = {};
  REVIEW_FIELD_KEYS.forEach((key) => {
    const docProp = DOCUMENT_FIELD_MAP[key];
    if (docProp) documents[key] = details[docProp] ?? null;
    statuses[`${key}Status`] = details[`${key}Status`] || 'PENDING';
    reasons[`${key}RejectionReason`] = details[`${key}RejectionReason`] || '';
  });

  return {
    employee: { id: employee.id, firstname: employee.firstname, lastname: employee.lastname },
    fields,
    documents,
    statuses,
    reasons,
  };
}

// POST /api/admin/onboarding/review/{employeeId}  { ...statusFields, ...reasonFields }
export async function submitOnboardingReview(
  employeeId: number,
  statuses: Record<string, string>,
  reasons: Record<string, string>,
): Promise<SubmitReviewResult> {
  const response = await fetch(`${API_BASE_URL}/api/admin/onboarding/review/${employeeId}`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...statuses, ...reasons }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    return { ok: false, errorMessage: result.message || 'Failed to submit review.' };
  }
  return { ok: true };
}
