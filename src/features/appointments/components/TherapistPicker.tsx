import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { filterTherapistsByGender } from '../helpers/rulesEngine';
import type { Therapist } from '../helpers/availabilityUtils';


interface TherapistPickerProps {
  therapists: Therapist[];
  selectedTherapists: string[];
  setSelectedTherapists: (ids: string[]) => void;
  therapistSearch: string;
  setTherapistSearch: (s: string) => void;
  showAllTherapists: boolean;
  setShowAllTherapists: (b: boolean) => void;
  therapistInputFocused: boolean;
  setTherapistInputFocused: (b: boolean) => void;
  clientGender?: string;
  touched: boolean;
  setTouched: (t: any) => void;
}

const TherapistPicker: React.FC<TherapistPickerProps> = ({
  therapists,
  selectedTherapists,
  setSelectedTherapists,
  therapistSearch,
  setTherapistSearch,
  showAllTherapists,
  setShowAllTherapists,
  therapistInputFocused,
  setTherapistInputFocused,
  clientGender,
  touched,
  setTouched,
}) => {

  // Defensive: always treat selectedTherapists as array
  const safeSelectedTherapists = Array.isArray(selectedTherapists) ? selectedTherapists : [];
  // Improved gender + search filter logic
  let filteredTherapists = filterTherapistsByGender(therapists, clientGender ?? undefined, !showAllTherapists);
  if (therapistSearch) {
    filteredTherapists = filteredTherapists.filter(t =>
      t.name.toLowerCase().includes(therapistSearch.toLowerCase())
    );
  }

  const toggleTherapist = (id: string) => {
    let newSelected: string[];
    if (safeSelectedTherapists.includes(id)) {
      newSelected = safeSelectedTherapists.filter((t: string) => t !== id);
    } else {
      newSelected = [...safeSelectedTherapists, id];
    }
    setSelectedTherapists(newSelected);
  };

  // Quick-pick chips: top 5 by name (or all if <5), filtered by gender/search
  const quickPickTherapists = filteredTherapists.slice(0, 5);

  // 'Select All' quick pick
  const handleSelectAll = () => {
    setSelectedTherapists(filteredTherapists.map(t => t.id));
    setTouched(true);
  };

  return (
    <View style={styles.container}>
  <Text style={styles.label}>Therapist(s)</Text>
  <View style={styles.inputWrapper}>
    <TextInput
      style={[styles.input, therapistInputFocused && styles.inputFocused]}
      placeholder="Search or select therapist..."
      value={therapistInputFocused ? therapistSearch : safeSelectedTherapists.map(id => therapists.find(t => t.id === id)?.name || '').filter(Boolean).join(', ')}
      onFocus={() => setTherapistInputFocused(true)}
      onBlur={() => { setTimeout(() => setTherapistInputFocused(false), 120); setTouched(true); }}
      onChangeText={text => {
        setTherapistSearch(text);
        // Do NOT clear selectedTherapists when search is cleared
      }}
      onSubmitEditing={() => {
        if (filteredTherapists.length > 0) {
          const t = filteredTherapists[0];
          toggleTherapist(t.id);
          setTherapistSearch('');
              toggleTherapist(t.id);
              setTherapistSearch('');
              setTherapistInputFocused(false);
            }
          }}
        />
        {safeSelectedTherapists.length > 0 && (
          <TouchableOpacity
            onPress={() => { setSelectedTherapists([]); setTherapistSearch(''); setTherapistInputFocused(true); }}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      {therapistInputFocused && therapistSearch.length > 0 && (
        <View style={styles.dropdown}>
          {filteredTherapists.length === 0 ? (
            <Text style={styles.noResult}>No therapists found</Text>
          ) : filteredTherapists.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.dropdownItem, safeSelectedTherapists.includes(t.id) && styles.dropdownItemSelected]}
              onPress={() => {
                toggleTherapist(t.id);
                setTouched(true);
                setTherapistSearch('');
                setTherapistInputFocused(false);
              }}
            >
              <Text style={[styles.dropdownItemText, safeSelectedTherapists.includes(t.id) && styles.dropdownItemTextSelected]}>{t.name}</Text>
              <Text style={styles.availabilityText}>
                {Object.keys(t.availability).slice(0, 2).map(day => `${day} (${(t.availability as Record<string, string[]>)[day]?.join(', ') || ''})`).join('; ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!(therapistInputFocused && therapistSearch.length > 0) && quickPickTherapists.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarRow} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {quickPickTherapists.map(t => {
            const initials = (t.name ?? '').split(' ').map(w => w[0]).join('').toUpperCase();
            const selected = safeSelectedTherapists.includes(t.id);
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => { toggleTherapist(t.id); setTouched(true); }}
                style={[styles.avatarTouchable, selected && styles.avatarSelected]}
              >
                <View style={[styles.avatarCircle, selected && styles.avatarCircleSelected]}>
                  <Text style={[styles.avatarText, selected && styles.avatarTextSelected]}>{initials}</Text>
                </View>
                <Text style={styles.avatarName} numberOfLines={1}>{(t.name ?? '').split(' ')[0]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      {safeSelectedTherapists.length === 0 && touched && (
        <Text style={styles.errorText}>Please select at least one therapist.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 2,
    minHeight: 68,
  },
  avatarTouchable: {
    alignItems: 'center',
    marginHorizontal: 2,
    marginVertical: 2,
    width: 54,
  },
  avatarSelected: {
    // Optional: visual feedback for selected
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e3f0fc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1976d2',
  },
  avatarCircleSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  avatarText: {
    color: '#1976d2',
    fontWeight: '700',
    fontSize: 18,
  },
  avatarTextSelected: {
    color: '#fff',
  },
  avatarName: {
    marginTop: 2,
    fontSize: 12,
    color: '#222',
    fontWeight: '500',
    maxWidth: 48,
    textAlign: 'center',
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
    top: '100%',
    zIndex: 5000,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1976d2',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    maxHeight: 200,
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
  availabilityText: {
    color: '#bbb',
    fontSize: 11,
    fontWeight: '400',
  },
  noResult: {
    padding: 14,
    color: '#888',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  selectAllChip: {
    backgroundColor: '#e3f0fc',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#1976d2',
    marginRight: 8,
    marginBottom: 8,
  },
  selectAllChipText: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 15,
  },
  chip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#e3f0fc',
    borderColor: '#1976d2',
    borderWidth: 2,
  },
  chipText: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
  },
  chipTextSelected: {
    color: '#1976d2',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 4,
  },
});

export { TherapistPicker };
