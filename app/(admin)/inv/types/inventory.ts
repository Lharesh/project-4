/**
 * InventoryItem: Represents an item in inventory.
 *
 * IMPORTANT: Both 'id' and 'sku' must be present and synchronized for
 * validation and backend compatibility. Some validation and backend logic
 * expects both fields, so always ensure both are set for every item.
 */
export interface InventoryItem {
  sku: string; // SKU code
  active: boolean; // Is Active (default: true)
  id: string;
  name: string;
  brand: string;
  type: string;
  unit: string;
  stock: number;
  mrp: number;
  buy_price: number;
  gst: number;
  expiry: string; // ISO format yyyy-mm-dd
}

export interface UploadError {
  row: number;
  errors: Record<string, string>;
  data: Partial<InventoryItem>;
}
