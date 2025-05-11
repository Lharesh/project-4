import { z } from "zod";

export const inventorySchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  type: z.string().min(1),
  unit: z.string().min(1),
  stock: z.number().min(0),
  mrp: z.number().min(0),
  buy_price: z.number().min(0),
  gst: z.number().min(0).max(28),
  expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export function validateInventoryRow(row: any) {
  return inventorySchema.safeParse(row);
}
