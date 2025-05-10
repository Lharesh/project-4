/**
 * Generates a path for accessing clinic-specific data
 * @param clinicId The ID of the clinic
 * @param subPath Optional sub-path within the clinic's data
 * @returns Formatted path string
 */
export function getClinicPath(clinicId: string, subPath?: string): string {
  if (!subPath) {
    return `clinics/${clinicId}`;
  }
  
  return `clinics/${clinicId}/${subPath}`;
}

/**
 * Generates a path for accessing clinic-specific storage
 * @param clinicId The ID of the clinic
 * @param fileName The name of the file
 * @returns Formatted storage path string
 */
export function getClinicStoragePath(clinicId: string, fileName: string): string {
  return `storage/${clinicId}/${fileName}`;
}

/**
 * Normalizes a phone number by removing non-numeric characters
 * @param phone The phone number to normalize
 * @returns Normalized phone number with only digits
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formats a phone number for display
 * @param phone The phone number to format
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  
  if (normalized.length === 10) {
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  }
  
  return phone; // Return original if not a 10-digit number
}