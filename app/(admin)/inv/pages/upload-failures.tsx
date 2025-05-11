import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { retryFailedRows } from '@/redux/slices/inv.slice';
import type { RootState, AppDispatch } from '@/redux/store';

const UploadFailuresPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const uploadErrors = useSelector((state: RootState) => state.inventory.uploadErrors);

  const handleRetry = (row: number) => {
    const failRow = uploadErrors.find(err => err.row === row);
    if (failRow) {
      dispatch(retryFailedRows([failRow.data] as any));
      Alert.alert('Success', 'Upload retried successfully!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Failures</Text>
      {uploadErrors.length === 0 ? (
        <Text style={styles.success}>No failed uploads.</Text>
      ) : (
        uploadErrors.map((err) => (
          <View key={err.row} style={styles.errorCard}>
            <Text style={styles.errorTitle}>Row: {err.row}</Text>
            {Object.entries(err.errors).map(([field, msg]) => (
              <Text style={styles.errorMsg} key={field}>{field}: {msg}</Text>
            ))}
            {err.data && (
              <Text style={styles.errorMsg}>Data: {JSON.stringify(err.data)}</Text>
            )}
            <TouchableOpacity onPress={() => handleRetry(err.row)} style={styles.btn}>
              <Text style={{ color: '#fff' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 2 },
  fileName: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  reason: { color: '#b71c1c', marginTop: 6, marginBottom: 10 },
  btn: { backgroundColor: '#4caf50', borderRadius: 6, padding: 10, alignItems: 'center', marginTop: 8 },
  success: { color: '#388e3c', textAlign: 'center', marginTop: 20 },
  errorCard: {
    backgroundColor: '#fdecea', // light red
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#b71c1c', // dark red
    marginBottom: 6,
  },
  errorMsg: {
    color: '#8a1f1f',
    marginBottom: 4,
    marginLeft: 4,
  },
});

export default UploadFailuresPage;
