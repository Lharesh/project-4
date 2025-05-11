import type { InventoryItem } from '../app/(admin)/inv/types/inventory';
import type { FieldDescriptor } from '../components/ui/EditableRow';
import { InventorySchema } from './inventorySchema';

/**
 * Validate a row of mapped inventory data against the InventorySchema.
 * Returns an object: { [field]: errorMsg }
 */
export function validateMappedRow(row: Record<string, any>, schema: FieldDescriptor[]): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema) {
    const val = row[field.field];
    if (field.required && (!val && val !== 0)) {
      errors[field.field] = 'Required';
      continue;
    }
    if (field.type === 'number' && val !== undefined && val !== null && isNaN(Number(val))) {
      errors[field.field] = 'Must be a number';
      continue;
    }
    if (field.type === 'date' && val && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      errors[field.field] = 'Invalid date (yyyy-mm-dd)';
      continue;
    }
  }

  return errors;
}
