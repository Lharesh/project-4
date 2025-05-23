import { validateMappedRow } from '../validateMappedRow';
import type { FieldDescriptor } from '@/components/ui/EditableRow';

describe('validateMappedRow', () => {
  const schema: FieldDescriptor[] = [
    { field: 'name', label: 'Name', required: true, type: 'text' },
    { field: 'stock', label: 'Stock', required: true, type: 'number' },
    { field: 'expiry', label: 'Expiry', required: false, type: 'date' },
  ];

  it('returns no errors for valid row', () => {
    const row = { name: 'Paracetamol', stock: 10, expiry: '2025-12-31' };
    expect(validateMappedRow(row, schema)).toEqual({});
  });

  it('returns required error for missing required fields', () => {
    const row = { stock: 10 };
    expect(validateMappedRow(row, schema)).toHaveProperty('name', 'Required');
  });

  it('returns number error for invalid number', () => {
    const row = { name: 'Paracetamol', stock: 'abc', expiry: '2025-12-31' };
    expect(validateMappedRow(row, schema)).toHaveProperty('stock', 'Must be a number');
  });

  it('returns date error for invalid date', () => {
    const row = { name: 'Paracetamol', stock: 10, expiry: '31-12-2025' };
    expect(validateMappedRow(row, schema)).toHaveProperty('expiry', 'Invalid date (yyyy-mm-dd)');
  });

  it('returns required error for empty string', () => {
    const row = { name: '', stock: 10 };
    expect(validateMappedRow(row, schema)).toHaveProperty('name', 'Required');
  });

  it('returns positive number error for negative stock', () => {
    const row = { name: 'Paracetamol', stock: -5, expiry: '2025-12-31' };
    expect(validateMappedRow(row, schema)).toHaveProperty('stock', 'Must be a positive number');
  });

  it('returns real date error for non-existent date', () => {
    const row = { name: 'Paracetamol', stock: 10, expiry: '2025-02-30' };
    expect(validateMappedRow(row, schema)).toHaveProperty('expiry', 'Invalid date (not a real date)');
  });

  it('accepts valid edge case: stock zero', () => {
    const row = { name: 'Paracetamol', stock: 0, expiry: '2025-12-31' };
    expect(validateMappedRow(row, schema)).toEqual({});
  });
});
