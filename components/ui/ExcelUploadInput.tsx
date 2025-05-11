import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';

interface ExcelUploadInputProps {
  onFileSelected: (file: DocumentPicker.DocumentPickerAsset | null) => void;
  label?: string;
}

const ExcelUploadInput: React.FC<ExcelUploadInputProps> = ({ onFileSelected, label }) => {
  const handlePick = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ],
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      // result.assets[0] contains { uri, name, mimeType, size }
      onFileSelected(result.assets[0]);
    } else {
      onFileSelected(null);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity style={styles.button} onPress={handlePick}>
        <Feather name="upload" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>Upload Excel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    marginBottom: 4,
    color: '#6D4D2F', // Ayurveda brown
    fontWeight: 'bold',
    fontSize: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7C873', // Pitta yellow
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ExcelUploadInput;
