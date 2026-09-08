import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from './config';

/**
 * Employee-side onboarding submission. Rewritten against the real
 * backend: there's no dedicated "get my onboarding form" JSON endpoint,
 * so the current values/statuses/reasons/documents come from the same
 * place the admin review screen gets them — GET /api/employees/{id}
 * (EmployeeRestController), reading the nested `employeeDetails` object.
 * Submission itself goes to OnboardingRestController's
 * POST /api/onboarding/submit exactly as originally built (multipart,
 * @ModelAttribute-style flat EmployeeDetails fields + individual file
 * parts + an `employeeId` field) — that part was already correct.
 */

export interface OnboardingFormData {
  employee: { id: number };
  overallStatus: 'NOT_SUBMITTED' | 'DETAILS_SUBMITTED' | 'CHANGES_REQUESTED' | 'FULLY_APPROVED' | string;
  fields: Record<string, string | null>;
  statuses: Record<string, string>;
  reasons: Record<string, string>;
  documents: Record<string, string | null>;
}

export interface SubmitOnboardingResult {
  ok: boolean;
  message?: string;
}

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

const DOCUMENT_FIELD_MAP: Record<string, string> = {
  aadhar: 'aadharData',
  pan: 'panData',
  photo: 'photoData',
  mark10th: 'mark10thData',
  mark12th: 'mark12thData',
  sem1: 'sem1Data', sem2: 'sem2Data', sem3: 'sem3Data', sem4: 'sem4Data',
  sem5: 'sem5Data', sem6: 'sem6Data', sem7: 'sem7Data', sem8: 'sem8Data',
  transferCert: 'transferCertData',
  provisionalCert: 'provisionalCertData',
  courseCompletion: 'courseCompletionData',
};

const ALL_STATUS_KEYS = [
  'phone', 'address', 'city', 'gender', 'dob', 'emergency', 'maritalField', 'language', 'blood',
  'aadhar', 'pan', 'account', 'bankName', 'ifsc', 'branch',
  'degreeName', 'degreeInst', 'photo', 'mark10th', 'mark12th',
  'sem1', 'sem2', 'sem3', 'sem4', 'sem5', 'sem6', 'sem7', 'sem8',
  'transferCert', 'provisionalCert', 'courseCompletion',
];

// GET /api/employees/{id} -> Employee (with nested employeeDetails)
export async function getOnboardingForm(employeeId: number): Promise<OnboardingFormData> {
  const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
    ...DEFAULT_FETCH_OPTIONS,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load onboarding form.');
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
  ALL_STATUS_KEYS.forEach((key) => {
    const docProp = DOCUMENT_FIELD_MAP[key];
    if (docProp) documents[key] = details[docProp] ?? null;
    statuses[`${key}Status`] = details[`${key}Status`] || 'PENDING';
    reasons[`${key}RejectionReason`] = details[`${key}RejectionReason`] || '';
  });

  return {
    employee: { id: employee.id },
    overallStatus: employee.overallStatus || 'NOT_SUBMITTED',
    fields,
    statuses,
    reasons,
    documents,
  };
}

// POST /api/onboarding/submit — multipart/form-data
export async function submitOnboardingForm(
  employeeId: number,
  textFields: Record<string, string>,
  files: Record<string, { uri: string; name: string; type: string } | undefined>,
): Promise<SubmitOnboardingResult> {
  const formData = new FormData();
  formData.append('employeeId', String(employeeId));
  Object.entries(textFields).forEach(([key, value]) => {
    if (value != null) formData.append(key, value);
  });
  Object.entries(files).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file as unknown as Blob);
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/onboarding/submit`, {
    ...DEFAULT_FETCH_OPTIONS,
    method: 'POST',
    body: formData,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    return { ok: false, message: result.message || 'Failed to submit onboarding details.' };
  }
  return { ok: true, message: result.message || 'Onboarding details submitted successfully!' };
}
