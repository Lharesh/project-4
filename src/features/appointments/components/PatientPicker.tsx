import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

interface Patient {
  id: string;
  name: string;
  gender: string;
}

interface PatientPickerProps {
  patients: Patient[];
  value: string | null;
  onChange: (id: string | null) => void;
  setPatientGender?: (g: 'male' | 'female') => void;
  touched?: boolean;
}

const PatientPicker: React.FC<PatientPickerProps> = ({
  patients,
  value,
  onChange,
  setPatientGender,
  touched,
}) => {
  const [search, setSearch] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [multipleFound, setMultipleFound] = useState(false);

  const filteredPatients = patients.filter((p: Patient) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );



  // Keep search in sync with value
  useEffect(() => {
    if (!inputFocused && value) {
      const found = patients.find(p => p.id === value);
      if (found && search !== found.name) {
        setSearch(found.name);
      }
    }
    if (!value && !inputFocused && search !== '') {
      setSearch('');
    }
  }, [value, inputFocused, patients]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Patient</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, { flex: 1, paddingRight: 36 }]}
          placeholder="Search client by name"
          value={search}
          onChangeText={text => {
            setSearch(text);
            onChange(null);
            setNotFound(false);
            setMultipleFound(false);
          }}
          editable={!value}
        />
        {value && (
          <TouchableOpacity
            onPress={() => { onChange(null); setSearch(''); setInputFocused(true); }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
        {search.length > 0 && !value && (
          <View style={styles.dropdownList}>

            {filteredPatients.length === 0 ? (
              <Text style={styles.noResult}>No patients found</Text>
            ) : filteredPatients.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.dropdownItem}
                onPress={() => {
                  onChange(p.id);
                  setSearch(p.name);
                  if (setPatientGender) setPatientGender(p.gender as 'male' | 'female');
                }}
              >
                <Text style={{ color: value === p.id ? '#1a73e8' : '#222' }}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {!value && touched && (
        <Text style={styles.errorText}>Please select a patient.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    // overflow removed for dropdown visibility
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 16,
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: 8, // match DoctorAppointments
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    // no zIndex needed unless sibling stacking issues
  },
  input: {
    width: '100%',
    borderColor: '#1976d2',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputFocused: {
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -12 }], // vertical center assuming 24px height
    zIndex: 2,
    padding: 2,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdownList: {
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#d6dbe6',
    backgroundColor: '#fff',
  },
  noResult: {
    padding: 14,
    color: '#888',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f0fc',
  },
  dropdownItemText: {
    color: '#222',
    fontSize: 16,
  },
  dropdownItemTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 4,
  },
});

export default PatientPicker;
