import { validateInventoryRow } from '../validateInventoryExcel';

describe('validateInventoryRow', () => {
  it('returns success for a fully valid row', () => {
    const row = {
      name: 'Paracetamol',
      brand: 'MediBrand',
      type: 'Tablet',
      unit: 'strip',
      stock: 10,
      mrp: 12.5,
      buy_price: 10,
      gst: 5,
      expiry: '2025-12-31',
    };
    const result = validateInventoryRow(row);
    expect(result.success).toBe(true);
    expect(result.data).toMatchObject(row);
  });

  it('returns failure for invalid row', () => {
    const row = {
      name: '', // invalid
      brand: '', // invalid
      type: 'Tablet',
      unit: 'strip',
      stock: -1, // invalid
      mrp: 12.5,
      buy_price: 10,
      gst: 30, // invalid
      expiry: '31-12-2025', // invalid format
    };
    const result = validateInventoryRow(row);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
