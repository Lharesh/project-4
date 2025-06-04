import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Platform, KeyboardAvoidingView, Dimensions } from 'react-native';
import { COLORS, generateTheme } from '../../../theme/constants/theme';
import TherapyPicker from './TherapyPicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { Appointment } from '../../appointments/appointmentsSlice';
const theme = generateTheme('vata', 'light'); // TODO: Replace with actual dosha/mode from app context

interface TherapistOption {
  id: string;
  name: string;
}





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
  // New props for dynamic room/therapist selection and custom days
  availableRooms: { id: string; name: string }[];
  selectedRoom: string;
  onRoomChange?: (roomId: string) => void;
  availableTherapists: { id: string; name: string }[];
  customDays?: string;
  onCustomDaysChange?: (val: string) => void;
  showRoomSelection?: boolean;
}

const TherapyAppointmentDrawer: React.FC<TherapyAppointmentDrawerProps> = (props) => {
  // ...existing hooks and state...

  // Submit handler, now inside component
  function handleSubmit() {
    const treatmentObj = props.therapies.find(t => t.id === (selectedTherapy || props.therapy));
    const therapistObjs = props.therapists.filter(t => selectedTherapists.includes(t.id));
    const appointment = {
      id: `${props.client.id}_${props.date}_${props.time}`,
      clientId: props.client.id,
      clientName: props.client.name,
      clientMobile: props.client.mobile,
      therapistIds: selectedTherapists,
      therapistNames: therapistObjs.map(t => t.name),
      treatmentId: selectedTherapy || props.therapy,
      treatmentName: treatmentObj ? treatmentObj.name : '',
      duration: Number(props.duration === 'Cust' ? props.customDays : props.duration),
      date: props.date,
      time: props.time,
      status: 'scheduled' as Appointment['status'],
      notes: props.notes,
      tab: 'Therapy' as Appointment['tab'],
      createdAt: new Date().toISOString(),
      roomId: props.selectedRoom,
      roomName: (props.availableRooms.find(r => r.id === props.selectedRoom)?.name) || '',
    };
    if (typeof props.onSubmit === 'function') {
      props.onSubmit(appointment);
    }
  }

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
    availableRooms = [],
    selectedRoom = '',
    onRoomChange,
    availableTherapists = [],
    customDays = '',
    onCustomDaysChange,
    showRoomSelection = false,
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

  return (
    <Modal
      visible={props.visible}
      animationType="slide"
      transparent={true}
      onRequestClose={props.onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View
          style={{
            width: '100%',
            alignSelf: 'stretch',
            maxHeight: Dimensions.get('window').height * 0.9,
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
          }}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 90, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header, Patient Details, TherapyPicker, Date/Time, Duration, Room, Therapists, Notes (as previously structured) */}
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
              {/* Duration */}
              <View style={[styles.row, { marginBottom: 10 }]}>
                {["1", "3", "7", "14", "21", "Cust"].map(opt => {
                  if (opt === 'Cust') {
                    return (
                      <TextInput
                        key={opt}
                        style={[
                          styles.customDurationInput,
                          duration === 'Cust' ? styles.customDurationInputActive : styles.customDurationInputInactive
                        ]}
                        placeholderTextColor={styles.customDurationInput.color}
                        keyboardType="numeric"
                        placeholder="Days"
                        value={props.customDays || ''}
                        onChangeText={(text) => {
                          console.log('Custom Duration onChangeText:', text);
                          if (props.onCustomDaysChange) {
                            props.onCustomDaysChange(text);
                          }
                        }}
                        onFocus={() => {
                          console.log('Custom Duration onFocus');
                          onDurationChange('Cust');
                        }}
                        maxLength={2}
                        pointerEvents="auto"
                      />
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={[styles.durationButton, duration === opt ? styles.durationButtonActive : null]}
                      onPress={() => onDurationChange(opt)}
                    >
                      <Text style={duration === opt ? styles.durationButtonActiveText : styles.durationButtonText}>{opt + 'd'}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {/* Room */}
              <View style={[styles.row, { marginBottom: 10 }]}>
                {availableRooms.map(room => (
                  <TouchableOpacity
                    key={room.id}
                    style={[styles.roomAvatar, selectedRoom === room.id ? styles.roomAvatarActive : null]}
                    onPress={() => onRoomChange && onRoomChange(room.id)}
                  >
                    <Text style={selectedRoom === room.id ? styles.roomAvatarActiveText : styles.roomAvatarText}>{room.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Therapists */}
              <View style={[styles.row, { marginBottom: 10 }]}>
                {availableTherapists.map(t => (
                  <TouchableOpacity
                    key={t.id}
                    style={[styles.therapistAvatar, selectedTherapists.includes(t.id) ? styles.therapistAvatarActive : null]}
                    onPress={() => onTherapistToggle(t.id)}
                  >
                    <Text style={selectedTherapists.includes(t.id) ? styles.therapistAvatarActiveText : styles.therapistAvatarText}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {/* Notes */}
              <TextInput
                style={styles.input}
                value={notes}
                onChangeText={onNotesChange}
                placeholder="Add notes"
                multiline
              />
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
            {/* Start Therapy button anchored at the bottom */}
            <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', padding: 12, borderTopWidth: 1, borderColor: '#eee', zIndex: 10 }}>
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleSubmit}
                disabled={isSubmitting}
              ></TouchableOpacity>
            </View>
          </ScrollView>

        </View>
      </KeyboardAvoidingView>
    </Modal >
  );
}
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
  customDurationInput: {
    backgroundColor: '#fff',
    width: 60,
    textAlign: 'center',
    paddingVertical: 6, // from styles.durationButton.paddingVertical
    paddingHorizontal: 10, // from styles.durationButton.paddingHorizontal
    color: '#444', // from styles.durationButtonText.color
    borderRadius: 8, // from styles.durationButton.borderRadius
    marginRight: 6, // from styles.durationButton.marginRight
    marginBottom: 6, // from styles.durationButton.marginBottom
    borderWidth: 1.5,
    fontSize: 15, // Consistent with styles.input
  },
  customDurationInputActive: {
    borderColor: '#777',
  },
  roomAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  roomAvatarActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  roomAvatarText: {
    color: '#333',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  therapistAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#c0c0c0',
  },
  therapistAvatarActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  therapistAvatarText: {
    color: '#333',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  therapistAvatarActiveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  roomAvatarActiveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  customDurationInputInactive: {
    borderColor: '#ccc',
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

