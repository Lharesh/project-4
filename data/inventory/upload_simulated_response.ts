export const mockUploadResponse = {
  success: true,
  added: 3,
  failed: 2,
  errors: [
    { rowNum: 2, field: 'brand', message: 'Missing brand' },
    { rowNum: 4, field: 'expiry', message: 'Invalid date format' }
  ]
};
