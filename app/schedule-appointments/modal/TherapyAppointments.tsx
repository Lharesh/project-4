import React from 'react';
import { useTherapyAppointmentForm } from '../../../hooks/useTherapyAppointmentForm';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import styles from './TherapyAppointments.styles';
import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';
import { MOCK_THERAPIES } from '../mock/therapies';
import { MOCK_THERAPISTS } from '../mock/therapists';
import ScheduleMatrix from '../components/ScheduleMatrix';
import ConflictAlternativesCard from '../components/ConflictAlternativesCard';
import { getRecommendedSlots } from '../helpers/recommendationHelpers';
import PatientPicker from '../components/PatientPicker';
import TherapyPicker from '../components/TherapyPicker';
import TherapistPicker from '../components/TherapistPicker';
import { getTherapistConflicts, getRecurringConflicts } from '../helpers/conflictCalculations';
import { addDays } from '../helpers/dateHelpers';

import { useDispatch, useSelector } from 'react-redux';
import { addAppointment } from '../../../redux/slices/appointmentsSlice';
import { buildScheduleMatrix } from './buildScheduleMatrix';
import RecurringSlotPreview from './RecurringSlotPreview';
import { canBookAppointment } from '../helpers/rulesEngine';

interface Therapist {
  id: string;
  name: string;
  gender: 'male' | 'female';
  availability: Record<string, string[]>;
}

interface TherapyAppointmentsProps {
  onClose: () => void;
  onCreate: (appointment: any) => void;
}

// Inline mock data for patients and rooms (previously imported)
const MOCK_PATIENTS = [
  { id: 'c1', name: 'Amit Kumar', gender: 'male', mobile: '9999999991' },
  { id: 'c2', name: 'Sunita Singh', gender: 'female', mobile: '9999999992' },
  { id: 'c3', name: 'Ravi Patel', gender: 'male', mobile: '9999999993' },
];

const MOCK_ROOMS = [
  { roomNumber: 'r1', name: 'Room 1 (Therapy)' },
  { roomNumber: 'r2', name: 'Room 2 (Therapy)' },
  { roomNumber: 'r3', name: 'Room 3 (Therapy)' }
];

const DURATION_PRESETS = [1, 3, 7, 14, 21];

