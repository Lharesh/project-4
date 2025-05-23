import type { InventoryItem } from '@/features/inventory/types/inventory';
import type { FieldDescriptor } from '@/components/ui/EditableRow';
import { InventorySchema } from './inventorySchema';

/**
 * Validate a row of mapped inventory data against the InventorySchema.
 * Returns an object: { [field]: errorMsg }
 */
export function validateMappedRow(row: Record<string, any>, schema: FieldDescriptor[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema) {
    const val = row[field.field];
    // Required field: must not be undefined, null, or empty string
    if (field.required && (val === undefined || val === null || val === '')) {
      errors[field.field] = 'Required';
      continue;
    }
    // Number field: must be a valid, positive number
    if (field.type === 'number' && val !== undefined && val !== null) {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        errors[field.field] = 'Must be a number';
        continue;
      }
      if (numVal < 0) {
        errors[field.field] = 'Must be a positive number';
        continue;
      }
    }
    // Date field: must be yyyy-mm-dd and a valid date
    if (field.type === 'date' && val) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        errors[field.field] = 'Invalid date (yyyy-mm-dd)';
        continue;
      }
      const date = new Date(val);
      // Check for valid date: date string must match input and not be Invalid Date
      if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== val) {
        errors[field.field] = 'Invalid date (not a real date)';
        continue;
      }
    }
  }

  return errors;
}
  const errors: Record<string, string> = {};

  for (const field of schema) {
    const val = row[field.field];
    // Required field: must not be undefined, null, or empty string
    if (field.required && (val === undefined || val === null || val === '')) {
      errors[field.field] = 'Required';
      continue;
    }
    // Number field: must be a valid, positive number
    if (field.type === 'number' && val !== undefined && val !== null) {
      const numVal = Number(val);
      if (isNaN(numVal)) {
        errors[field.field] = 'Must be a number';
        continue;
      }
      if (numVal < 0) {
        errors[field.field] = 'Must be a positive number';
        continue;
      }
    }
    // Date field: must be yyyy-mm-dd and a valid date
    if (field.type === 'date' && val) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        errors[field.field] = 'Invalid date (yyyy-mm-dd)';
        continue;
      }
      const date = new Date(val);
      // Check for valid date: date string must match input and not be Invalid Date
      if (isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== val) {
        errors[field.field] = 'Invalid date (not a real date)';
        continue;
      }
    }
  }
  return errors;
}
