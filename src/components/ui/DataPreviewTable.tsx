import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import dayjs from 'dayjs';
import type { FieldDescriptor } from './EditableRow';
import type { UploadError } from '@/app/(admin)/inv/types/inventory';

interface DataPreviewTableProps {
  rows: Record<string, any>[];
  schema: FieldDescriptor[];
  errors: UploadError[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
  rowsPerPage?: number;
}

const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ rows, schema, errors, currentPage = 1, onPageChange, rowsPerPage = 10 }) => {
  // Map rowNum to error object for quick lookup
  const errorMap = React.useMemo(() => {
    const map: Record<number, UploadError> = {};
    errors.forEach(e => { map[e.row] = e; });
    return map;
  }, [errors]);

  // Pagination logic
  const totalRows = rows.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalRows);
  const pageRows = rows.slice(startIdx, endIdx);

  return (
    <ScrollView horizontal style={styles.scroll}>
      <View>
        {/* Header row */}
        <View style={styles.headerRow}>
          {schema.map(col => (
            <View key={col.field} style={styles.cellWrap}>
              <Text style={styles.headerCell}>{col.label}</Text>
            </View>
          ))}
        </View>
        {/* Data rows */}
        {pageRows.map((row, idx) => {
          const rowNum = startIdx + idx + 2; // Excel row number
          const rowError = errorMap[rowNum];
          return (
            <View key={rowNum} style={[styles.dataRow, rowError ? styles.errorRow : styles.successRow]}>
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
            </View>
          );
        })}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 }}>
            <Text style={{ marginHorizontal: 8, fontSize: 18, color: '#333' }} onPress={() => onPageChange && currentPage > 1 && onPageChange(currentPage - 1)}>{'<'}</Text>
            <Text style={{ fontSize: 16, color: '#333' }}>{currentPage} / {totalPages}</Text>
            <Text style={{ marginHorizontal: 8, fontSize: 18, color: '#333' }} onPress={() => onPageChange && currentPage < totalPages && onPageChange(currentPage + 1)}>{'>'}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 10,
    maxHeight: 300,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F7C873', // Pitta yellow
    paddingVertical: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    width: 110,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#6D4D2F', // Ayurveda brown
    fontSize: 15,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cellWrap: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: '#E57373', // Kapha (earthy red)
    fontSize: 12,
    marginTop: 2,
  },
  errorRow: {
    backgroundColor: '#FFF4F4',
  },
  successRow: {
    backgroundColor: '#F8FFF6',
  },
});

export default DataPreviewTable;
