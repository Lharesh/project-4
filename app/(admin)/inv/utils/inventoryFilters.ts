// utils/inventoryFilters.ts
// Centralized filter logic for inventory page
// Augment InventoryItem to allow dynamic string indexing for filtering
export interface InventoryItemWithIndex extends Record<string, any> {}
import type { InventoryItem } from '../types/inventory';

export interface InventoryFilters {
  searchQuery: string;
  columnFilters: Record<string, string>;
}

export function filterInventoryItems(
  items: InventoryItem[],
  filters: InventoryFilters
): InventoryItem[] {
  let filtered = [...items] as InventoryItemWithIndex[];
  // Search filter
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      Object.values(item).some(val =>
        typeof val === 'string' && val.toLowerCase().includes(query)
      )
    );
  }
  // Column filters
  Object.entries(filters.columnFilters).forEach(([field, value]) => {
    if (value) {
      filtered = filtered.filter(item =>
        String(item[field] ?? '').toLowerCase().includes(value.toLowerCase())
      );
    }
  });
  return filtered as InventoryItem[];
}
