import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const COUNTRY_CODES = [
  { code: '+91', name: 'India' },
  { code: '+1', name: 'USA' },
  { code: '+44', name: 'UK' },
  { code: '+61', name: 'Australia' },
  { code: '+971', name: 'UAE' },
  // Add more as needed
];

export function CountryCodePicker({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.code}>{value}</Text>
        </TouchableOpacity>
      </View>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        testID="Modal"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryRow}
                  onPress={() => {
                    onChange(item.code);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.code}>{item.code}</Text>
                  <Text style={styles.country}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

import { COLORS } from '@/theme/constants/theme';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  picker: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.vata[500],
    borderRadius: 8,
    backgroundColor: '#fafbfc',
    minWidth: 54,
    alignItems: 'center',
  },
  code: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.vata[500],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 250,
    maxHeight: 350,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  country: {
    marginLeft: 10,
    fontSize: 15,
  },
});