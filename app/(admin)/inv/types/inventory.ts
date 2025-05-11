export interface InventoryItem {
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
