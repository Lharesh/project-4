import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PREFIXES = ['Mr.', 'Mrs.', 'Ms.', 'Master'];

export function PrefixPicker({ value, onChange }: { value?: string; onChange: (prefix: string) => void }) {
  // If the value is missing or not in PREFIXES, fallback to first
  const selectedValue = PREFIXES.includes(value ?? '') ? value : PREFIXES[0];
  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedValue}
        style={styles.picker}
        onValueChange={(itemValue: string) => onChange(itemValue)}
        mode="dropdown"
      >
        {PREFIXES.map((prefix: string) => (
          <Picker.Item key={prefix} label={prefix} value={prefix} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafbfc',
    width: 120, // Fixed width for consistent touch area and arrow
    height: 44,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  picker: {
    width: '100%',
    height: 100,
    color: '#222',
  },
});