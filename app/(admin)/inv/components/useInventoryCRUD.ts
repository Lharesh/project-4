import { useState } from 'react';
import type { InventoryItem } from '../types/inventory';

export function useInventoryCRUD(onSave?: (item: InventoryItem) => void, onDelete?: (id: string) => void) {
  const [editRowId, setEditRowId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<InventoryItem | null>(null);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  const handleAdd = () => {
    const newItem = {
      id: 'new',
      sku: 'new', // Set this to 'new' so it shows up in the editable row
      active: true,
      name: '',
      brand: '',
      type: '',
      unit: '',
      stock: 0,
      mrp: 0,
      buy_price: 0,
      gst: 0,
      expiry: ''
    };
  
    setNewRow(newItem);
    setEditRowId(null);
    setErrors({});
  };

  const handleEdit = (id: string, items: InventoryItem[]) => {
    console.log('[handleEdit] Starting edit for row:', id);
    const found = items.find(i => i.id === id);
    if (found) {
      console.log('[handleEdit] Found item to edit:', found);
      setNewRow({ ...found });
      setEditRowId(id);
      setErrors({});
    } else {
      console.warn('[handleEdit] Could not find item with id:', id);
    }
  };

  const handleDelete = (id: string) => {
    if (onDelete) onDelete(id);
    if (editRowId === id) setEditRowId(null);
    if (newRow && newRow.id === id) setNewRow(null);
  };

  const handleCancel = () => {
    setEditRowId(null);
    setNewRow(null);
    setErrors({});
  };

  // Validation and save logic can be passed in or extended here

  return {
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
  };
}
