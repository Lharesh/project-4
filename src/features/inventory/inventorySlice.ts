import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { inventoryService } from './services/inventoryService';
import { InventoryItem, UploadError } from './types/inventory';
import { getMockInventoryList } from './mock/inv.mock';

interface LastUploadSummary {
  successCount: number;
  failureCount: number;
  timestamp: string;
}

export interface InvState {
  inventoryList: InventoryItem[];
  loading: boolean;
  uploadErrors: UploadError[];
  lastUploadSummary?: LastUploadSummary;
  successMessage: string | null;
  searchQuery: string;
  columnFilters: Record<string, string>; // key: column field, value: filter string
}

const initialState: InvState = {
  inventoryList: getMockInventoryList().map(item => ({ ...item, active: true })),
  loading: false,
  uploadErrors: [],
  lastUploadSummary: undefined,
  successMessage: null,
  searchQuery: '',
  columnFilters: {},
};

// --- Thunks ---
export const fetchInventoryList = createAsyncThunk(
  'inventory/fetchInventoryList',
  async (_, thunkAPI) => {
    try {
      return await inventoryService.getInventoryItems();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/addInventoryItem',
  async (data: InventoryItem, thunkAPI) => {
    try {
      const result = await inventoryService.addItem(data);
      console.log('[Redux:addInventoryItem] Success:', result);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Redux:addInventoryItem] Error:', message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateInventoryItem',
  async ({ id, data }: { id: string; data: Partial<InventoryItem> }, thunkAPI) => {
    try {
      const result = await inventoryService.editItem(id, data);
      console.log('[Redux:updateInventoryItem] Success:', result);
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Redux:updateInventoryItem] Error:', message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteInventoryItem',
  async (id: string, thunkAPI) => {
    try {
      const result = await inventoryService.removeItem(id);
      
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      
      return thunkAPI.rejectWithValue(message);
    }
  }
);

import { parseExcel } from '@/utils/parseExcel';
import { validateMappedRow } from '@/utils/validateMappedRow';
import { mockUploadResponse } from '@/data/inventory/upload_simulated_response';
import { InventorySchema } from '@/utils/inventorySchema';

export const uploadExcelFile = createAsyncThunk(
  'inventory/uploadExcelFile',
  async (file: File, thunkAPI) => {
    try {
      // 1. Parse Excel file
      const { headers, rows } = await parseExcel(file);
      // 2. Validate each row
      const errors: UploadError[] = [];
      const validRows: InventoryItem[] = [];
      rows.forEach((row, idx) => {
        const mappedRow: Record<string, any> = {};
        // Assume headers are mapped 1:1 to fields for now
        InventorySchema.forEach((field: import('@/components/ui/EditableRow').FieldDescriptor) => {
          mappedRow[field.field] = row[field.label] ?? row[field.field];
        });
        const rowErrors = validateMappedRow(mappedRow, InventorySchema);
        if (Object.keys(rowErrors).length) {
          errors.push({ row: idx + 2, errors: rowErrors, data: mappedRow });
        } else {
          validRows.push(mappedRow as InventoryItem);
        }
      });
      // 3. Simulate upload response
      const summary = {
        successCount: validRows.length,
        failureCount: errors.length,
        timestamp: new Date().toISOString(),
      };
      return { validRows, errors, summary };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const retryFailedRows = createAsyncThunk(
  'inventory/retryFailedRows',
  async (list: InventoryItem[], thunkAPI) => {
    try {
      // Simulate retry: validate again
      const errors: UploadError[] = [];
      const validRows: InventoryItem[] = [];
      list.forEach((row, idx) => {
        const rowErrors = validateMappedRow(row, InventorySchema);
        if (Object.keys(rowErrors).length) {
          errors.push({ row: idx + 2, errors: rowErrors, data: row });
        } else {
          validRows.push(row);
        }
      });
      const summary = {
        successCount: validRows.length,
        failureCount: errors.length,
        timestamp: new Date().toISOString(),
      };
      return { validRows, errors, summary };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const clearAllInventory = createAsyncThunk(
  'inventory/clearAllInventory',
  async (_, thunkAPI) => {
    try {
      return await inventoryService.clearInventory();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// --- Slice ---
const invSlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setColumnFilter(state, action: PayloadAction<{ field: string; value: string }>) {
      state.columnFilters[action.payload.field] = action.payload.value;
    },
    clearColumnFilter(state, action: PayloadAction<string>) {
      delete state.columnFilters[action.payload];
    },
    clearAllColumnFilters(state) {
      state.columnFilters = {};
    },
    setInventoryList(state, action: PayloadAction<InventoryItem[]>) {
      state.inventoryList = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setUploadErrors(state, action: PayloadAction<UploadError[]>) {
      state.uploadErrors = action.payload;
    },
    setLastUploadSummary(state, action: PayloadAction<LastUploadSummary | undefined>) {
      state.lastUploadSummary = action.payload;
    },
    setSuccessMessage(state, action: PayloadAction<string | null>) {
      state.successMessage = action.payload;
    },
    clearInventoryState(state) {
      state.inventoryList = [];
      state.uploadErrors = [];
      state.lastUploadSummary = undefined;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadExcelFile.fulfilled, (state, action: PayloadAction<any>) => {
        state.uploadErrors = action.payload.errors || [];
        state.lastUploadSummary = action.payload.summary;
      })
      .addCase(retryFailedRows.fulfilled, (state, action: PayloadAction<any>) => {
        state.uploadErrors = action.payload.errors || [];
        state.lastUploadSummary = action.payload.summary;
      })
      .addCase(addInventoryItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(addInventoryItem.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.successMessage = `Add failed: ${action.payload}`;
      })
      .addCase(addInventoryItem.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
        state.loading = false;
        state.inventoryList.unshift(action.payload);
        
      })
      .addCase(updateInventoryItem.fulfilled, (state, action: PayloadAction<InventoryItem>) => {
        const idx = state.inventoryList.findIndex(item => item.id === action.payload.id);
        if (idx !== -1) {
          state.inventoryList[idx] = { ...state.inventoryList[idx], ...action.payload };
          
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action: PayloadAction<string>) => {
        state.inventoryList = state.inventoryList.filter(item => item.id !== action.payload);
        
      });
  }
});

export const {
  setInventoryList,
  setLoading,
  setUploadErrors,
  setLastUploadSummary,
  setSuccessMessage,
  clearInventoryState,
  setSearchQuery,
  setColumnFilter,
  clearColumnFilter,
  clearAllColumnFilters
} = invSlice.actions;

export default invSlice.reducer;