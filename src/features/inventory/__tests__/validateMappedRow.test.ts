import { validateMappedRow } from '../../../utils/validateMappedRow';
import type { FieldDescriptor } from '../../../components/ui/EditableRow';

describe('validateMappedRow', () => {
  const schema: FieldDescriptor[] = [
    { field: 'name', label: 'Name', type: 'text', required: true },
    { field: 'stock', label: 'Stock', type: 'number', required: true },
    { field: 'brand', label: 'Brand', type: 'text', required: false },
  ];
  it('returns no errors for valid row', () => {
    const row = { name: 'Ashwagandha', stock: 10, brand: 'Kottakkal' };
    expect(validateMappedRow(row, schema)).toEqual({});
  });

  it('returns errors for missing required fields', () => {
    const row = { stock: 10 };
    const errors = validateMappedRow(row, schema);
    expect(errors).toHaveProperty('name');
  });

  it('returns errors for invalid stock', () => {
    const row = { name: 'Ashwagandha', stock: -5, brand: 'Kottakkal' };
    const errors = validateMappedRow(row, schema);
    expect(errors).toHaveProperty('stock');
  });

  it('returns errors for invalid types', () => {
    const row = { name: 123, stock: 'ten', brand: 456 };
    const errors = validateMappedRow(row, schema);
    expect(errors.name).toBeDefined();
    expect(errors.stock).toBeDefined();
  });

  it('handles empty row gracefully', () => {
    expect(validateMappedRow({}, schema)).toHaveProperty('name');
  });
});
