import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Pressable } from 'react-native';

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
  // Prevent dropdown from closing on blur if a dropdown item is clicked
  const dropdownItemClicked = React.useRef(false);
  // Keep therapySearch in sync with selectedTherapy
  React.useEffect(() => {
    // Only sync search with selectedTherapy if not focused (prevents overwrite while typing)
    if (!therapyInputFocused && selectedTherapy) {
      const found = therapies.find(t => t.id === selectedTherapy);
      if (found && therapySearch !== found.name) {
        setTherapySearch(found.name);
      }
    }
  }, [selectedTherapy, therapyInputFocused, therapies]);
  const filteredTherapies = therapies.filter((t: Therapy) => t.name.toLowerCase().includes(therapySearch.toLowerCase()));
  return (
    <View style={styles.container}>
  <Text style={styles.label}></Text>
  <View style={styles.inputWrapper}>
    <TextInput
      style={[styles.input, therapyInputFocused && styles.inputFocused]}
      placeholder="Search or select therapy..."
      value={therapyInputFocused ? therapySearch : (selectedTherapy ? (therapies.find(t => t.id === selectedTherapy)?.name || '') : '')}
      onFocus={() => setTherapyInputFocused(true)}
      onBlur={() => {
        setTimeout(() => {
          if (!dropdownItemClicked.current) {
                setTherapyInputFocused(false);
              }
              setTouched((touch: any) => ({ ...touch, therapy: true }));
              dropdownItemClicked.current = false;
            }, 120);
          }}
          onChangeText={(text: string) => {
            setTherapySearch(text);
            // Only clear selectedTherapy if the text doesn't match the current selected therapy name
            if (selectedTherapy && therapies.find(t => t.id === selectedTherapy)?.name !== text) {
              setSelectedTherapy(null);
            }
          }}
          onSubmitEditing={() => {
            if (filteredTherapies.length > 0) {
              const t = filteredTherapies[0];
              setSelectedTherapy(t.id);
              setTherapySearch(t.name);
              setTherapyInputFocused(false);
            }
          }}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="done"
        />
        {selectedTherapy && (
          <TouchableOpacity
            onPress={() => { setSelectedTherapy(null); setTherapySearch(''); setTherapyInputFocused(true); }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
        {(therapySearch.length > 0 && !selectedTherapy && therapyInputFocused) && (
          <View style={styles.dropdownList} pointerEvents="box-none">
            <ScrollView pointerEvents="auto" keyboardShouldPersistTaps="handled">
              {filteredTherapies.length === 0 ? (
                <Text style={styles.noResult}>No therapies found</Text>
              ) : filteredTherapies.map(t => (
                <Pressable
                  key={t.id}
                  onPress={() => {
                    setSelectedTherapy(t.id);
                    setTherapySearch(t.name);
                    setTherapyInputFocused(false);
                    setTouched((touch: any) => ({ ...touch, therapy: true }));
                  }}
                  style={{ paddingVertical: 14, paddingHorizontal: 18 }}
                  tabIndex={0}
                  role="button"
                  accessible={true}
                  accessibilityLabel={`Select therapy ${t.name}`}
                >
                  <Text style={{ color: selectedTherapy === t.id ? '#1a73e8' : '#222', fontSize: 18 }}>{t.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
        {!selectedTherapy && touched && (
          <Text style={styles.errorText}>Please select a therapy.</Text>
        )}
      </View>
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
    marginBottom: 24, // enough space for dropdown overlay
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    // no zIndex needed unless sibling stacking issues
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
  dropdownList: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 48, // adjust to match your input height
    zIndex: 9999,
    borderRadius: 8,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#d6dbe6',
    backgroundColor: '#fff',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 8, // for Android
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
