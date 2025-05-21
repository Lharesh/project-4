import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

interface Patient {
  id: string;
  name: string;
  gender: string;
}

interface PatientPickerProps {
  patients: Patient[];
  selectedPatient: string | null;
  setSelectedPatient: (id: string | null) => void;
  patientSearch: string;
  setPatientSearch: (s: string) => void;
  patientInputFocused: boolean;
  setPatientInputFocused: (b: boolean) => void;
  setPatientGender: (g: 'male' | 'female') => void;
  touched: any;
  setTouched: (t: any) => void;
}

const PatientPicker: React.FC<PatientPickerProps> = ({
  patients,
  selectedPatient,
  setSelectedPatient,
  patientSearch,
  setPatientSearch,
  patientInputFocused,
  setPatientInputFocused,
  setPatientGender,
  touched,
  setTouched,
}) => {
  // Keep patientSearch in sync with selectedPatient
  useEffect(() => {
    if (!patientInputFocused && selectedPatient) {
      const found = patients.find(p => p.id === selectedPatient);
      if (found && patientSearch !== found.name) {
        setPatientSearch(found.name);
      }
    }
    if (!selectedPatient && !patientInputFocused && patientSearch !== '') {
      setPatientSearch('');
    }
  }, [selectedPatient, patientInputFocused, patients]);
  // Keep patientSearch in sync with selectedPatient
  useEffect(() => {
    if (!patientInputFocused && selectedPatient) {
      const found = patients.find(p => p.id === selectedPatient);
      if (found && patientSearch !== found.name) {
        setPatientSearch(found.name);
      }
    }
    if (!selectedPatient && !patientInputFocused && patientSearch !== '') {
      setPatientSearch('');
    }
  }, [selectedPatient, patientInputFocused, patients]);

  const [internalFocus, setInternalFocus] = useState(false);
  const filteredPatients = patients.filter((p: Patient) => p.name.toLowerCase().includes(patientSearch.toLowerCase()));
  console.log('PatientPicker patients:', patients);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Patient</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, patientInputFocused && styles.inputFocused]}
          placeholder="Search or select patient..."
          value={patientInputFocused ? patientSearch : (selectedPatient ? (patients.find(p => p.id === selectedPatient)?.name || '') : '')}
          onFocus={() => setPatientInputFocused(true)}
          onBlur={() => {
            setTimeout(() => setPatientInputFocused(false), 120);
            setTouched((t: any) => ({ ...t, patient: true }));
          }}
          onChangeText={text => {
            setPatientSearch(text);
            setSelectedPatient(null);
          }}
          onSubmitEditing={() => {
            if (filteredPatients.length > 0) {
              const p = filteredPatients[0];
              setSelectedPatient(p.id);
              setPatientSearch(p.name);
              setPatientGender(p.gender as 'male' | 'female');
              setPatientInputFocused(false);
            }
          }}
        />
        {selectedPatient && (
          <TouchableOpacity
            onPress={() => { setSelectedPatient(null); setPatientSearch(''); setPatientInputFocused(true); }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
        {patientInputFocused && !selectedPatient && patientSearch.length > 0 && (
          <View style={styles.dropdown}>
            {filteredPatients.length === 0 ? (
              <Text style={styles.noResult}>No patients found</Text>
            ) : filteredPatients.map(p => (
              <TouchableOpacity
                key={p.id}
                style={[styles.dropdownItem, selectedPatient === p.id && styles.dropdownItemSelected]}
                onPress={() => {
                  setSelectedPatient(p.id);
                  setPatientSearch(p.name);
                  setPatientGender(p.gender as 'male' | 'female');
                  setPatientInputFocused(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedPatient === p.id && styles.dropdownItemTextSelected]}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      {!selectedPatient && touched && (
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
    marginBottom: 12,
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    zIndex: 10000,
    // overflow removed for dropdown visibility
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
    top: 12,
    zIndex: 2,
    padding: 2,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48, // fixed px for web/mobile compatibility
    zIndex: 10000, // maximum for visibility
    backgroundColor: '#fff', // fully opaque for contrast
    opacity: 1,
    borderColor: '#1976d2',
    borderWidth: 3,
    borderRadius: 10,
    maxHeight: 240,
    marginTop: 2,
    overflow: 'hidden',
    overflowY: 'auto', // for web scroll
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20, // for Android
  },
  noResult: {
    padding: 14,
    color: '#888',
  },
  dropdownItem: {
    padding: 12,
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
