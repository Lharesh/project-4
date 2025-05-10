import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export interface PickerItem {
  label: string;
  value: string;
}

interface PickerProps {
  label?: string;
  placeholder?: string;
  items: PickerItem[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  pickerStyle?: ViewStyle;
  modalTitle?: string;
}

export const Picker: React.FC<PickerProps> = ({
  label,
  placeholder = 'Select an option',
  items,
  selectedValue,
  onValueChange,
  error,
  containerStyle,
  labelStyle,
  pickerStyle,
  modalTitle = 'Select an option',
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find((item) => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <TouchableOpacity
        style={[styles.pickerButton, error ? styles.error : null, pickerStyle]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedItem && styles.placeholder,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <ChevronDown size={20} color={COLORS.neutral[500]} />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>Cancel</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedValue === item.value && styles.selectedOption,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === item.value && styles.selectedOptionText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.optionsList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.neutral[700],
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  pickerText: {
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  placeholder: {
    color: COLORS.neutral[400],
  },
  error: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  closeButton: {
    fontSize: 16,
    color: COLORS.vata[500],
    fontWeight: '500',
  },
  optionsList: {
    padding: 8,
  },
  optionItem: {
    padding: 16,
    borderRadius: 8,
  },
  selectedOption: {
    backgroundColor: COLORS.vata[100],
  },
  optionText: {
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  selectedOptionText: {
    fontWeight: '500',
    color: COLORS.vata[700],
  },
});