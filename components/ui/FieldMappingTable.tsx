import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export interface FieldMappingTableProps {
  uploadedHeaders: string[];
  systemFields: { field: string; label: string }[];
  mapping: Record<string, string>; // uploadedHeader -> systemField
  onChange: (uploadedHeader: string, systemField: string) => void;
}

const FieldMappingTable: React.FC<FieldMappingTableProps> = ({ uploadedHeaders, systemFields, mapping, onChange }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Uploaded Header</Text>
        <Text style={styles.headerCell}>Map to System Field</Text>
      </View>
      {uploadedHeaders.map(header => (
        <View key={header} style={styles.row}>
          <Text style={styles.cell}>{header}</Text>
          <Picker
            selectedValue={mapping[header] || ''}
            style={styles.picker}
            onValueChange={(value: string) => onChange(header, value)}
          >
            <Picker.Item label="-- Select Field --" value="" />
            {systemFields.map(f => (
              <Picker.Item key={f.field} label={f.label} value={f.field} />
            ))}
          </Picker>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 6,
    marginBottom: 6,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#222',
  },
  picker: {
    flex: 1,
    height: 36,
  },
});

export default FieldMappingTable;
