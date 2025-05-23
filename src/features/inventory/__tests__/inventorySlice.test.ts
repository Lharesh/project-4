import reducer, {
  setInventoryList,
  setLoading,
  setSuccessMessage,
  setSearchQuery,
  setColumnFilter,
  clearColumnFilter,
  clearAllColumnFilters,
  setUploadErrors,
  setLastUploadSummary,
  clearInventoryState,
  initialState
} from '../inventorySlice';

const mockItem = {
  id: 'SKU100',
  name: 'Test Product',
  sku: 'SKU100',
  brand: 'Test Brand',
  type: 'Tablet',
  unit: 'tab',
  stock: 10,
  mrp: 100,
  buy_price: 80,
  gst: 5,
  expiry: '2026-01-01',
  active: true
};

describe('inventorySlice', () => {
  it('should return the initial state', () => {
    const state = reducer(undefined, { type: undefined });
    // Should match the seeded initialState (with mock inventory)
    expect(Array.isArray(state.inventoryList)).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.uploadErrors).toEqual([]);
    expect(state.successMessage).toBeNull();
    expect(state.searchQuery).toBe('');
    expect(state.columnFilters).toEqual({});
  });

  it('should handle setInventoryList', () => {
    const state = reducer(initialState, setInventoryList([mockItem]));
    expect(state.inventoryList).toHaveLength(1);
    expect(state.inventoryList[0].id).toBe('SKU100');
  });

  it('should handle setLoading', () => {
    const state = reducer(initialState, setLoading(true));
    expect(state.loading).toBe(true);
  });

  it('should handle setSuccessMessage', () => {
    const msg = 'Success!';
    const state = reducer(initialState, setSuccessMessage(msg));
    expect(state.successMessage).toBe(msg);
  });

  it('should handle setSearchQuery', () => {
    const state = reducer(initialState, setSearchQuery('ashwa'));
    expect(state.searchQuery).toBe('ashwa');
  });

  it('should handle setColumnFilter/clearColumnFilter/clearAllColumnFilters', () => {
    let state = reducer(initialState, setColumnFilter({ field: 'brand', value: 'Kottakkal' }));
    expect(state.columnFilters.brand).toBe('Kottakkal');
    state = reducer(state, clearColumnFilter('brand'));
    expect(state.columnFilters.brand).toBeUndefined();
    state = reducer(state, setColumnFilter({ field: 'type', value: 'Tablet' }));
    state = reducer(state, clearAllColumnFilters());
    expect(Object.keys(state.columnFilters)).toHaveLength(0);
  });

  it('should handle setUploadErrors', () => {
    const errors = [{ row: 1, message: 'Invalid SKU' }];
    const state = reducer(initialState, setUploadErrors(errors));
    expect(state.uploadErrors).toEqual(errors);
  });

  it('should handle setLastUploadSummary', () => {
    const summary = { successCount: 3, failureCount: 1, timestamp: '2025-05-21T15:00:00+05:30' };
    const state = reducer(initialState, setLastUploadSummary(summary));
    expect(state.lastUploadSummary).toEqual(summary);
  });

  it('should handle clearInventoryState', () => {
    const dirtyState = {
      ...initialState,
      loading: true,
      uploadErrors: [{ row: 1, errors: { foo: 'err' }, data: {} }],
      lastUploadSummary: { successCount: 1, failureCount: 0, timestamp: 'now' },
      successMessage: 'msg',
      searchQuery: 'test',
      columnFilters: { brand: 'X' },
    };
    const state = reducer(dirtyState, clearInventoryState());
    // Only the fields that clearInventoryState actually resets
    expect(state.inventoryList).toEqual([]);
    expect(state.uploadErrors).toEqual([]);
    expect(state.lastUploadSummary).toBeUndefined();
    expect(state.successMessage).toBeNull();
  });

  it('should handle async thunk fulfilled (addInventoryItem)', () => {
    const action = { type: 'inventory/addInventoryItem/fulfilled', payload: mockItem };
    const state = reducer(initialState, action);
    expect(state.inventoryList.some(i => i.id === mockItem.id)).toBe(true);
  });

  it('should handle async thunk fulfilled (updateInventoryItem)', () => {
    const orig = { ...mockItem, name: 'Old Name' };
    const startState = { ...initialState, inventoryList: [orig] };
    const updated = { ...orig, name: 'Updated Name' };
    const action = { type: 'inventory/updateInventoryItem/fulfilled', payload: updated };
    const state = reducer(startState, action);
    expect(state.inventoryList[0].name).toBe('Updated Name');
  });

  it('should handle async thunk fulfilled (deleteInventoryItem)', () => {
    const startState = { ...initialState, inventoryList: [mockItem] };
    const action = { type: 'inventory/deleteInventoryItem/fulfilled', payload: mockItem.id };
    const state = reducer(startState, action);
    expect(state.inventoryList.find(i => i.id === mockItem.id)).toBeUndefined();
  });

  it('should handle addInventoryItem.pending and rejected', () => {
    let state = reducer(initialState, { type: 'inventory/addInventoryItem/pending' });
    expect(state.loading).toBe(true);
    state = reducer(state, { type: 'inventory/addInventoryItem/rejected', payload: 'fail reason' });
    expect(state.loading).toBe(false);
    expect(state.successMessage).toMatch(/Add failed/);
  });

  it('should handle uploadExcelFile.fulfilled', () => {
    const action = {
      type: 'inventory/uploadExcelFile/fulfilled',
      payload: {
        errors: [{ row: 2, errors: { sku: 'Missing' }, data: {} }],
        summary: { successCount: 1, failureCount: 1, timestamp: 'now' }
      }
    };
    const state = reducer(initialState, action);
    expect(state.uploadErrors.length).toBe(1);
    expect(state.lastUploadSummary).toBeDefined();
  });

  it('should handle retryFailedRows.fulfilled', () => {
    const action = {
      type: 'inventory/retryFailedRows/fulfilled',
      payload: {
        errors: [],
        summary: { successCount: 2, failureCount: 0, timestamp: 'now' }
      }
    };
    const state = reducer(initialState, action);
    expect(state.uploadErrors).toEqual([]);
    expect(state.lastUploadSummary).toBeDefined();
  });

  it('should handle edge case: updateInventoryItem for non-existing item', () => {
    const updated = { ...mockItem, id: 'notfound', name: 'Nope' };
    const action = { type: 'inventory/updateInventoryItem/fulfilled', payload: updated };
    const state = reducer(initialState, action);
    // Should not add new item
    expect(state.inventoryList.find(i => i.id === 'notfound')).toBeUndefined();
  });
});
