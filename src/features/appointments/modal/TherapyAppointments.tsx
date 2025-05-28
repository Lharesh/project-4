import React from 'react';
import { useTherapyAppointmentForm } from '../../../hooks/useTherapyAppointmentForm';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import styles from './TherapyAppointments.styles';
import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';
import ScheduleMatrix from '../components/ScheduleMatrix';

import PatientPicker from '../components/PatientPicker';
import TherapyPicker from '../components/TherapyPicker';
import { TherapistPicker } from '../components/TherapistPicker';
import { getRecurringConflicts } from '../helpers/conflictCalculations';
import { getRecurringSlotAlternatives } from '../helpers/recurringSlotAlternatives';
import { isPatientAvailable } from '../helpers/availabilityUtils';
import { addDays } from '../helpers/dateHelpers';
import { format } from 'date-fns';
import type { Client } from '@/features/clients/clientsSlice';
import { buildScheduleMatrix } from './buildScheduleMatrix';
import { getBookingOptions, filterTherapistsByGender } from '../helpers/rulesEngine';
import { isSlotInPast } from '../helpers/isSlotInPast';
import { addDynamicAvailability } from '../helpers/dynamicAvailability';

import type { Therapist } from '../helpers/availabilityUtils';

interface TherapyAppointmentsProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (appointment: any) => void;
  clients: Client[];
  therapists: any[];
  rooms: any[];
  clinicTimings: any;
  appointments: any[];
  therapies: any[];
  enforceGenderMatch: boolean;
}

