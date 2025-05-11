import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { uploadExcelFile } from '@/redux/slices/inv.slice';
import type { AppDispatch, RootState } from '@/redux/store';

const ExcelUploadPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.inventory.loading);
  const [uploaded, setUploaded] = React.useState(false);

  const handleUpload = () => {
    setUploaded(true);
    dispatch(uploadExcelFile({} as any)); // Replace with file logic in real app
    Alert.alert('Success', 'Excel file uploaded!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Inventory Excel</Text>
      <TouchableOpacity style={styles.btn} onPress={handleUpload} disabled={loading}>
        <Text style={{ color: '#fff' }}>{loading ? 'Uploading...' : uploaded ? 'Uploaded!' : 'Upload Excel File'}</Text>
      </TouchableOpacity>
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {uploaded && !loading && <Text style={styles.success}>Upload complete!</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7', padding: 16, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 16, textAlign: 'center' },
  btn: { backgroundColor: '#4caf50', borderRadius: 8, padding: 14, alignItems: 'center' },
  success: { color: 'green', marginTop: 18, textAlign: 'center', fontWeight: 'bold' },
});

export default ExcelUploadPage;
