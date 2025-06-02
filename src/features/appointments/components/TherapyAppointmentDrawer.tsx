import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { COLORS, generateTheme } from '../../../theme/constants/theme';
import TherapyPicker from './TherapyPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
const theme = generateTheme('vata', 'light'); // TODO: Replace with actual dosha/mode from app context

interface TherapistOption {
  id: string;
  name: string;
}



import type { Appointment } from '../../appointments/appointmentsSlice';

interface TherapyAppointmentDrawerProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (appointment: Appointment) => void;
  error?: string;
  client: { id: string; name: string; mobile: string };
  therapy: string;
  onTherapyChange: (therapy: string) => void;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  duration: string;
  onDurationChange: (duration: string) => void;
  therapists: TherapistOption[];
  selectedTherapists: string[];
  onTherapistToggle: (id: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  isSubmitting?: boolean;
  therapies: { id: string; name: string }[];
}

const TherapyAppointmentDrawer: React.FC<TherapyAppointmentDrawerProps> = (props) => {
  // DEBUG: Log all received props on every render
  // eslint-disable-next-line no-console
  console.log('[DEBUG][TherapyAppointmentDrawer] props:', props);
  // DEBUG: Log all received props
  // eslint-disable-next-line no-console
  // (log removed for cleanup)'[DEBUG][TherapyAppointmentDrawer] props:', props);
  const {
    visible,
    onClose,
    onSubmit,
    error,
    client,
    therapy,
    onTherapyChange,
    date,
    time,
    onDateChange,
    onTimeChange,
    duration,
    onDurationChange,
    therapists,
    selectedTherapists,
    onTherapistToggle,
    notes,
    onNotesChange,
    isSubmitting,
    therapies = [], // pass this prop from parent if available
  } = props;

  // State for pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [therapySearch, setTherapySearch] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(therapy || null);
  const [therapyInputFocused, setTherapyInputFocused] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Default date to today and time to now if not provided
  React.useEffect(() => {
    if (!date) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      onDateChange(`${yyyy}-${mm}-${dd}`);
    }
    if (!time) {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      onTimeChange(`${hh}:${min}`);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle therapy selection
  const handleTherapyChange = (idOrName: string) => {
    setSelectedTherapy(idOrName);
    setTherapySearch(therapies.find((t) => t.id === idOrName)?.name || idOrName);
    onTherapyChange(idOrName);
  };

  // Handle date/time picker
  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const iso = selectedDate.toISOString().slice(0, 10);
      onDateChange(iso);
    }
  };
  const handleTimeChange = (_event: unknown, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const h = selectedTime.getHours().toString().padStart(2, '0');
      const m = selectedTime.getMinutes().toString().padStart(2, '0');
      onTimeChange(`${h}:${m}`);
    }
  };

  if (!visible) return null;
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      enabled={visible}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 48 : 0} // Adjust as needed for your header/status bar
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{
          width: '100%',
          alignSelf: 'stretch',
          minHeight: 500,
          maxHeight: '90%',
          backgroundColor: '#fff',
          borderTopLeftRadius: theme.borderRadius.lg,
          borderTopRightRadius: theme.borderRadius.lg,
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderWidth: 2,
          borderColor: '#1976d2',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5
          // DO NOT add flex: 1 or flexGrow: 1 here!
        }}>

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 16, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header Group */}
            <View style={{ marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 6 }]}>Confirm Appointment</Text>
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>
            {/* Form Group */}
            {/* Patient Details */}
            <View style={{
              backgroundColor: '#f3f6fa',
              borderRadius: 8,
              paddingVertical: 8,
              paddingHorizontal: 12,
              marginBottom: 12,
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
              {/* Patient name, phone, and ID avatar row - avatar vertically centered */}
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between', minHeight: 44 }}>
                <View style={{ justifyContent: 'center', minHeight: 44 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="person" size={22} color="#1976d2" style={{ marginRight: 6 }} />
                    <Text style={{ fontWeight: '600', fontSize: 16, marginRight: 4 }}>{client.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <MaterialIcons name="phone" size={18} color="#1a73e8" style={{ marginRight: 5 }} />
                    <Text style={{ color: '#555', fontSize: 14 }}>{client.mobile}</Text>
                  </View>
                </View>
                <View style={{ minWidth: 28, height: 28, borderRadius: 14, backgroundColor: '#1976d2', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{client.id}</Text>
                </View>
              </View>
            </View>
            <View style={{ marginBottom: 14 }}>
              <View style={{ marginBottom: 10 }}>
                <TherapyPicker
                  therapies={therapies}
                  selectedTherapy={selectedTherapy}
                  setSelectedTherapy={(id: string | null) => { handleTherapyChange(id ?? ''); setTouched(t => ({ ...t, therapy: true })); }}
                  therapySearch={therapySearch}
                  setTherapySearch={setTherapySearch}
                  therapyInputFocused={therapyInputFocused}
                  setTherapyInputFocused={setTherapyInputFocused}
                  touched={touched}
                  setTouched={setTouched}
                />
              </View>
              {/* Date & Time Row */}
              <View style={[styles.row, { marginBottom: 10 }]}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 6 }}>📅</Text>
                  <Text style={styles.dateChip}>{date}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 14 }}>
                  <Text style={{ fontSize: 18, marginRight: 6 }}>⏰</Text>
                  <Text style={styles.timeChip}>{time}</Text>
                </TouchableOpacity>
              </View>
              {/* Add other form fields here, each with marginBottom: 10 if needed */}
            </View>

            {/* Action Button Group: separated by 14px above */}
            {showDatePicker && (
              <DateTimePicker
                value={date ? new Date(date) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={time ? new Date(`${date}T${time}`) : new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}

            {/* 5px space */}
            <View style={{ height: 5 }} />

            {/* Duration Buttons */}
            <View style={styles.row}>
              {["1d", "3d", "7d", "14d", "21d", "Cust"].map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.durationButton, duration === opt ? styles.durationButtonActive : null]}
                  onPress={() => onDurationChange(opt)}
                >
                  <Text style={duration === opt ? styles.durationButtonActiveText : styles.durationButtonText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Therapists */}
            <View style={styles.row}>
              {therapists.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.therapistChip, selectedTherapists.includes(t.id) ? styles.therapistChipActive : null]}
                  onPress={() => onTherapistToggle(t.id)}
                >
                  <Text style={selectedTherapists.includes(t.id) ? styles.therapistChipActiveText : styles.therapistChipText}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Notes */}
            <Text style={styles.label}>Notes / Special Instructions</Text>
            <TextInput
              style={styles.input}
              value={notes}
              onChangeText={onNotesChange}
              placeholder="Add notes"
              multiline
            />

            {/* Create Button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                // Build a compliant Appointment object for Redux/state
                const treatmentObj = therapies.find(t => t.id === (selectedTherapy || therapy));
                const therapistObjs = therapists.filter(t => selectedTherapists.includes(t.id));
                const appointment = {
                  id: `${client.id}_${date}_${time}`,
                  clientId: client.id,
                  clientName: client.name,
                  clientMobile: client.mobile,
                  therapistIds: selectedTherapists,
                  therapistNames: therapistObjs.map(t => t.name),
                  treatmentId: selectedTherapy || therapy,
                  treatmentName: treatmentObj ? treatmentObj.name : '',
                  duration: Number(duration),
                  date,
                  time,
                  status: 'scheduled' as Appointment['status'],
                  notes,
                  tab: 'Therapy' as Appointment['tab'],
                  createdAt: new Date().toISOString(),
                };
                onSubmit(appointment);
              }}
              disabled={isSubmitting}
            >
              <Text style={styles.createButtonText}>Start Therapy</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
export default TherapyAppointmentDrawer;

const styles = StyleSheet.create({
  clientCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#90caf9',
  },
  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  clientIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#1976d2',
  },
  clientName: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#1565c0',
  },
  clientMobile: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  drawer: {
    minHeight: '70%',
    maxHeight: '95%',
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 22,
  },
  closeButton: {
    padding: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 14,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#444',
  },
  toggleInactive: {
    backgroundColor: '#eee',
  },
  toggleActiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  toggleInactiveText: {
    color: '#888',
    fontWeight: 'bold',
  },
  dateRow: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: '#ffd6d6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  errorText: {
    color: '#c00',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    padding: 8,
    fontSize: 15,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  dateChip: {
    backgroundColor: '#e8f0fe',
    color: '#1976d2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: 'bold',
    marginRight: 10,
    fontSize: 15,
  },
  timeChip: {
    backgroundColor: '#e8f0fe',
    color: '#1976d2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontWeight: 'bold',
    fontSize: 15,
  },
  durationButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  durationButtonActive: {
    backgroundColor: '#1976d2',
  },
  durationButtonText: {
    color: '#444',
    fontWeight: 'bold',
  },
  durationButtonActiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  therapistChip: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  therapistChipActive: {
    backgroundColor: '#1976d2',
  },
  therapistChipText: {
    color: '#444',
    fontWeight: 'bold',
  },
  therapistChipActiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#0097a7',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

