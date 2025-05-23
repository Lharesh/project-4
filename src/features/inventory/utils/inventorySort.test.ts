import { sortInventoryItems, SortableInventoryField } from './inventorySort';
import type { InventoryItem } from '../types/inventory';

describe('sortInventoryItems', () => {
  const items: InventoryItem[] = [
    { id: '1', sku: 'SKU1', active: true, name: 'Ashwagandha', brand: 'Kottakkal', type: 'Churna', unit: 'gm', stock: 10, mrp: 100, buy_price: 80, gst: 5, expiry: '2025-11-01' },
    { id: '2', sku: 'SKU2', active: true, name: 'Brahmi Oil', brand: 'Arya Vaidya Sala', type: 'Oil', unit: 'ml', stock: 25, mrp: 250, buy_price: 200, gst: 12, expiry: '2025-09-15' },
    { id: '3', sku: 'SKU3', active: true, name: 'Triphala Tablet', brand: 'Dabur', type: 'Tablet', unit: 'tab', stock: 8, mrp: 90, buy_price: 65, gst: 5, expiry: '2024-12-30' }
  ];

  it('returns original if sortBy is empty', () => {
    expect(sortInventoryItems(items, '', 'asc')).toEqual(items);
  });

  it('sorts by numeric field (stock, asc)', () => {
    const result = sortInventoryItems(items, 'stock', 'asc');
    expect(result[0].stock).toBe(8);
    expect(result[2].stock).toBe(25);
  });

  it('sorts by numeric field (stock, desc)', () => {
    const result = sortInventoryItems(items, 'stock', 'desc');
    expect(result[0].stock).toBe(25);
    expect(result[2].stock).toBe(8);
  });

  it('sorts by string field (name, asc)', () => {
    const result = sortInventoryItems(items, 'name', 'asc');
    expect(result[0].name).toBe('Ashwagandha');
    expect(result[2].name).toBe('Triphala Tablet');
  });

  it('sorts by string field (name, desc)', () => {
    const result = sortInventoryItems(items, 'name', 'desc');
    expect(result[0].name).toBe('Triphala Tablet');
    expect(result[2].name).toBe('Ashwagandha');
  });

  it('sorts by expiry (date, asc)', () => {
    const result = sortInventoryItems(items, 'expiry', 'asc');
    expect(result[0].expiry).toBe('2024-12-30');
    expect(result[2].expiry).toBe('2025-11-01');
  });

  it('sorts by expiry (date, desc)', () => {
    const result = sortInventoryItems(items, 'expiry', 'desc');
    expect(result[0].expiry).toBe('2025-11-01');
    expect(result[2].expiry).toBe('2024-12-30');
  });

  it('sorts by buy_price (number or string)', () => {
    const mixed = [
      { ...items[0], buy_price: '150' },
      { ...items[1], buy_price: 80 },
      { ...items[2], buy_price: '200' }
    ];
    const result = sortInventoryItems(mixed, 'buy_price', 'asc');
    expect(result[0].buy_price).toBe(80);
    expect(result[2].buy_price).toBe('200');
  });

  it('handles unknown field gracefully', () => {
    // @ts-expect-error
    expect(sortInventoryItems(items, 'unknown', 'asc')).toEqual(items);
  });
});
