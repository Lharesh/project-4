import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface DurationPickerProps {
  duration: number;
  setDuration: (d: number) => void;
  durationOptions?: number[];
  touched: boolean;
  setTouched: (t: any) => void;
}

const DEFAULT_OPTIONS = [1, 3, 5, 7, 14, 21, 28];

const DurationPicker: React.FC<DurationPickerProps> = ({
  duration,
  setDuration,
  durationOptions = DEFAULT_OPTIONS,
  touched,
  setTouched,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setDuration(num);
      setTouched(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Duration (Days)</Text>
      <View style={styles.optionsRow}>
        {durationOptions.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionButton, duration === opt && styles.optionButtonSelected]}
            onPress={() => {
              setDuration(opt);
              setCustomInput('');
              setTouched(true);
            }}
          >
            <Text style={[styles.optionButtonText, duration === opt && styles.optionButtonTextSelected]}>{opt}</Text>
          </TouchableOpacity>
        ))}
        <TextInput
          keyboardType="numeric"
          style={[styles.customInput, inputFocused && styles.customInputFocused]}
          placeholder="Custom"
          value={customInput}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onChangeText={handleCustomChange}
        />
      </View>
      {(!duration || duration <= 0) && touched && (
        <Text style={styles.errorText}>Please enter a valid duration.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
    maxWidth: '100%',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 16,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    width: '100%',
    maxWidth: '100%',
  },
  optionButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#eee',
    borderRadius: 6,
    fontWeight: '600',
    fontSize: 15,
    marginRight: 4,
    marginBottom: 4,
    borderWidth: 0,
  },
  optionButtonSelected: {
    backgroundColor: '#1a73e8',
  },
  optionButtonText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  optionButtonTextSelected: {
    color: '#fff',
  },
  customInput: {
    borderWidth: 1.5,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    width: 80,
    backgroundColor: '#fff',
    fontSize: 15,
    marginLeft: 4,
  },
  customInputFocused: {
    borderColor: '#1a73e8',
    borderWidth: 2,
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 4,
  },
});

export default DurationPicker;
