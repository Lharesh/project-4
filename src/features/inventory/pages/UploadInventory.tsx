import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { RootState } from '../../../redux/store';
import type { UploadError, InventoryItem } from '../types/inventory';
import type { InvState } from '../inventorySlice';
import { View, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, Linking, Platform } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import DownloadTemplateButton from '@/components/ui/DownloadTemplateButton';
import ExcelUploadInput from '@/components/ui/ExcelUploadInput';
import FieldMappingTable from '@/components/ui/FieldMappingTable';
import DataPreviewTable from '@/components/ui/DataPreviewTable';
import RetryFailedRowsTable from '@/components/ui/RetryFailedRowsTable';
import UploadErrorBanner from '@/components/ui/UploadErrorBanner';
import ConfirmUploadModal from '@/components/ui/ConfirmUploadModal';
import { InventorySchema } from '@/utils/inventorySchema';
import { parseExcel } from '@/features/inventory/utils/parseExcel';
import { validateMappedRow } from '@/utils/validateMappedRow';
import { uploadExcelFile, retryFailedRows, setUploadErrors, setLastUploadSummary, addInventoryItem } from '../inventorySlice';

const TEMPLATE_URL = Platform.select({
  web: '/templates/inventory_template.xlsx',
  default: 'https://your-server.com/templates/inventory_template.xlsx', // fallback for native
});

