import * as XLSX from 'xlsx';

/**
 * Parses an Excel file (ArrayBuffer or File) and returns headers and rows.
 * @param file Excel file as ArrayBuffer or File
 * @returns { headers: string[], rows: Record<string, any>[] }
 */
export async function parseExcel(file: ArrayBuffer | File): Promise<{ headers: string[]; normalizedHeaders: string[]; rows: Record<string, any>[] }> {
  let data: ArrayBuffer;
  if (file instanceof File) {
    data = await file.arrayBuffer();
  } else {
    data = file;
  }
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const [headerRow, ...dataRows] = json;
  // Normalize headers: remove whitespace, required marker, and tooltips
  function normalizeHeader(h: string) {
    return String(h)
      .replace(/\*/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
  const originalHeaders: string[] = (headerRow as string[]).map(h => String(h));
  const normalizedHeaders: string[] = originalHeaders.map(normalizeHeader).filter(h => h);
  // Only keep data rows that have at least one non-empty cell
  const rows = dataRows
    .filter(row => Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== ''))
    .map(row => {
      const obj: Record<string, any> = {};
      normalizedHeaders.forEach((h, idx) => {
        obj[h] = row[idx];
      });
      return obj;
    });
  return { headers: originalHeaders, normalizedHeaders, rows };
}
