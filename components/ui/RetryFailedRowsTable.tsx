import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { X, Edit2 } from 'lucide-react-native';
import EditableRow from './EditableRow';
import { validateMappedRow } from '@/utils/validateMappedRow';
import type { FieldDescriptor } from './EditableRow';
import type { UploadError } from '@/app/(admin)/inv/types/inventory';

interface RetryFailedRowsTableProps {
  rows: Record<string, any>[];
  schema: FieldDescriptor[];
  errors: UploadError[];
  onSkip: (rowIdx: number) => void;
  skippedRows: Set<number>;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
  onRowUpdate?: (idx: number, updated: Record<string, any>) => void;
}

const RetryFailedRowsTable: React.FC<RetryFailedRowsTableProps> = ({ rows, schema, errors, onSkip, skippedRows, currentPage = 1, onPageChange, rowsPerPage = 10, onRowUpdate }) => {
  const errorMap = React.useMemo(() => {
    const map: Record<number, UploadError> = {};
    errors.forEach(e => { map[e.row] = e; });
    return map;
  }, [errors]);

  // Editing state
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editRowData, setEditRowData] = useState<Record<string, any>>({});
  const [editRowErrors, setEditRowErrors] = useState<Record<string, string>>({});

  // Pagination logic
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
  const pageRows = rows.slice(startIdx, endIdx);

  const handleEdit = (idx: number, row: Record<string, any>) => {
    setEditingIdx(idx);
    setEditRowData({ ...row });
    setEditRowErrors(validateMappedRow(row, schema));
  };
  const handleCancel = () => {
    setEditingIdx(null);
    setEditRowData({});
    setEditRowErrors({});
  };
  const handleSave = (idx: number) => {
    // Validate before saving
    const errors = validateMappedRow(editRowData, schema);
    setEditRowErrors(errors);
    if (Object.keys(errors).length === 0) {
      if (typeof onRowUpdate === 'function') {
        onRowUpdate(idx, editRowData);
      } else {
        Object.assign(rows[idx], editRowData);
      }
      setEditingIdx(null);
      setEditRowData({});
      setEditRowErrors({});
    }
  };

  const handleChange = (field: string, value: any) => {
    setEditRowData(prev => {
      const updated = { ...prev, [field]: value };
      setEditRowErrors(validateMappedRow(updated, schema));
      return updated;
    });
  };

  return (
    <View>
      {/* Header row */}
      <View style={styles.headerRow}>
        {schema.map(col => (
          <View key={col.field} style={styles.cellWrap}>
            <Text style={styles.headerCell}>{col.label}</Text>
          </View>
        ))}
        <View style={styles.cellWrap}><Text style={styles.headerCell}>Action</Text></View>
      </View>
      {/* Data rows */}
      {pageRows.map((row, idx) => {
        const globalIdx = startIdx + idx;
        const rowError = errorMap[globalIdx + 2]; // Excel row number
        if (skippedRows.has(globalIdx)) return null;
        if (editingIdx === globalIdx) {
          return (
            <EditableRow
              key={globalIdx}
              schema={schema}
              rowData={editRowData}
              isEditing={true}
              errors={editRowErrors}
              onChange={handleChange}
              onSave={() => handleSave(globalIdx)}
              onCancel={handleCancel}
              onEdit={() => {}}
              onDelete={() => onSkip(globalIdx)}
            />
          );
        }
        return (
          <View key={globalIdx} style={[styles.dataRow, rowError ? styles.errorRow : styles.successRow]}>
            {schema.map(col => (
              <View key={col.field} style={styles.cellWrap}>
                <Text style={styles.cell}>{
                  col.field === 'expiry'
                    ? (dayjs(row.expiry).isValid() ? dayjs(row.expiry).format('YYYY-MM-DD') : String(row.expiry ?? ''))
                    : String(row[col.field] ?? '')
                }</Text>
                {rowError && rowError.errors[col.field] && (
                  <Text style={styles.errorText}>{rowError.errors[col.field]}</Text>
                )}
              </View>
            ))}
            <View style={styles.cellWrap}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => onSkip(globalIdx)}>
                <X size={18} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#1976D2', marginTop: 4 }]} onPress={() => handleEdit(globalIdx, row)}>
                <Edit2 size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity disabled={currentPage === 1} onPress={() => onPageChange && onPageChange(currentPage - 1)}><Text style={styles.pageBtn}>{'<'}</Text></TouchableOpacity>
          <Text style={styles.pageNum}>{currentPage} / {totalPages}</Text>
          <TouchableOpacity disabled={currentPage === totalPages} onPress={() => onPageChange && onPageChange(currentPage + 1)}><Text style={styles.pageBtn}>{'>'}</Text></TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', backgroundColor: '#F7C873', paddingVertical: 8, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  headerCell: { width: 110, textAlign: 'center', fontWeight: 'bold', color: '#6D4D2F', fontSize: 15 },
  dataRow: { flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 1, borderColor: '#eee' },
  cellWrap: { width: 110, alignItems: 'center', justifyContent: 'center' },
  cell: { fontSize: 14, color: '#333' },
  errorText: { color: '#E57373', fontSize: 12, marginTop: 2 },
  errorRow: { backgroundColor: '#FFF4F4' },
  successRow: { backgroundColor: '#F8FFF6' },
  iconBtn: { backgroundColor: '#E57373', padding: 6, borderRadius: 4, marginTop: 4, alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { display: 'none' },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  pageBtn: { marginHorizontal: 8, fontSize: 18, color: '#333' },
  pageNum: { fontSize: 16, color: '#333' },
});

export default RetryFailedRowsTable;
