import { validateInventoryItem, sortInventoryItems } from './inventoryUtils';
import type { InventoryItem } from '../types/inventory';

// Mock InventorySchema for test isolation
jest.mock('../../../utils/inventorySchema', () => ({
  InventorySchema: [
    { field: 'name', required: true },
    { field: 'stock', required: true },
    { field: 'brand', required: false }
  ]
}));

describe('validateInventoryItem', () => {
  it('returns empty object if all required fields are present', () => {
    const item = { name: 'Test', stock: 5, brand: 'A', id: '', sku: '', active: true, type: '', unit: '', mrp: 0, buy_price: 0, gst: 0, expiry: '' };
    expect(validateInventoryItem(item)).toEqual({});
  });
  it('returns errors for missing required fields', () => {
    // Use a value that is falsy but valid for type (e.g. 0 for stock)
    const item = { name: '', stock: 0, brand: 'A', id: '', sku: '', active: true, type: '', unit: '', mrp: 0, buy_price: 0, gst: 0, expiry: '' };
    expect(validateInventoryItem(item)).toEqual({ name: 'Required' }); // Only name is required and missing, stock=0 is valid
  });
});

describe('sortInventoryItems', () => {
  const items: InventoryItem[] = [
    { id: '1', sku: 'SKU1', active: true, name: 'B', brand: 'K', type: '', unit: '', stock: 2, mrp: 0, buy_price: 0, gst: 0, expiry: '' },
    { id: '2', sku: 'SKU2', active: true, name: 'A', brand: 'K', type: '', unit: '', stock: 5, mrp: 0, buy_price: 0, gst: 0, expiry: '' }
  ];
  it('sorts by string field asc/desc', () => {
    expect(sortInventoryItems(items, 'name', 'asc')[0].name).toBe('A');
    expect(sortInventoryItems(items, 'name', 'desc')[0].name).toBe('B');
  });
  it('sorts by number field asc/desc', () => {
    expect(sortInventoryItems(items, 'stock', 'asc')[0].stock).toBe(2);
    expect(sortInventoryItems(items, 'stock', 'desc')[0].stock).toBe(5);
  });
  it('returns original if invalid sortBy', () => {
    // @ts-expect-error
    expect(sortInventoryItems(items, 'unknown', 'asc')).toEqual(items);
  });
});
