import { validateInventoryRow } from "./validateInventoryExcel";

export function splitValidInvalidRecords(rows: any[]) {
  const valid: any[] = [];
  const invalid: { row: any; errors: any }[] = [];

  rows.forEach((row) => {
    const result = validateInventoryRow(row);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ row, errors: result.error.flatten() });
    }
  });

  return { valid, invalid };
}
