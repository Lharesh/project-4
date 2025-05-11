// pages/index.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Plus, RefreshCcw, Upload, AlertTriangle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useRouter } from 'expo-router';
import { addInventoryItem, deleteInventoryItem, updateInventoryItem } from '@/redux/slices/inv.slice';
import { getMockInventoryList } from '../mock/inv.mock';
import type { InventoryItem } from '../types/inventory';
import EditableRow, { FieldDescriptor } from '@/components/ui/EditableRow';
import { InventorySchema } from '@/utils/inventorySchema';

const COLUMN_WIDTH = 120;

const InventoryPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(state => state.inventory.inventoryList);

  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<InventoryItem | null>(null);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  const [showDatePickerFor, setShowDatePickerFor] = useState<string | null>(null);

  useEffect(() => {
    if (!items || items.length === 0) {
      dispatch({ type: 'inventory/setInventoryList', payload: getMockInventoryList() });
    }
  }, []);

  // Static options for dropdowns
  const ALL_TYPE_OPTIONS = ['Churna', 'Oil', 'Tablet', 'Asava'];
  const ALL_UNIT_OPTIONS = ['gm', 'ml', 'tab'];
  const typeOptions = ALL_TYPE_OPTIONS;
  const unitOptions = ALL_UNIT_OPTIONS;

  const schema: FieldDescriptor[] = [
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

  const validate = (row: InventoryItem) => {
    const errs: Record<string, string> = {};
    for (const field of schema) {
      const val = row[field.field as keyof InventoryItem];
      if (field.required && (!val && val !== 0)) {
        errs[field.field] = 'Required';
      }
    }
    return errs;
  };

  const handleChange = (id: string, field: string, value: any) => {
    // Always allow editing for new row (id === 'new')
    if (id === 'new') {
      setNewRow(prev => (prev ? { ...prev, [field]: value } : { [field]: value } as InventoryItem));
      return;
    }
    // Allow editing for edit row
    if ((editRowId && id === editRowId) || (newRow && id === newRow.id)) {
      setNewRow(prev => (prev ? { ...prev, [field]: value } : { [field]: value } as InventoryItem));
    }
  };

  const handleSave = (row: InventoryItem) => {
    const errs = validate(row);
    if (Object.keys(errs).length) {
      setErrors(prev => ({ ...prev, [row.id]: errs }));
      return;
    }

    const exists = items.some(item => item.id === row.id);

    if (editRowId && row.id && row.id !== 'new') {
      // Update if editing and id is valid
      dispatch(updateInventoryItem({ id: row.id, data: { ...row } }));
    } else if (newRow && !exists) {
      // Add only if it's a new row and id doesn't exist
      dispatch(addInventoryItem(row));
    }
    setEditRowId(null);
    setNewRow(null);
    setErrors({});
  };

  const handleDelete = (id: string) => {
    dispatch(deleteInventoryItem(id));
    if (editRowId === id) setEditRowId(null);
    if (newRow && newRow.id === id) setNewRow(null);
  };

  const handleEdit = (id: string) => {
    const found = items.find(i => i.id === id);
    if (found) {
      setNewRow({ ...found, id }); // Ensure id is set to the item's id
      setEditRowId(id);
    }
  };

  const handleCancel = () => {
    setEditRowId(null);
    setNewRow(null);
    setErrors({});
  };

  const handleAdd = () => {
    setNewRow({ id: '', name: '', brand: '', type: '', unit: '', stock: 0, mrp: 0, buy_price: 0, gst: 0, expiry: '' });
    setEditRowId(null);
    setErrors({});
  };

  const handleDateChange = (date: string) => {
    if (newRow) setNewRow({ ...newRow, expiry: date });
    setShowDatePickerFor(null);
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.centeredContainer}>
        {/* Header Card with Buttons */}
        <View style={styles.headerCard}>
          <TouchableOpacity onPress={handleAdd} style={styles.iconButton}><Plus color="#fff" /></TouchableOpacity>
          <View style={styles.iconGroup}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#ff9800' }]} onPress={() => alert('Reorder')}>
              <RefreshCcw color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => {
              // Navigate to upload page
              router.push('/inv/pages/UploadInventory');
            }}>
              <Upload color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: '#f44336' }]} onPress={() => alert('Failed Upload')}>
              <AlertTriangle color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Scrollable Table */}
        <View style={styles.tableContainer}>
          <ScrollView horizontal contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <View style={[styles.headerCell, { width: COLUMN_WIDTH }]}><Text style={styles.headerText}>Actions</Text></View>
                {schema.map((col, idx) => (
                  <View key={col.field} style={[styles.headerCell, { width: COLUMN_WIDTH }]}><Text style={styles.headerText}>{col.label}{col.required && <Text style={styles.requiredText}>*</Text>}</Text></View>
                ))}
              </View>

              {items.map(item => (
                <EditableRow
                  key={item.id}
                  schema={schema}
                  rowData={editRowId === item.id ? newRow || item : item}
                  isEditing={editRowId === item.id}
                  errors={errors[item.id] || {}}
                  onChange={(field, value) => handleChange(item.id, field, value)}
                  onSave={() => handleSave(editRowId === item.id && newRow ? newRow : item)}
                  onCancel={handleCancel}
                  onEdit={() => handleEdit(item.id)}
                  onDelete={() => handleDelete(item.id)}
                  columnWidth={COLUMN_WIDTH}
                  showDatePicker={showDatePickerFor === item.id && editRowId === item.id}
                  onDateChange={handleDateChange}
                  onDatePress={() => setShowDatePickerFor(item.id)}
                  typeOptions={typeOptions}
                  unitOptions={unitOptions}
                  cellStyle={styles.dataCell}
                  rowWidth={schema.length * COLUMN_WIDTH + COLUMN_WIDTH}
                />
              ))}

              {newRow && !editRowId && (
                <EditableRow
                  key="new"
                  schema={schema}
                  rowData={newRow}
                  isEditing={true}
                  errors={errors['new'] || {}}
                  onChange={(field, value) => handleChange('new', field, value)}
                  onSave={() => handleSave(newRow)}
                  onCancel={handleCancel}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  showDatePicker={showDatePickerFor === 'new'}
                  onDateChange={handleDateChange}
                  onDatePress={() => setShowDatePickerFor('new')}
                  typeOptions={typeOptions}
                  unitOptions={unitOptions}
                  isNew
                  columnWidth={COLUMN_WIDTH}
                  dataCellTextAlign="left"
                />
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fafafa'
  },
  centeredContainer: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1200,
  },
  tableContainer: {
    margin: 15,
  },
  scrollViewContent: {
    minWidth: '100%',
  },
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    minWidth: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerCell: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  dataCell: {
    width: COLUMN_WIDTH,
    padding: 5,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  headerCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

export default InventoryPage;