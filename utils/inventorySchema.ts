import type { FieldDescriptor } from '../components/ui/EditableRow';

export const InventorySchema: FieldDescriptor[] = [
  { field: 'id', label: 'SKU', type: 'text', required: true },
  { field: 'name', label: 'Name', type: 'text', required: true },
  { field: 'brand', label: 'Brand', type: 'text', required: true },
  { field: 'type', label: 'Type', type: 'select', required: true },
  { field: 'unit', label: 'Unit', type: 'select', required: true },
  { field: 'stock', label: 'Stock', type: 'number', required: true },
  { field: 'mrp', label: 'MRP', type: 'number', required: true },
  { field: 'buy_price', label: 'Buy Price', type: 'number', required: true },
  { field: 'gst', label: 'GST', type: 'number', required: true },
  { field: 'expiry', label: 'Expiry', type: 'date', required: true }
];
