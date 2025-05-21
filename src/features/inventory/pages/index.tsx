// pages/index.tsx

import React, { useEffect, useState } from 'react';
import { useInventoryPagination } from '../components/useInventoryPagination';

import { useInventoryCRUD } from '../components/useInventoryCRUD';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput } from 'react-native';
// Responsive CSS for web only
// @ts-ignore
if (typeof window !== 'undefined') {
  require('./header-responsive.css');
  require('./header-children-responsive.css');
}
// Removed Platform usage

import InventoryCardAndTable from '../components/InventoryCardAndTable';

// ...other imports

import Card from '/Users/ayurparishkar/Downloads/project 4/components/ui/Card';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useRouter } from 'expo-router';
import { addInventoryItem, deleteInventoryItem, updateInventoryItem } from '@/redux/slices/inv.slice';

import type { InventoryItem } from '../types/inventory';
import EditableRow, { FieldDescriptor } from '@/components/ui/EditableRow';
import Pagination from '@/components/ui/Pagination';

import { validateInventoryItem } from '../utils/inventoryUtils';
import { sortInventoryItems, SortableInventoryField } from '../utils/inventorySort';
import { filterInventoryItems } from '../utils/inventoryFilters';

import { COLORS } from '/Users/ayurparishkar/Downloads/project 4/constants/theme';

import { Platform, Dimensions } from 'react-native';
import { COLUMN_WIDTH, NUM_COLUMNS, TABLE_MIN_WIDTH, inventoryTableStyles } from '../components/InventoryTable.styles';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    padding: 0,
  },
  centeredContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  scrollViewContent: {
    // minWidth removed to allow proper horizontal scroll
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: Platform.OS === 'web' ? TABLE_MIN_WIDTH : '100%',
    width: Platform.OS === 'web' ? TABLE_MIN_WIDTH : '100%',
  },

  iconButton: {
    backgroundColor: '#1976D2',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  headerText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
    color: '#222',
  },
  requiredText: {
    color: 'red',
    fontWeight: 'bold',
  }
});

