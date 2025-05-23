import { filterInventoryItems, InventoryFilters } from './inventoryFilters';
import type { InventoryItem } from '../types/inventory';

describe('filterInventoryItems', () => {
  const items: InventoryItem[] = [
    { id: '1', sku: 'SKU1', active: true, name: 'Ashwagandha', brand: 'Kottakkal', type: 'Churna', unit: 'gm', stock: 10, mrp: 100, buy_price: 80, gst: 5, expiry: '2025-11-01' },
    { id: '2', sku: 'SKU2', active: true, name: 'Brahmi Oil', brand: 'Arya Vaidya Sala', type: 'Oil', unit: 'ml', stock: 25, mrp: 250, buy_price: 200, gst: 12, expiry: '2025-09-15' },
    { id: '3', sku: 'SKU3', active: true, name: 'Triphala Tablet', brand: 'Dabur', type: 'Tablet', unit: 'tab', stock: 8, mrp: 90, buy_price: 65, gst: 5, expiry: '2024-12-30' }
  ];

  it('returns all items if no filters applied', () => {
    const filters: InventoryFilters = { searchQuery: '', columnFilters: {} };
    expect(filterInventoryItems(items, filters)).toHaveLength(3);
  });

  it('filters by searchQuery (case-insensitive)', () => {
    const filters: InventoryFilters = { searchQuery: 'brahmi', columnFilters: {} };
    const result = filterInventoryItems(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Brahmi Oil');
  });

  it('filters by columnFilters', () => {
    const filters: InventoryFilters = { searchQuery: '', columnFilters: { brand: 'Dabur' } };
    const result = filterInventoryItems(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('Dabur');
  });

  it('filters by multiple columnFilters', () => {
    const filters: InventoryFilters = { searchQuery: '', columnFilters: { brand: 'Kottakkal', type: 'Churna' } };
    const result = filterInventoryItems(items, filters);
    expect(result).toHaveLength(1);
    expect(result[0].brand).toBe('Kottakkal');
    expect(result[0].type).toBe('Churna');
  });

  it('returns empty if no items match', () => {
    const filters: InventoryFilters = { searchQuery: 'nonexistent', columnFilters: {} };
    expect(filterInventoryItems(items, filters)).toHaveLength(0);
  });

  it('returns empty if no items match columnFilters', () => {
    const filters: InventoryFilters = { searchQuery: '', columnFilters: { brand: 'Nonexistent' } };
    expect(filterInventoryItems(items, filters)).toHaveLength(0);
  });

  it('handles empty items array', () => {
    const filters: InventoryFilters = { searchQuery: '', columnFilters: {} };
    expect(filterInventoryItems([], filters)).toEqual([]);
  });
});
