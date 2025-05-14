import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const PREFIXES = ['Mr.', 'Mrs.', 'Ms.', 'Master'];

export function PrefixPicker({ value, onChange }: { value: string; onChange: (prefix: string) => void }) {
  return (
    <View style={styles.container}>

      <Picker
        selectedValue={value}
        style={styles.picker}
        onValueChange={(itemValue: string) => onChange(itemValue)}
      >
        {PREFIXES.map((prefix: string) => (
          <Picker.Item key={prefix} label={prefix} value={prefix} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  picker: { height: 40, width: 90, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafbfc', paddingHorizontal: 6 },
});
