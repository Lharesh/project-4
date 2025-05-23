import { splitValidInvalidRecords } from '../splitValidInvalidRecords';

describe('splitValidInvalidRecords', () => {
  it('splits valid and invalid inventory records correctly', () => {
    const validRow = {
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
    const invalidRow = {
      name: '', // invalid (empty)
      brand: '', // invalid (empty)
      type: 'Tablet',
      unit: 'strip',
      stock: -1, // invalid (negative)
      mrp: 12.5,
      buy_price: 10,
      gst: 30, // invalid (too high)
      expiry: '31-12-2025', // invalid (wrong format)
    };
    const rows = [validRow, invalidRow];
    const { valid, invalid } = splitValidInvalidRecords(rows);
    expect(valid.length).toBe(1);
    expect(invalid.length).toBe(1);
    expect(valid[0]).toMatchObject(validRow);
    expect(invalid[0]).toHaveProperty('row');
    expect(invalid[0]).toHaveProperty('errors');
  });
});
