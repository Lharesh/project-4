import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Therapy {
  id: string;
  name: string;
}

interface TherapyPickerProps {
  therapies: Therapy[];
  selectedTherapy: string | null;
  setSelectedTherapy: (id: string | null) => void;
  therapySearch: string;
  setTherapySearch: (s: string) => void;
  therapyInputFocused: boolean;
  setTherapyInputFocused: (b: boolean) => void;
  touched: any;
  setTouched: (t: any) => void;
}

const TherapyPicker: React.FC<TherapyPickerProps> = ({
  therapies,
  selectedTherapy,
  setSelectedTherapy,
  therapySearch,
  setTherapySearch,
  therapyInputFocused,
  setTherapyInputFocused,
  touched,
  setTouched,
}: TherapyPickerProps) => {
  // Keep therapySearch in sync with selectedTherapy
  React.useEffect(() => {
    if (!therapyInputFocused && selectedTherapy) {
      const found = therapies.find(t => t.id === selectedTherapy);
      if (found && therapySearch !== found.name) {
        setTherapySearch(found.name);
      }
    }
    if (!selectedTherapy && !therapyInputFocused && therapySearch !== '') {
      setTherapySearch('');
    }
  }, [selectedTherapy, therapyInputFocused, therapies]);
  console.log('TherapyPicker therapies:', therapies);
  const filteredTherapies = therapies.filter((t: Therapy) => t.name.toLowerCase().includes(therapySearch.toLowerCase()));
  return (
    <View style={styles.container}>
  <Text style={styles.label}>Therapy Name</Text>
  <View style={styles.inputWrapper}>
    <TextInput
      style={[styles.input, therapyInputFocused && styles.inputFocused]}
      placeholder="Search or select therapy..."
      value={therapyInputFocused ? therapySearch : (selectedTherapy ? (therapies.find(t => t.id === selectedTherapy)?.name || '') : '')}
      onFocus={() => setTherapyInputFocused(true)}
      onBlur={() => {
        setTimeout(() => setTherapyInputFocused(false), 120);
        setTouched((touch: any) => ({ ...touch, therapy: true }));
      }}
      onChangeText={text => {
        setTherapySearch(text);
        setSelectedTherapy(null);
      }}
      onSubmitEditing={() => {
        if (filteredTherapies.length > 0) {
          const t = filteredTherapies[0];
          setSelectedTherapy(t.id);
          setTherapySearch(t.name);
          setTherapyInputFocused(false);
        }
      }}
    />
    {selectedTherapy && (
      <TouchableOpacity
        onPress={() => { setSelectedTherapy(null); setTherapySearch(''); setTherapyInputFocused(true); }}
        style={styles.clearButton}
      >
        <Text style={styles.clearButtonText}>×</Text>
      </TouchableOpacity>
    )}
    {therapyInputFocused && !selectedTherapy && therapySearch.length > 0 && (
      <View style={styles.dropdown}>
        {filteredTherapies.length === 0 ? (
          <Text style={styles.noResult}>No therapies found</Text>
        ) : filteredTherapies.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[styles.dropdownItem, selectedTherapy === t.id && styles.dropdownItemSelected]}
            onPress={() => {
              setSelectedTherapy(t.id);
              setTherapySearch(t.name);
              setTherapyInputFocused(false);
              setTouched((touch: any) => ({ ...touch, therapy: true }));
            }}
          >
            <Text style={[styles.dropdownItemText, selectedTherapy === t.id && styles.dropdownItemTextSelected]}>{t.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
  {!selectedTherapy && touched && (
    <Text style={styles.errorText}>Please select a therapy.</Text>
  )}
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
    padding: 0,
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
    zIndex: 10000,
    // overflow removed for dropdown visibility
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#1976d2',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 18,
  },
  dropdown: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48, // fixed px for web/mobile compatibility
    zIndex: 10000, // maximum for visibility
    backgroundColor: '#fff', // fully opaque for contrast
    opacity: 1,
    borderWidth: 3,
    borderColor: '#1976d2',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20, // for Android
    maxHeight: 260,
    paddingVertical: 6,
    marginTop: 2,
    overflow: 'hidden',
    overflowY: 'auto', // for web scroll
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  dropdownItemSelected: {
    backgroundColor: '#e3f0fc',
    fontWeight: '700',
  },
  dropdownItemText: {
    color: '#222',
    fontWeight: '400',
  },
  dropdownItemTextSelected: {
    color: '#1976d2',
    fontWeight: '700',
  },
  noResult: {
    padding: 14,
    color: '#888',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 4,
  },
});

export default TherapyPicker;