const UploadInventory: React.FC = () => {
  const dispatch = useAppDispatch();
  // Import all valid rows into inventory
  const handleImportAll = (): void => {
    const validRows = mappedRows
      .filter((row: Record<string, any>) => typeof row.id === 'string' && row.id.length > 0)
      .map((row: Record<string, any>) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        brand: String(row.brand ?? ''),
        type: String(row.type ?? ''),
        unit: String(row.unit ?? ''),
        stock: Number(row.stock ?? 0),
        mrp: Number(row.mrp ?? 0),
        buy_price: Number(row.buy_price ?? 0),
        gst: Number(row.gst ?? 0),
        expiry: row.expiry ? require('dayjs')(row.expiry).isValid() ? require('dayjs')(row.expiry).format('YYYY-MM-DD') : '' : '',
      })) as InventoryItem[];
    validRows.forEach((row: InventoryItem) => dispatch(addInventoryItem(row)));
    setStep('done');
    dispatch(setUploadErrors([]));
    dispatch(setLastUploadSummary({ successCount: validRows.length, failureCount: 0, timestamp: new Date().toISOString() }));
  };

  // Import valid retry rows into inventory
  const handleImportRetryRows = (): void => {
    if (!uploadErrors) return;
    const validRows = uploadErrors
      .filter((e: UploadError, idx: number) => Object.keys(e.errors).length === 0 && !skippedRows.has(uploadErrors.indexOf(e)))
      .map((e: UploadError, idx: number) => ({
        ...e.data,
        expiry: e.data.expiry ? require('dayjs')(e.data.expiry).isValid() ? require('dayjs')(e.data.expiry).format('YYYY-MM-DD') : '' : '',
      })) as InventoryItem[];
    validRows.forEach((row: InventoryItem, idx: number) => dispatch(addInventoryItem(row)));
    setStep('done');
    dispatch(setUploadErrors([]));
    dispatch(setLastUploadSummary({ successCount: validRows.length, failureCount: 0, timestamp: new Date().toISOString() }));
  };

  const uploadErrors = useAppSelector((state: RootState) => (state.inventory as InvState).uploadErrors);
  const lastUploadSummary = useAppSelector((state: RootState) => (state.inventory as InvState).lastUploadSummary);
  const loading = useAppSelector((state: RootState) => (state.inventory as InvState).loading);

  const [step, setStep] = useState<'idle' | 'mapping' | 'preview' | 'confirm' | 'done' | 'retry'>('idle');
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedRows, setUploadedRows] = useState<Record<string, any>[]>([]);
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [mappedRows, setMappedRows] = useState<Record<string, any>[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [excelFile, setExcelFile] = useState<any>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  // Retry failed rows skip state
  const [skippedRows, setSkippedRows] = useState<Set<number>>(new Set());

  // Download template handler
  const handleDownloadTemplate = (): void => {
    if (Platform.OS !== 'web') {
      Alert.alert('Excel template download is only supported on web.');
      return;
    }
    // Build instruction row and header row
    const headers = InventorySchema.map((col) => {
      if (col.field === 'expiry') {
        return col.label + ' (yyyy-mm-dd)' + (col.required ? ' *' : '');
      }
      return col.label + (col.required ? ' *' : '');
    });
    // Create worksheet with header row only
    const worksheet = XLSX.utils.aoa_to_sheet([
      headers
    ]);

    // Create workbook and append worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    // Write workbook to array buffer
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // Create blob and trigger download
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Excel file selection
  const handleFileSelected = async (fileAsset: any) => {
    if (!fileAsset) return;
    setExcelFile(fileAsset);
    // Read file as ArrayBuffer
    let arrayBuffer;
    if (Platform.OS === 'web') {
      arrayBuffer = await (await fetch(fileAsset.uri)).arrayBuffer();
    } else {
      // Use expo-file-system or similar for native
      Alert.alert('Native upload not implemented in this mock.');
      return;
    }
    // parseExcel now returns { headers, normalizedHeaders, rows }
    const { headers, normalizedHeaders, rows } = await parseExcel(arrayBuffer);
    setUploadedHeaders(headers);
    setUploadedRows(rows);
    // Normalize system headers
    function normalizeHeader(h: string) {
      return String(h)
        .replace(/\*/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }
    const systemNormalizedHeaders = InventorySchema.map((f) => normalizeHeader(f.label));
    // Attempt auto-mapping
    const mapping: Record<string, string> = {};
    normalizedHeaders.forEach((uploaded, idx: number) => {
      const matchIdx = systemNormalizedHeaders.findIndex((sys) => sys === uploaded);
      if (matchIdx !== -1) {
        mapping[headers[idx]] = InventorySchema[matchIdx].field;
      }
    });
    setFieldMapping(mapping);
    // If all headers match, skip mapping step
    const allMatch =
      normalizedHeaders.length === systemNormalizedHeaders.length &&
      normalizedHeaders.every((h, i) => h === systemNormalizedHeaders[i]);
    if (allMatch) {
      // Map rows directly and align them with system fields
      const mapped = rows.map((row: Record<string, any>) => {
        const mappedRow: Record<string, any> = {};
        InventorySchema.forEach((col) => {
          const norm = normalizeHeader(col.label);
          mappedRow[col.field] = row[norm];
        });
        return mappedRow;
      });
      setMappedRows(mapped);
      setStep('preview');
    } else {
      setStep('mapping');
    }
  };

  // Handle manual field mapping
  const handleMappingChange = (uploadedHeader: string, systemField: string) => {
    setFieldMapping((prev) => ({ ...prev, [uploadedHeader]: systemField }));
  };

  // Proceed to Preview step
  const handleProceedToPreview = () => {
    // Map uploaded rows using mapping
    const mapped = uploadedRows.map((row: Record<string, any>) => {
      const mappedRow: Record<string, any> = {};
      Object.entries(fieldMapping).forEach(([uploaded, system]) => {
        mappedRow[system] = row[uploaded];
      });
      return mappedRow;
    });
    setMappedRows(mapped);
    setStep('preview');
    // Validate rows and update errors in Redux
    const errors = mapped.map((row: Record<string, any>, idx: number) => {
      const errs = validateMappedRow(row, InventorySchema);
      return Object.keys(errs).length ? { row: idx + 2, errors: errs, data: row } : null;
    }).filter((e): e is UploadError => Boolean(e));
    dispatch(setUploadErrors(errors));
    dispatch(setLastUploadSummary({
      successCount: mapped.length - errors.length,
      failureCount: errors.length,
      timestamp: new Date().toISOString(),
    }));
  };

  // Confirm upload
  const handleConfirmUpload = () => {
    setShowModal(false);
    // Ensure all required InventoryItem fields are present and expiry is normalized
    const validRows = mappedRows
      .filter((row: Record<string, any>) => typeof row.id === 'string' && row.id.length > 0)
      .map((row: Record<string, any>) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        brand: String(row.brand ?? ''),
        type: String(row.type ?? ''),
        unit: String(row.unit ?? ''),
        stock: Number(row.stock ?? 0),
        mrp: Number(row.mrp ?? 0),
        buy_price: Number(row.buy_price ?? 0),
        gst: Number(row.gst ?? 0),
        expiry: row.expiry ? require('dayjs')(row.expiry).isValid() ? require('dayjs')(row.expiry).format('YYYY-MM-DD') : '' : '',
      })) as InventoryItem[];
    dispatch(retryFailedRows(validRows));
    setStep('done');
  };

  // Update a failed row in uploadErrors
  const handleUpdateFailedRow = (idx: number, updated: Record<string, any>) => {
    if (!uploadErrors) return;
    const newErrors = uploadErrors.map((err: UploadError, i: number) =>
      i === idx ? { ...err, data: updated } : err
    );
    dispatch(setUploadErrors(newErrors));
  };

  // Retry failed rows
  // Retry failed rows with skip option
  const handleRetry = () => {
    if (!uploadErrors || uploadErrors.length === 0) return;
    setSkippedRows(new Set());
    setCurrentPage(1);
    setStep('retry');
  };

  // Skip a failed row by index
  const handleSkipFailedRow = (idx: number) => {
    setSkippedRows((prev) => new Set([...prev, idx]));
  };

  // Actually upload only non-skipped failed rows
  const handleConfirmRetryUpload = () => {
    if (!uploadErrors) return;
    const rowsToUpload = uploadErrors
      .map((e: UploadError, idx: number) => ({ idx, data: e.data }))
      .filter(({ idx }) => !skippedRows.has(idx))
      .map(({ data }) => ({
        ...data,
        expiry: data.expiry ? require('dayjs')(data.expiry).isValid() ? require('dayjs')(data.expiry).format('YYYY-MM-DD') : '' : '',
      }))
      .filter((row): row is InventoryItem => typeof row.id === 'string' && row.id.length > 0);
    if (rowsToUpload.length === 0) {
      Alert.alert('No rows to upload.');
      return;
    }
    dispatch(retryFailedRows(rowsToUpload));
    setStep('done');
  };

  return (
    <ScrollView contentContainerStyle={styles.pageContainer}>
      <Text style={styles.title}>Inventory Excel Upload</Text>
      <DownloadTemplateButton onPress={handleDownloadTemplate} />
      <ExcelUploadInput onFileSelected={handleFileSelected} label="Upload your filled Excel sheet" />
      {step === 'mapping' && (
        <>
          <Text style={styles.stepTitle}>Map Uploaded Headers to System Fields</Text>
          <FieldMappingTable
            uploadedHeaders={uploadedHeaders}
            systemFields={InventorySchema.map((f) => ({ field: f.field, label: f.label }))}
            mapping={fieldMapping}
            onChange={handleMappingChange}
          />
          <Text style={styles.buttonLike} onPress={handleProceedToPreview}>Proceed to Preview</Text>
        </>
      )}
      {step === 'preview' && (
        <>
          <Text style={styles.stepTitle}>Preview Data</Text>
          <DataPreviewTable
            rows={mappedRows}
            schema={InventorySchema}
            errors={uploadErrors || []}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            rowsPerPage={10}
          />
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {uploadErrors?.length === 0 ? (
              <Text style={[styles.buttonLike, { backgroundColor: '#1976D2' }]} onPress={handleImportAll}>Import</Text>
            ) : (
              <Text style={[styles.buttonLike, { backgroundColor: '#7BC47F' }]} onPress={() => setShowModal(true)}>Confirm Upload</Text>
            )}
            <Text style={[styles.buttonLike, { backgroundColor: '#E57373' }]} onPress={handleRetry}>Retry Failed Rows</Text>
          </View>
          <ConfirmUploadModal
            visible={showModal}
            onConfirm={handleConfirmUpload}
            onCancel={() => setShowModal(false)}
            successCount={lastUploadSummary?.successCount || 0}
            failureCount={lastUploadSummary?.failureCount || 0}
          />
        </>
      )}
      {step === 'retry' && uploadErrors && (
        <>
          <RetryFailedRowsTable
            rows={uploadErrors.map(e => e.data)}
            schema={InventorySchema}
            errors={uploadErrors}
            onSkip={handleSkipFailedRow}
            skippedRows={skippedRows}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            rowsPerPage={10}
            onRowUpdate={handleUpdateFailedRow}
          />
          <View style={{ flexDirection: 'row', marginTop: 10 }}>
            {uploadErrors.filter(e => Object.keys(e.errors).length === 0 && !skippedRows.has(uploadErrors.indexOf(e))).length > 0 && uploadErrors.every(e => Object.keys(e.errors).length === 0 || skippedRows.has(uploadErrors.indexOf(e))) ? (
              <Text style={[styles.buttonLike, { backgroundColor: '#1976D2' }]} onPress={handleImportRetryRows}>Import</Text>
            ) : (
              <Text style={[styles.buttonLike, { backgroundColor: '#7BC47F' }]} onPress={handleConfirmRetryUpload}>Upload Remaining</Text>
            )}
          </View>
        </>
      )}
      {step === 'done' && (
        <Text style={styles.doneText}>Upload complete! You may close this page.</Text>
      )}
      {loading && <ActivityIndicator size="large" color="#7BC47F" style={{ marginTop: 20 }} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    padding: 24,
    backgroundColor: '#F8FFF6', // Serene Ayurveda
    alignItems: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6D4D2F', // Ayurveda brown
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F7C873', // Pitta yellow
    marginTop: 18,
    marginBottom: 8,
  },
  buttonLike: {
    backgroundColor: '#F7C873',
    color: '#fff',
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 8,
    overflow: 'hidden',
    fontSize: 16,
  },
  doneText: {
    fontSize: 18,
    color: '#7BC47F',
    marginTop: 24,
    fontWeight: 'bold',
  },
});

export default UploadInventory;
