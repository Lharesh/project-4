// Moved to helpers/appointments as a generic validation utility for forms

export function validateRequiredFields<T extends Record<string, any>>(
  values: T,
  requiredFields: (keyof T)[],
  fieldLabels?: Partial<Record<keyof T, string>>
): string | null {
  for (const field of requiredFields) {
    if (
      values[field] === undefined ||
      values[field] === null ||
      (typeof values[field] === 'string' && values[field].trim() === '') ||
      (Array.isArray(values[field]) && values[field].length === 0)
    ) {
      return `${fieldLabels?.[field] || String(field)} is required.`;
    }
  }
  return null;
}

