import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Rows per page:</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={pageSize}
          style={styles.picker}
          onValueChange={(itemValue) => onPageSizeChange(Number(itemValue))}
          mode="dropdown"
        >
          {pageSizeOptions.map(size => (
            <Picker.Item key={size} label={size.toString()} value={size} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity
        onPress={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={[styles.button, currentPage === 1 && styles.buttonDisabled]}
      >
        <Text style={[styles.buttonText, currentPage === 1 && styles.buttonTextDisabled]}>Previous</Text>
      </TouchableOpacity>
      <Text style={styles.pageInfo}>
        Page {currentPage} of {totalPages}
      </Text>
      <TouchableOpacity
        onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={[styles.button, currentPage === totalPages && styles.buttonDisabled]}
      >
        <Text style={[styles.buttonText, currentPage === totalPages && styles.buttonTextDisabled]}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  label: {
    marginRight: 8,
    fontSize: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 16,
    overflow: 'hidden',
  },
  picker: {
    width: 70,
    height: 35,
  },
  button: {
    marginHorizontal: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#eee',
    borderRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    color: '#333',
  },
  buttonTextDisabled: {
    color: '#aaa',
  },
  pageInfo: {
    marginHorizontal: 8,
    fontSize: 15,
  },
});

export default Pagination;