import BookingWizardModal from '../components/BookingWizardModal';

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = ({ onClose, onCreate }) => {
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [wizardRoomId, setWizardRoomId] = React.useState<string>('');
  const [wizardSlot, setWizardSlot] = React.useState<string | null>(null);
  const appointments = useSelector((state: any) => state.appointments.appointments || []);
  // console.log('[TherapyAppointments] Current Redux appointments:', appointments);

  const dispatch = useDispatch();

  // Use custom form hook
  const {
    touched, setTouched, submitAttempted, setSubmitAttempted,
    selectedDate, setSelectedDate,
    patientSearch, setPatientSearch, selectedPatient, setSelectedPatient, patientGender, setPatientGender, patientInputFocused, setPatientInputFocused,
    therapySearch, setTherapySearch, selectedTherapy, setSelectedTherapy, therapyInputFocused, setTherapyInputFocused,
    selectedTherapists, setSelectedTherapists, therapistSearch, setTherapistSearch, showAllTherapists, setShowAllTherapists, therapistInputFocused, setTherapistInputFocused,
    startDate, setStartDate, timeSlot, setTimeSlot, showTimePicker, setShowTimePicker,
    duration, setDuration, customDuration, setCustomDuration, customMode, setCustomMode,
    selectedRoom, setSelectedRoom,
    notes, setNotes,
  } = useTherapyAppointmentForm({ initialDate: '2025-05-20' });
  // State hooks at the top
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [showAlternatives, setShowAlternatives] = React.useState(false);
  // Only declare recommendedSlots state ONCE at the top
  const [recommendedSlots, setRecommendedSlots] = React.useState<any[]>([]);
  const [selectedAlternativeSlot, setSelectedAlternativeSlot] = React.useState<any>(null);

  // --- Therapy Room Schedule states ---
  const [showSchedule, setShowSchedule] = React.useState(false);

  const [scheduleDate, setScheduleDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  // Always rebuild matrix when appointments or scheduleDate change
  const matrix = React.useMemo(() => {
    return buildScheduleMatrix(scheduleDate, appointments || []);
  }, [scheduleDate, appointments]);

  // Log matrix after it is built
  React.useEffect(() => {
    console.log('[TherapyAppointments] Matrix built:', matrix);
  }, [matrix]);

  // Show alternatives if there is a conflict
  React.useEffect(() => {
    // Only compute if all required fields are present
    if (!selectedDate || !timeSlot || !selectedTherapists.length || !selectedRoom) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }
    // Check if booking is possible
    const canBook = canBookAppointment({
      therapistIds: selectedTherapists,
      roomNumber: selectedRoom ?? '',
      date: selectedDate,
      slot: timeSlot,
      appointments
    });
    if (canBook) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }
    // Compute alternatives
    const alternatives = getRecommendedSlots({
      originalSlot: timeSlot,
      originalTherapistIds: selectedTherapists,
      patientId: selectedPatient || '',
      date: selectedDate,
      matrix
    });
    setRecommendedSlots(alternatives);
    setShowAlternatives(alternatives && alternatives.length > 0);
  }, [appointments, selectedDate, selectedTherapists, selectedRoom ?? '', timeSlot, matrix]);

  // Memoize recurringConflicts
  const isRecurring = (customMode && Number(customDuration) > 1) || (!customMode && duration && [3,7,14,21].includes(duration));
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

  // Log recurringConflicts after it is built
  React.useEffect(() => {
    console.log('[TherapyAppointments] Recurring conflicts:', recurringConflicts);
  }, [recurringConflicts]);

  // Compute recommended slots if there are conflicts, in useEffect
  React.useEffect(() => {
    if (recurringConflicts.length > 0 && selectedPatient && timeSlot && selectedTherapists.length > 0) {
      const recs = getRecommendedSlots({
        originalSlot: timeSlot,
        originalTherapistIds: selectedTherapists,
        patientId: selectedPatient || '',
        date: startDate,
        matrix
      });
      // Only show one slot per room/slot/therapist combo, prefer 'same therapist' or 'same gender'
      setRecommendedSlots(recs.slice(0, 6).map(r => ({ roomNumber: r.roomNumber, slot: r.slot, therapistId: r.therapistId, reason: r.reason })));
    }
  }, [recurringConflicts, selectedPatient, timeSlot, selectedTherapists, startDate, matrix]);


  // Validation logic
  const isValid = () => {
    return (
      !!selectedPatient &&
      !!selectedTherapy &&
      selectedTherapists.length > 0 &&
      !!startDate &&
      !!timeSlot &&
      ((duration && duration > 0) || (customMode && !!customDuration && Number(customDuration) > 0))
    );
  };

  const handleStartTherapy = () => {
    setTouched({
      patient: true,
      therapy: true,
      therapists: true,
      date: true,
      time: true,
      duration: true,
    });
    setSubmitAttempted(true);
    if (!isValid()) return;
    setWizardOpen(true);
  };

  const handleSaveWizard = (bookingData: any) => {
    // Remove onDone before dispatching to Redux
    const { onDone, ...toSave } = bookingData;
    dispatch(addAppointment(toSave));
    setWizardOpen(false);
    setWizardRoomId('');
    setWizardSlot('');
    if (onDone) onDone();
  };

  // Patient filter logic
  const filteredPatients = MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()));

  // Therapy filter logic
  const filteredTherapies = MOCK_THERAPIES.filter(t => t.name.toLowerCase().includes(therapySearch.toLowerCase()));
  const frequentTherapies = MOCK_THERAPIES.slice(0, 5);

  // Therapist filter logic
  const patientObj = MOCK_PATIENTS.find(p => p.id === selectedPatient);
  const genderFilter = patientObj ? patientObj.gender : null;
  let filteredTherapists = MOCK_THERAPISTS as Therapist[];
  if (genderFilter && !showAllTherapists && !therapistSearch) {
    filteredTherapists = (MOCK_THERAPISTS as Therapist[]).filter(t => t.gender === genderFilter);
  }
  if (therapistSearch) {
    filteredTherapists = (MOCK_THERAPISTS as Therapist[]).filter(t => t.name.toLowerCase().includes(therapistSearch.toLowerCase()));
  }

  // Duration logic
  const handleDurationSelect = (val: number | 'custom') => {
    if (val === 'custom') {
      setCustomMode(true);
      setDuration(null);
    } else {
      setCustomMode(false);
      setDuration(val);
      setCustomDuration('');
    }
  };

  // Therapist selection
  const toggleTherapist = (id: string) => {
    setSelectedTherapists(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* --- Therapy Room Schedule (Collapsible) --- */}
        <View style={{ marginBottom: 18 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e0e0e0', width: 180 }}
            onPress={() => setShowSchedule(s => !s)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20, marginRight: 6 }}>{showSchedule ? '📅' : '🗓️'}</Text>
            <Text style={{ fontWeight: 600, fontSize: 16 }}>Therapy Room Schedule</Text>
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

        <PatientPicker
          patients={MOCK_PATIENTS}
          selectedPatient={selectedPatient || ''}
          setSelectedPatient={setSelectedPatient}
          patientSearch={patientSearch}
          setPatientSearch={setPatientSearch}
          patientInputFocused={patientInputFocused}
          setPatientInputFocused={setPatientInputFocused}
          setPatientGender={setPatientGender}
          setTouched={setTouched}
          touched={touched.patient || submitAttempted}
        />
      {/* Therapy Picker */}
      <TherapyPicker
        therapies={MOCK_THERAPIES}
        selectedTherapy={selectedTherapy}
        setSelectedTherapy={setSelectedTherapy}
        therapySearch={therapySearch}
        setTherapySearch={setTherapySearch}
        therapyInputFocused={therapyInputFocused}
        setTherapyInputFocused={setTherapyInputFocused}
        touched={touched.therapy || submitAttempted}
        setTouched={(t: any) => setTouched((prev: any) => ({ ...prev, therapy: true }))}
      />

      <GenericDatePicker
        label="Start Date"
        value={startDate}
        onChange={val => { setStartDate(val); setTouched(t => ({ ...t, date: true })); }}
        inputStyle={{ fontVariant: ['tabular-nums'], fontFamily: 'monospace' }}
        style={{ marginBottom: 8 }}
      />
      {/* Validation: Date */}
      {!startDate && (touched.date || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a date.</Text>
      )}
      {/* Time Picker */}
      <GenericTimePicker
        label="Start Time"
        value={timeSlot}
        onChange={val => { setTimeSlot(val); setTouched(t => ({ ...t, time: true })); }}
        style={{ marginBottom: 8 }}
      />

      {/* Duration Picker */}
      <Text style={styles.label}>Duration (days)</Text>
      <View style={styles.durationRow}>
        {DURATION_PRESETS.map(preset => (
          <TouchableOpacity
            key={preset}
            style={[styles.durationBox, duration === preset && !customMode && styles.durationBoxActive]}
            onPress={() => { setDuration(preset); setCustomMode(false); setTouched(t => ({ ...t, duration: true })); }}
          >
            <Text style={{ color: duration === preset && !customMode ? '#fff' : '#222' }}>{preset} days</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.durationBox, customMode && styles.durationBoxActive]}
          onPress={() => { setCustomMode(true); setDuration(null); setTouched(t => ({ ...t, duration: true })); }}
        >
          <Text style={{ color: customMode ? '#fff' : '#222' }}>Custom</Text>
        </TouchableOpacity>
        {customMode && (
          <TextInput
            style={[styles.input, { width: 70, marginLeft: 8 }]} 
            placeholder="Enter days"
            keyboardType="numeric"
            value={customDuration ?? ''}
            onChangeText={text => {
              // Only allow numeric input
              if (/^\d*$/.test(text)) setCustomDuration(text);
              setTouched(t => ({ ...t, duration: true }));
            }}
          />
        )}
      </View>

      {/* Validation: Duration (only show duration errors here) */}
      {((!duration && !customMode) || (customMode && (!customDuration || Number(customDuration) <= 0))) && (touched.duration || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please enter a valid duration in days.</Text>
      )}

      {/* Therapist Picker */}
      <TherapistPicker
        therapists={MOCK_THERAPISTS.map(t => ({
          ...t,
          availability: t.availability as Record<string, string[]>
        }))}
        selectedTherapists={selectedTherapists}
        setSelectedTherapists={setSelectedTherapists}
        therapistSearch={therapistSearch}
        setTherapistSearch={setTherapistSearch}
        showAllTherapists={showAllTherapists}
        setShowAllTherapists={setShowAllTherapists}
        therapistInputFocused={therapistInputFocused}
        setTherapistInputFocused={setTherapistInputFocused}
        patientGender={patientGender}
        touched={touched.therapists || submitAttempted}
        setTouched={(t: any) => setTouched((prev: any) => ({ ...prev, therapists: true }))}
      />

      {/* Room (Optional) */}
      <Text style={styles.label}>Room (Optional)</Text>
      <View style={styles.roomList}>
        {MOCK_ROOMS.map(r => (
          <TouchableOpacity
            key={r.roomNumber}
            style={[styles.roomBox, selectedRoom === r.roomNumber && styles.roomBoxActive]}
            onPress={() => setSelectedRoom(r.roomNumber)}
          >
            <Text style={{ color: selectedRoom === r.roomNumber ? '#fff' : '#222' }}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes / Diagnosis Reference</Text>
      <TextInput
        style={[styles.input, { minHeight: 60, textAlignVertical: 'top' }]}
        placeholder="Add any special instructions or diagnosis notes here..."
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startBtn} onPress={() => {
          setTouched({ patient: true, therapy: true, therapists: true, date: true, time: true, duration: true });
          setSubmitAttempted(true);
          if (!isValid()) return;
          // Conflict check before booking
          const conflict = !canBookAppointment({
            therapistIds: selectedTherapists,
            roomNumber: selectedRoom ?? undefined,
            date: startDate,
            slot: timeSlot,
            appointments,
            patientId: selectedPatient ?? undefined,
          });
          if (conflict) {
            setTouched(t => ({ ...t, conflict: true }));
            setSubmitAttempted(true);
            // Show error message
            alert('Room or therapist is already booked for this slot. Please choose another.');
            return;
          }
          // Build recurring appointments for each day in duration
          const days = customMode ? Number(customDuration) : (duration ?? 1);
          let lastCreatedAppointment = null;
          for (let i = 0; i < days; i++) {
            const date = addDays(startDate, i);
            const appointment = {
              id: `${Date.now()}_${selectedPatient}_${selectedTherapists.join('_')}_${date}`,
              clientId: String(selectedPatient ?? ''),
              clientName: (MOCK_PATIENTS.find(p => p.id === selectedPatient)?.name || selectedPatient || ''),
              therapistIds: selectedTherapists,
              therapistNames: selectedTherapists.map(id => (MOCK_THERAPISTS.find(t => t.id === id)?.name || id)),
              treatmentId: selectedTherapy || '',
              treatmentName: (MOCK_THERAPIES.find(t => t.id === selectedTherapy)?.name || selectedTherapy || ''),
              duration: days, // Store total therapy duration for all appointments
              dayIndex: i + 1, // Store the day index (1-based)
              roomNumber: selectedRoom != null ? String(selectedRoom) : undefined,
              date,
              time: timeSlot,
              status: 'scheduled' as 'scheduled',
              notes,
              tab: 'Therapy' as 'Therapy',
              totalDays: days,
            };
            dispatch(addAppointment(appointment));
            lastCreatedAppointment = appointment;
          }
          if (onCreate && lastCreatedAppointment) onCreate(lastCreatedAppointment);
          // Close the form after booking
          if (onClose) onClose();
        }}>
          <Text style={styles.startBtnText}>Start Therapy</Text>
        </TouchableOpacity>
      </View>
      {/* Show recurring slot preview if recurring booking is selected and any slot is unavailable */}
        {(() => {
            // Compute proposed appointments for preview
            const daysToBook = customMode ? Number(customDuration) : (duration ?? 1);
            const proposedAppointments = [];
            // Guard against invalid startDate
            const isValidDate = (dateStr: string) => {
              if (!dateStr) return false;
              const d = new Date(dateStr);
              return !isNaN(d.getTime());
            };
            if (!isValidDate(startDate)) {
              return null;
            }
            for (let i = 0; i < daysToBook; i++) {
              const dateVal = addDays(startDate, i);
              proposedAppointments.push({
                id: `preview_${selectedPatient}_${selectedTherapists.join('_')}_${dateVal}`,
                clientId: String(selectedPatient ?? ''),
                clientName: (MOCK_PATIENTS.find(p => p.id === selectedPatient)?.name || selectedPatient || ''),
                therapistIds: selectedTherapists,
                therapistNames: selectedTherapists.map(id => (MOCK_THERAPISTS.find(t => t.id === id)?.name || id)),
                treatmentId: selectedTherapy || '',
                treatmentName: (MOCK_THERAPIES.find(t => t.id === selectedTherapy)?.name || selectedTherapy || ''),
                duration: daysToBook,
                dayIndex: i + 1,
                totalDays: daysToBook,
                roomNumber: selectedRoom != null ? String(selectedRoom) : undefined,
                date: dateVal,
                time: timeSlot,
                status: 'preview',
                notes,
                tab: 'Therapy',
              });
            }
            const previewAppointments = [...appointments, ...proposedAppointments];
            // Import checkRecurringSlotAvailability here to avoid circular deps
            const { checkRecurringSlotAvailability } = require('../../../utils/checkRecurringSlotAvailability');
            let previewResults: any[] = [];
            let anyUnavailable = false;
            try {
              previewResults = checkRecurringSlotAvailability({
                startDate,
                days: daysToBook,
                roomNumber: selectedRoom,
                slotTime: timeSlot,
                appointments: previewAppointments,
                skipNonWorkingDays: false,
                clientId: selectedPatient,
              });
              anyUnavailable = previewResults.some((r: any) => !r.available);
            } catch (e) {
              // fallback: show preview if error
              anyUnavailable = true;
            }
            if (isRecurring && selectedRoom && timeSlot && anyUnavailable) {
              return (
                <RecurringSlotPreview
                  startDate={startDate}
                  days={daysToBook}
                  roomNumber={selectedRoom}
                  slotTime={timeSlot}
                  appointments={previewAppointments}
                  skipNonWorkingDays={false}
                />
              );
            }
            return null;
          })()}
        {/* Show alternatives if conflict and available */}
        {showAlternatives && recommendedSlots && recommendedSlots.length > 0 && (
          <ConflictAlternativesCard
            onSelectAlternative={() => {}}
            conflict={{ date: startDate, slot: timeSlot, therapistIds: selectedTherapists || [] }}
            alternatives={recommendedSlots}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default TherapyAppointments;
