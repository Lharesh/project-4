// inventoryUtils.ts
// Utility functions for Inventory: validation, sorting, and other pure helpers

import type { InventoryItem } from '../types/inventory';
import { InventorySchema } from '../../../../utils/inventorySchema';

/**
 * Validate an InventoryItem against the InventorySchema.
 * Returns an object of field errors (if any).
 */
export function validateInventoryItem(row: InventoryItem): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const field of InventorySchema) {
    const val = row[field.field as keyof InventoryItem];
    if (field.required && (!val && val !== 0)) {
      errs[field.field] = 'Required';
    }
  }
  return errs;
}

/**
 * Sort inventory items by a given field and direction.
 */
export function sortInventoryItems(
  items: InventoryItem[],
  sortBy: keyof InventoryItem,
  sortDirection: 'asc' | 'desc'
): InventoryItem[] {
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });
}

// Add more pure utility functions as needed below.
