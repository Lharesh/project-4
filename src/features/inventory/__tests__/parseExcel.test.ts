import { parseExcel } from '../utils/parseExcel';
import * as XLSX from 'xlsx';

describe('parseExcel', () => {
  it('parses valid Excel data', async () => {
    // Create a worksheet in array-of-arrays format
    const data = [
      ['name', 'stock', 'brand'],
      ['Ashwagandha', 10, 'Kottakkal'],
      ['Brahmi Oil', 5, 'Arya Vaidya Sala'],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // Write workbook to array buffer
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    const result = await parseExcel(excelBuffer);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].name).toBe('Ashwagandha');
    expect(result.rows[1].stock).toBe(5);
  });

  it('returns empty array for empty worksheet', async () => {
    const data: any[] = [['name', 'stock', 'brand']];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    const result = await parseExcel(excelBuffer);
    expect(result.rows).toHaveLength(0);
  });


  it('handles missing fields gracefully', async () => {
    // Some rows missing some fields
    const data = [
      ['name', 'brand', 'stock'],
      ['Ashwagandha', undefined, undefined],
      [undefined, 'Kottakkal', 10],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    const result = await parseExcel(excelBuffer);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0]).toHaveProperty('name');
    expect(result.rows[1]).toHaveProperty('brand');
  });

  it('ignores non-object rows (simulated by empty rows)', async () => {
    // Simulate empty/non-object rows by adding empty arrays
    const data = [
      ['name', 'stock'],
      ['Ashwagandha', 10],
      [],
      [undefined, undefined],
      ['Brahmi Oil', 5],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });

    const result = await parseExcel(excelBuffer);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].name).toBe('Ashwagandha');
    expect(result.rows[1].name).toBe('Brahmi Oil');
  });
});