const DURATION_PRESETS = [1, 3, 7, 14, 21];

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = ({ visible, onClose, onCreate, clients, therapists, rooms, clinicTimings, appointments, therapies, enforceGenderMatch }) => {
  // Local state for schedule collapse
  const [showSchedule, setShowSchedule] = React.useState(false);
  // --- Redux removed: all data comes from props ---

  // --- Picker local state ---
  // Therapy picker
  const [therapySearch, setTherapySearch] = React.useState('');
  const [therapyInputFocused, setTherapyInputFocused] = React.useState(false);
  // Therapist picker
  const [therapistSearch, setTherapistSearch] = React.useState('');
  const [showAllTherapists, setShowAllTherapists] = React.useState(false);
  const [therapistInputFocused, setTherapistInputFocused] = React.useState(false);
  // Use custom form hook (must come before mapping)
  const {
    touched, setTouched, submitAttempted, setSubmitAttempted,
    selectedDate, setSelectedDate,
    selectedPatient, setSelectedPatient, patientGender, setPatientGender,
    selectedTherapy, setSelectedTherapy,
    selectedTherapists, setSelectedTherapists,
    startDate, setStartDate, timeSlot, setTimeSlot, showTimePicker, setShowTimePicker,
    duration, setDuration, customDuration, setCustomDuration, customMode, setCustomMode,
    selectedRoom, setSelectedRoom,
    notes, setNotes,
  } = useTherapyAppointmentForm({ initialDate: format(new Date(), 'yyyy-MM-dd') });

// Centralized gender filtering logic
const filteredTherapists = React.useMemo(() => {
  if (!patientGender) return therapists;
  return filterTherapistsByGender(therapists, patientGender, enforceGenderMatch);
}, [therapists, patientGender, enforceGenderMatch]);
  const [replacementSlots, setReplacementSlots] = React.useState<Record<string, string>>({});

// Map therapists and rooms with all required variables from props
  const date = startDate;
  const slotDuration = 15; // or get from config/clinicTimings
  const therapistsWithAvailability = addDynamicAvailability({
    entities: therapists,
    entityType: 'therapist',
    date: startDate || format(new Date(), 'yyyy-MM-dd'),
    appointments,
    clinicTimings,
    slotDuration,
  });
  const roomsWithAvailability = addDynamicAvailability({
    entities: rooms,
    entityType: 'room',
    date: startDate || format(new Date(), 'yyyy-MM-dd'),
    appointments,
    clinicTimings,
    slotDuration,
  });

  // State hooks at the top
  const [showAlternatives, setShowAlternatives] = React.useState(false);
  // Only declare recommendedSlots state ONCE at the top
  const [recommendedSlots, setRecommendedSlots] = React.useState<any[]>([]);

  // --- Therapy Room Schedule states ---
  const [scheduleDate, setScheduleDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  // Always rebuild matrix when appointments or scheduleDate change
  const matrix = React.useMemo(() => {
    return buildScheduleMatrix(scheduleDate, appointments || [], rooms, therapists, clinicTimings);
  }, [scheduleDate, appointments, rooms, therapists, clinicTimings]);

  // Log matrix after it is built
  React.useEffect(() => {
  }, [matrix]);

  // Compute recurring slot alternatives and reasons
  const getRecurringSlotInfo = React.useCallback(() => {
    // Prevent if no patient selected
    if (!startDate || !selectedRoom || !selectedPatient || !selectedTherapists) return {};
    const date = startDate;
    const slotDuration = 15; // or get from config/clinicTimings
    const therapistsWithAvailability = addDynamicAvailability({
      entities: therapists,
      entityType: 'therapist',
      date,
      appointments,
      clinicTimings,
      slotDuration,
    });
    const roomsWithAvailability = addDynamicAvailability({
      entities: rooms,
      entityType: 'room',
      date,
      appointments,
      clinicTimings,
      slotDuration,
    });
    return getRecurringSlotAlternatives({
      enforceGenderMatch,
      startDate,
      days: customMode ? Number(customDuration) : (duration ?? 1),
      requestedSlot: timeSlot,
      selectedTherapists,
      appointments,
      selectedRoom,
      patientId: selectedPatient,
      allTherapists: therapistsWithAvailability,
      allRooms: roomsWithAvailability,
      patients: clients,
      now: new Date(),
    });
  }, [appointments, startDate, timeSlot, selectedTherapists, selectedRoom, selectedPatient, therapists, rooms, clients, customMode, customDuration, duration]);

  // Handler for dropdown
  const handleSlotChange = (date: string, slot: string) => {
    setReplacementSlots((prev: Record<string, string>) => ({ ...prev, [date]: slot }));
  };

  // Show alternatives if there is a conflict
  React.useEffect(() => {
    if (!selectedDate || !timeSlot || !selectedTherapists.length || !selectedRoom) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }
    const canBook = getBookingOptions({
      enforceGenderMatch,
      patientId: selectedPatient ?? '',
      selectedTherapists,
      selectedRoom: selectedRoom ?? '',
      date: format(new Date(selectedDate), 'yyyy-MM-dd'),
      slot: timeSlot,
      appointments,
      allTherapists: therapists,
      allRooms: rooms,
      patients: clients,
      now: new Date(),
      maxAlternatives: 3
    });
    if (canBook) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }
    // --- FIX: Compute recurring slot alternatives ---
    const days = customMode ? Number(customDuration) : (duration ?? 1);
    const alternativesResult = getRecurringSlotAlternatives({
      enforceGenderMatch,
      startDate: selectedDate,
      days,
      requestedSlot: timeSlot,
      selectedTherapists,
      appointments,
      selectedRoom,
      patientId: selectedPatient || "",
      allTherapists: therapists,
      allRooms: rooms,
      patients: clients,
      now: new Date(),
    });
    setRecommendedSlots(alternativesResult[0]?.alternatives || []);
    setShowAlternatives(true);
  }, [appointments, selectedDate, selectedTherapists, selectedRoom, timeSlot, matrix, customMode, customDuration, duration, clients, therapists, rooms]);

  // Memoize recurringConflicts
  const isRecurring = (customMode && Number(customDuration) > 1) || (!customMode && duration && [3, 7, 14, 21].includes(duration));
  const recurringConflicts = React.useMemo(() => {
    if (selectedTherapists.length > 0 && startDate && timeSlot && isRecurring) {
      const days = customMode ? Number(customDuration) : (duration ?? 1);
      const conflicts = getRecurringConflicts(
        appointments,
        startDate,
        days,
        timeSlot,
        selectedTherapists,
        addDays
      );
      return conflicts;
    }
    return [];
  }, [appointments, startDate, timeSlot, selectedTherapists, customMode, customDuration, duration, isRecurring]);

  // Validation logic 
  const isValid = () => {
    if (!selectedPatient || !selectedTherapy || selectedTherapists.length === 0 || !startDate || !timeSlot || (!duration && !(customMode && !!customDuration && Number(customDuration) > 0))) {
      return false;
    }
    // Ensure selectedPatient and selectedRoom are never null or undefined
    const patientId = selectedPatient ? selectedPatient : '';
    const roomId = selectedRoom ? selectedRoom : '';
    // Check for any slot in the series being in the past or unresolved
    const daysToBook = customMode ? Number(customDuration) : (duration ?? 1);
    const now = new Date();

    // DEBUG: Log input values for isValid
    console.log('[DEBUG][isValid][INPUT]', {
      selectedPatient,
      selectedTherapy,
      selectedTherapists,
      startDate,
      timeSlot,
      duration,
      customMode,
      customDuration,
      patientId,
      roomId,
      daysToBook,
      now,
      appointments,
      therapists,
      rooms,
      clients,
      enforceGenderMatch
    });
    for (let i = 0; i < daysToBook; i++) {
      const dateVal = addDays(startDate, i);
      // Use replacement slot if present
      const slot = replacementSlots[dateVal] || timeSlot;
      if (!slot) return false;
      if (isSlotInPast(dateVal, slot, now)) return false;
      const bookingOptionsInput = {
        enforceGenderMatch,
        patientId,
        selectedTherapists,
        selectedRoom: roomId,
        date: format(new Date(dateVal), 'yyyy-MM-dd'),
        slot,
        appointments,
        allTherapists: therapists,
        allRooms: rooms,
        patients: clients,
        now: new Date(),
        maxAlternatives: 3
      };
      // DEBUG: Log input to getBookingOptions
      console.log('[DEBUG][isValid][getBookingOptions][INPUT]', bookingOptionsInput);
      const bookingOptionsResult = getBookingOptions(bookingOptionsInput);
      // DEBUG: Log output from getBookingOptions
      console.log('[DEBUG][isValid][getBookingOptions][OUTPUT]', bookingOptionsResult);
      if (!bookingOptionsResult) return false;
    } 
    return true;
  };
  // --- Handler for booking appointments ---
  const handleBookAppointments = () => {
    setTouched({ patient: true, therapy: true, therapists: true, date: true, time: true, duration: true });
    setSubmitAttempted(true);
    if (!isValid()) return;

    // Strict conflict check using getBookingOptions
    const bookingOptions = getBookingOptions({
      enforceGenderMatch,
      patientId: selectedPatient ? selectedPatient : '',
      selectedTherapists,
      selectedRoom: selectedRoom ? selectedRoom : '',
      date: typeof startDate === 'string' ? format(new Date(startDate), 'yyyy-MM-dd') : format(startDate, 'yyyy-MM-dd'),
      slot: timeSlot,
      appointments,
      allTherapists: therapists,
      allRooms: rooms,
      patients: clients,
      now: new Date(),
      maxAlternatives: 3
    });
    if (!bookingOptions[0]?.available) {
      setShowAlternatives(true);
      setRecommendedSlots(bookingOptions[0]?.alternatives || []);
      // Optionally show a message to the user
      return;
    }

    // Build recurring appointments for each day in duration
    const days = customMode ? Number(customDuration) : (duration ?? 1);
    let lastCreatedAppointment = null;
    const daysToBook = Number(days);
    const generatedAppointments: any[] = [];
   
    // Find the selected therapy object for duration/name/id lookup
    const selectedTherapyObj = therapies.find((t: any) => t.id === selectedTherapy);
    for (let i = 0; i < daysToBook; i++) {
      const dateObj = addDays(startDate, i);
      const slotString = timeSlot;
      const roomObj = rooms.find((r: any) => r.id === selectedRoom);
      const appointment = {
        id: `${selectedPatient}_${selectedTherapists.join('_')}_${roomObj?.id || selectedRoom}_${format(new Date(dateObj), 'yyyy-MM-dd')}_${slotString}`,
        clientId: String(selectedPatient),
        clientName: (clients.find((p: Client) => p.id === selectedPatient)?.name || selectedPatient || ''),
        therapistIds: selectedTherapists,
        therapistNames: selectedTherapists.map((id: string) => (therapists.find((t: Therapist) => t.id === id)?.name || id)),
        date: format(new Date(dateObj), 'yyyy-MM-dd'),
        time: slotString,
        slot: slotString,
        roomId: roomObj?.id || selectedRoom,
        roomName: roomObj?.name || selectedRoom,
        recurringDays: daysToBook,
        notes: notes || '',
        status: 'scheduled',
        tab: 'Therapy',
        therapyId: selectedTherapyObj?.id || selectedTherapy,
        therapyName: selectedTherapyObj?.name || '',
        duration: (() => {
          if (customMode && customDuration && Number(customDuration) > 0) return Number(customDuration) * (selectedTherapyObj?.duration || 60);
          return selectedTherapyObj?.duration || 60;
        })(),
      };
      generatedAppointments.push(appointment);
      lastCreatedAppointment = appointment;
      console.log('[TherapyAppointments] Generated appointment:', appointment);
    }
    const uniqueAppointments = Array.from(
      new Map(generatedAppointments.map(a => [`${a.clientId}_${a.therapistIds.join('_')}_${a.roomId}_${a.date}_${a.slot}`, a])).values()
    );
    if (onCreate) onCreate(uniqueAppointments);
    if (onClose) onClose();
    setCustomDuration('');
  };

  const DURATION_PRESETS = [1, 3, 7, 14, 21];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Duration Picker UI */}
        <View style={{ marginVertical: 12 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Duration (days)</Text>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DURATION_PRESETS.map((d) => (
              <TouchableOpacity
                key={d}
                style={{
                  backgroundColor: duration === d ? '#007AFF' : '#eee',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  marginRight: 8,
                }}
                onPress={() => {
                  setDuration(d);
                  setCustomDuration('');
                }}
              >
                <Text style={{ color: duration === d ? '#fff' : '#333' }}>{d}</Text>
              </TouchableOpacity>
            ))}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 16,
                paddingHorizontal: 10,
                width: 50,
                marginLeft: 8,
                color: '#333',
              }}
              keyboardType="numeric"
              placeholder="Custom"
              value={customDuration}
              onChangeText={(val) => {
                setCustomDuration(val);
                setDuration(null);
              }}
            />
          </View>
        </View>
        {/* --- Therapy Room Schedule (Collapsible) --- */}
        <View style={styles.section}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e0e0e0', width: 180 }}
            onPress={() => setShowSchedule(s => !s)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20, marginRight: 6 }}>{showSchedule ? '📅' : '🗓️'}</Text>
            <Text style={{ fontWeight: '600', fontSize: 16 }}>Therapy Room Schedule</Text>
            <Text style={{ fontSize: 18, marginLeft: 'auto' }}>{showSchedule ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showSchedule && (
            <View style={{ backgroundColor: '#fff', borderRadius: 10, marginTop: 8, boxShadow: '0 2px 8px #0001', padding: 8 }}>
              {/* Date Scroller Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10, gap: 16 }}>
                {/* Left Arrow */}
                <TouchableOpacity
                  onPress={() => setScheduleDate(date => {
                    const d = new Date(date);
                    d.setDate(d.getDate() - 1);
                    return d.toISOString().slice(0, 10);
                  })}
                  style={{ padding: 8, borderRadius: 20, backgroundColor: '#f3f4f6' }}
                >
                  <Text style={{ fontSize: 20 }}>{'◀'}</Text>
                </TouchableOpacity>
                {/* Date Display */}
                <Text style={{ fontWeight: '600', fontSize: 16, minWidth: 110, textAlign: 'center' }}>{scheduleDate}</Text>
                {/* Right Arrow */}
                <TouchableOpacity
                  onPress={() => setScheduleDate(date => {
                    const d = new Date(date);
                    d.setDate(d.getDate() + 1);
                    return d.toISOString().slice(0, 10);
                  })}
                  style={{ padding: 8, borderRadius: 20, backgroundColor: '#f3f4f6' }}
                >
                  <Text style={{ fontSize: 20 }}>{'▶'}</Text>
                </TouchableOpacity>
              </View>
              {/* ScheduleMatrix inserted below */}
              <ScheduleMatrix
                matrix={matrix}
                conflicts={recurringConflicts}
                selectedDate={scheduleDate}
                selectedTherapists={selectedTherapists}
                onSlotSelect={(roomNumber: string, slot: string, date: string) => {
                  setSelectedRoom(roomNumber);
                  setTimeSlot(slot);
                  setStartDate(date);
                }}
              />
            </View>
          )}
        </View>
        {/* --- End Therapy Room Schedule --- */}

        {/* Patient Picker - placed at the top, outside nested Views */}
        <View style={[styles.section, { marginBottom: 16 }]} pointerEvents="box-none">
          <PatientPicker
            patients={clients}
            value={selectedPatient}
            onChange={setSelectedPatient}
            setPatientGender={setPatientGender}
            touched={touched.patient || submitAttempted}
          />
        </View>
        {/* Therapy Picker */}
        <View style={[styles.section, { marginBottom: 16 }]}>
          <TherapyPicker
            therapies={therapies}
            selectedTherapy={selectedTherapy}
            setSelectedTherapy={setSelectedTherapy}
            therapySearch={therapySearch}
            setTherapySearch={setTherapySearch}
            therapyInputFocused={therapyInputFocused}
            setTherapyInputFocused={setTherapyInputFocused}
            touched={touched.therapy || submitAttempted}
            setTouched={setTouched}
          />
        </View>
        {/* Date Picker */}
        <View style={[styles.section, { marginBottom: 16 }]}>
          <GenericDatePicker
            label="Date"
            value={startDate}
            onChange={setStartDate}
            minDate={new Date()}
          />
          {/* Validation: Date */}
          {!startDate && (touched.date || submitAttempted) && (
            <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a date.</Text>
          )}
          <View style={[styles.section, { marginBottom: 16 }]}></View>
          <TherapistPicker
            therapists={filteredTherapists}
            selectedTherapists={selectedTherapists}
            setSelectedTherapists={setSelectedTherapists}
            therapistSearch={therapistSearch}
            setTherapistSearch={setTherapistSearch}
            showAllTherapists={showAllTherapists}
            setShowAllTherapists={setShowAllTherapists}
            therapistInputFocused={therapistInputFocused}
            setTherapistInputFocused={setTherapistInputFocused}
            patientGender={patientGender ?? undefined}
            touched={touched.therapists || submitAttempted}
            setTouched={setTouched}
          />
        </View>
        <View style={[styles.section, { marginBottom: 16 }]}>
          {/* Time Picker */}
          <GenericTimePicker
            value={timeSlot}
            onChange={setTimeSlot}
          />
        </View>

        {/* Room (Optional) */}
        <View style={styles.section}>
          <Text style={styles.label}>Room (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomAvatarRow} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
            {roomsWithAvailability.map((r: any) => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.roomBox,
                  selectedRoom === r.id && styles.roomBoxActive
                ]}
                onPress={() => setSelectedRoom(r.id)}
              >
                <Text style={[
                  styles.roomAvatarText,
                  selectedRoom === r.id && styles.roomAvatarTextSelected
                ]}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.sectionBottom}>
          {/* Notes */}
          <Text style={styles.label}>Notes / Diagnosis Reference</Text>
          <TextInput
            style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
            placeholder="Add any special instructions or diagnosis notes here..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.sectionBottom}>
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleBookAppointments}
              disabled={!isValid() || (showAlternatives && recommendedSlots.length > 0)}
            >
              <Text style={[styles.startBtnText, (!isValid() || (showAlternatives && recommendedSlots.length > 0)) && { opacity: 0.5 }]}>Start Therapy</Text>
            </TouchableOpacity>

          </View>
          {/* Show recurring slot alternatives if slot is unavailable */}
{/* Always use getRecurringSlotAlternatives output for alternatives UI */}
{showAlternatives && (() => {
  const altResults = getRecurringSlotAlternatives({
    startDate,
    days: 1,
    requestedSlot: timeSlot,
    selectedTherapists,
    appointments,
    selectedRoom: selectedRoom || '',
    patientId: selectedPatient || '',
    allTherapists: therapistsWithAvailability,
    allRooms: roomsWithAvailability,
    patients: clients,
    now: new Date(),
    enforceGenderMatch,
  });
  const reason = altResults[0]?.reason ?? '';
  // Deduplicate by slot-room for display only
  const uniqueAlternatives = altResults[0]?.alternatives ? Array.from(
    new Map(altResults[0].alternatives.map(alt => [alt.slot, alt])).values()
  ) : [];
  return (
    <View style={{ marginTop: 20, padding: 10, backgroundColor: '#fff8e1', borderRadius: 8 }}>
      {typeof reason === 'string' && reason ? (
        <Text style={{ color: '#c62828', fontWeight: 'bold', marginBottom: 8 }}>{reason}</Text>
      ) : null}
      <Text style={{ color: '#c62828', fontWeight: 'bold', marginBottom: 8 }}>
        This slot is unavailable. Please select an alternative:
      </Text>
      {uniqueAlternatives.map((alt) => (
        <TouchableOpacity
          key={alt.slot}
          style={{
            padding: 10,
            backgroundColor: '#e3f2fd',
            borderRadius: 6,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: '#90caf9',
          }}
          onPress={() => {
            const [altSlot, altRoom] = alt.slot.split('-');
            setTimeSlot(altSlot);
            setSelectedRoom(altRoom);
            setShowAlternatives(false);
          }}
        >
          <Text style={{ color: '#1976d2' }}>{`Time: ${alt.slot.replace('-', ' | Room: ')}`}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
})()}



        </View>
      </ScrollView>
    </View>
  );
}
export default TherapyAppointments;