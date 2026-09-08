/** Direct ports of the regexes/logic in onboardingForm.html's inline `<script>`. */

export function validatePhone(value: string): boolean {
  return /^\d{10}$/.test(value);
}

export function validateEmergency(value: string, phoneValue: string): { valid: boolean; message: string } {
  const isTen = /^\d{10}$/.test(value);
  if (!isTen) return { valid: false, message: 'Must be 10 digits' };
  if (value === phoneValue) return { valid: false, message: 'Must be different from primary' };
  return { valid: true, message: 'Valid alternative contact' };
}

export function calculateAge(dobIso: string): number {
  const dob = new Date(dobIso);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export function validateAadhar(value: string): boolean {
  return /^\d{12}$/.test(value);
}

export function validatePan(value: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase());
}

export function validateAccount(value: string): boolean {
  return /^\d{9,18}$/.test(value);
}

export function validateIfsc(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase());
}

/** Port of the 2MB file-size check applied to every `.file-input` in the source. */
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
