// inventorySort.ts
// Sorting utility for inventory items by specific fields

import type { InventoryItem } from '../types/inventory';

export type SortableInventoryField = 'name' | 'unit' | 'stock' | 'mrp' | 'gst' | 'expiry' | 'buy_price';

/**
 * Sort inventory items by a given field and direction. Only allows specific sortable fields.
 */
export function sortInventoryItems(
  items: InventoryItem[],
  sortBy: SortableInventoryField | '',
  sortDirection: 'asc' | 'desc'
): InventoryItem[] {
  if (!sortBy) return items;
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    // Handle expiry as date
    if (sortBy === 'expiry') {
      const aDate = aVal ? new Date(aVal as string).getTime() : 0;
      const bDate = bVal ? new Date(bVal as string).getTime() : 0;
      return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
    }
    // Handle buy_price as number (may be string or number)
    if (sortBy === 'buy_price') {
      const aNum = typeof aVal === 'number' ? aVal : parseFloat(aVal || '0');
      const bNum = typeof bVal === 'number' ? bVal : parseFloat(bVal || '0');
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    }
    // Numeric fields
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    // String fields
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return 0;
  });
}