const InventoryPage = () => {
  // Redux selectors
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(state => state.inventory.inventoryList);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const columnFiltersRecord: Record<string, string> = columnFilters;

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
  } = useInventoryPagination(items);

  // CRUD
  const {
    editRowId,
    setEditRowId,
    newRow,
    setNewRow,
    errors,
    setErrors,
    handleAdd,
    handleEdit,
    handleDelete,
    handleCancel,
  } = useInventoryCRUD(
    (item) => dispatch(addInventoryItem(item)),
    (id) => dispatch(deleteInventoryItem(id))
  );

  const [showDatePickerFor, setShowDatePickerFor] = useState<string | null>(null);

  // State for which filter popover is open
  const [activeFilter, setActiveFilter] = useState<null | 'type' | 'brand'>(null);

  // Search handler for search bar
  const handleSearch = (text: string) => setSearchQuery(text);

  // Handler to clear a filter for a field
  const handleClearFilter = (field: string) => {
    setColumnFilters(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  // Sorting state
  const [sortBy, setSortBy] = useState<SortableInventoryField | ''>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtering, sorting, and pagination logic
  const filteredItems = filterInventoryItems(items, {
    searchQuery,
    columnFilters: columnFilters,
  });
  // Only sort if sortBy is not empty string
  const sortedItems = sortBy ? sortInventoryItems(filteredItems, sortBy, sortDirection) : filteredItems;
  // Pagination logic
  const paginatedItems = sortedItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    // Optionally: fetch initial inventory if needed
  }, []);

  // Static options for dropdowns
  const ALL_TYPE_OPTIONS = ['Churna', 'Oil', 'Tablet', 'Asava'];
  const ALL_UNIT_OPTIONS = ['gm', 'ml', 'tab'];
  const typeOptions = ALL_TYPE_OPTIONS;
  const unitOptions = ALL_UNIT_OPTIONS;

  const schema: FieldDescriptor[] = [
    { field: 'active', label: 'Active', type: 'checkbox', required: false },
    { field: 'id', label: 'SKU', type: 'text', required: true },
    { field: 'name', label: 'Name', type: 'text', required: true },
    { field: 'brand', label: 'Brand', type: 'text', required: true },
    { field: 'type', label: 'Type', type: 'select', required: true, optionsKey: 'typeOptions' },
    { field: 'unit', label: 'Unit', type: 'select', required: true, optionsKey: 'unitOptions' },
    { field: 'stock', label: 'Stock', type: 'number', required: true },
    { field: 'mrp', label: 'MRP', type: 'number', required: true },
    { field: 'buy_price', label: 'Buy Price', type: 'number', required: true },
    { field: 'gst', label: 'GST', type: 'number', required: true },
    { field: 'expiry', label: 'Expiry', type: 'date', required: true },
  ];

  // State for editing an existing row
  const [editRowData, setEditRowData] = useState<InventoryItem | null>(null);

  // Handles changes in editable fields (for both new and existing rows)
  const handleChange = (id: string, field: string, value: any) => {
    //'[handleChange] Called with:', { id, field, value });

    if (id === 'new') {
      setNewRow((prev: any) => {
        if (!prev) return null;
        const updated = { ...prev, [field]: value };
        //'[handleChange] Updating new row:', updated);
        return updated;
      });
      setErrors((prev: any) => ({
        ...prev,
        new: { ...prev?.new, [field]: undefined }
      }));
    } else {
      setEditRowData((prev: any) => {
        const updated = { ...(prev || items.find(item => item.id === id)), [field]: value };
        //'[handleChange] Updating editRowData:', updated);
        return updated;
      });
      setErrors((prev: any) => ({
        ...prev,
        [id]: { ...prev?.[id], [field]: undefined }
      }));
    }
  };

  const handleSave = (row: InventoryItem) => {
    // Ensure SKU is always present for validation and saving
    // IMPORTANT: Always ensure both 'id' and 'sku' are present and synchronized.
    // This is required because validation and backend logic expect both fields,
    // and some rows may only have one of them set (e.g., new or imported rows).
    // Do not remove this logic unless you update all validation and backend code accordingly.
    const payload = { ...row, sku: row.sku || row.id, id: row.id || row.sku };

    //'[handleSave] Attempting to save:', payload);

    const validationErrors = validateInventoryItem(payload);
    if (Object.keys(validationErrors).length > 0) {
      //'[handleSave] Validation errors:', validationErrors);
      setErrors(prev => ({
        ...prev,
        [row.id || 'new']: validationErrors
      }));
      return;
    }

    const clearEditState = () => {
      setEditRowId(null);
      setEditRowData(null);
      setNewRow(null);
      setErrors({});
    };

    const isNewRow = editRowId === null && !!newRow;

    if (!isNewRow) {
      dispatch(updateInventoryItem({ id: payload.id, data: payload }))
        .then((result: any) => {
          if (!result.error) {
            clearEditState();
          }
        });
    } else {
      // Create new ID in the format: Inv_<first 3 letters of type>_<first 5 letters of name>_<first 3 letters of brand>
      // Example: type: "Churna", name: "Ashwagandha", brand: "Kottakkal" => Inv_Chu_Ashwa_Kot
      function getPrefix(str: string | undefined, len: number) {
        if (!str) return '';
        return str.replace(/\s+/g, '').substring(0, len).replace(/[^a-zA-Z0-9]/g, '');
      }
      const typePrefix = getPrefix(payload.type, 3);
      const namePrefix = getPrefix(payload.name, 5);
      const brandPrefix = getPrefix(payload.brand, 3);
      const newId = `Inv_${typePrefix}_${namePrefix}_${brandPrefix}`;
      // Remove UI-only fields before saving
      const { isEditing, formattedDate, ...cleanRow } = payload as any;
      const newRowObj = { ...cleanRow, id: newId, sku: newId };
      dispatch(addInventoryItem(newRowObj))
        .then((result: any) => {
          if (!result.error) {
            clearEditState();
            setSearchQuery('');
            setColumnFilters({});
            setCurrentPage(1);
          }
        });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Table and Pagination below header card */}
      <InventoryCardAndTable
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        handleAdd={handleAdd}
        onUpload={() => router.push('/inv/pages/UploadInventory')}
        paginatedItems={paginatedItems}
        schema={schema}
        editRowId={editRowId}
        newRow={newRow}
        editRowData={editRowData}
        errors={errors}
        handleChange={handleChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleEdit={(id: string) => handleEdit(id, items)}
        handleDelete={handleDelete}
        showDatePickerFor={showDatePickerFor}
        setShowDatePickerFor={setShowDatePickerFor}
        typeOptions={typeOptions}
        unitOptions={unitOptions}
        COLUMN_WIDTH={COLUMN_WIDTH}
        NUM_COLUMNS={NUM_COLUMNS}
        columnFilters={columnFiltersRecord}
        onFilterChange={(field, value) => setColumnFilters(prev => ({ ...prev, [field]: value }))}
        onClearFilter={handleClearFilter}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={(field: string) => {
          const allowed: SortableInventoryField[] = ['name', 'unit', 'stock', 'mrp', 'gst', 'expiry', 'buy_price'];
          if (allowed.includes(field as SortableInventoryField)) {
            setSortBy(field as SortableInventoryField);
            setSortDirection(sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc');
          }
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
      />
    </View>
  );
};

export default InventoryPage;