import React from 'react';
import { useTherapyAppointmentForm } from '../../../hooks/useTherapyAppointmentForm';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import styles from './TherapyAppointments.styles';
import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';
import { THERAPIES, THERAPISTS, PATIENTS, ROOMS } from '../mock/scheduleMatrixMock';
import ScheduleMatrix from '../components/ScheduleMatrix';


import PatientPicker from '../components/PatientPicker';
import TherapyPicker from '../components/TherapyPicker';
import TherapistPicker from '../components/TherapistPicker';
import { getRecurringConflicts } from '../helpers/conflictCalculations';
import { addDays } from '../helpers/dateHelpers';

import { useDispatch, useSelector } from 'react-redux';
import { addAppointments } from '@/features/appointments/appointmentsSlice';
import { buildScheduleMatrix } from './buildScheduleMatrix';
import RecurringSlotPreview from './RecurringSlotPreview';
import { canBookAppointment } from '../helpers/rulesEngine';
import { isSlotInPast } from '../helpers/isSlotInPast';

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

const DURATION_PRESETS = [1, 3, 7, 14, 21];

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = ({ onClose, onCreate }) => {
  // State for slot replacements
  const [replacementSlots, setReplacementSlots] = React.useState<Record<string, string>>({});

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

  // Compute recurring slot alternatives and reasons
  const getRecurringSlotInfo = React.useCallback(() => {
    if (!startDate || !selectedRoom) return {};
    return require('../helpers/recurringSlotAlternatives').getRecurringSlotAlternatives({
      startDate,
      days: customMode ? Number(customDuration) : (duration ?? 1),
      requestedSlot: timeSlot,
      selectedTherapists,
      appointments,
      selectedRoom,
      customMode,
      customDuration,
      duration,
      now: new Date(),
    });
  }, [startDate, selectedRoom, customMode, customDuration, duration, selectedTherapists, appointments, timeSlot]);

  const recurringSlotInfo = getRecurringSlotInfo();

  // Handler for dropdown
  const handleSlotChange = (date: string, slot: string) => {
    setReplacementSlots(prev => ({ ...prev, [date]: slot }));
  };

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
    // Alternatives logic removed (getRecommendedSlots is unused)
  }, [appointments, selectedDate, selectedTherapists, selectedRoom ?? '', timeSlot, matrix]);

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

  // Log recurringConflicts after it is built
  React.useEffect(() => {
    console.log('[TherapyAppointments] Recurring conflicts:', recurringConflicts);
  }, [recurringConflicts]);


  // Validation logic 
  const isValid = () => {
    if (!selectedPatient || !selectedTherapy || selectedTherapists.length === 0 || !startDate || !timeSlot || (!duration && !(customMode && !!customDuration && Number(customDuration) > 0))) {
      return false;
    }
    const dates = Object.keys(recurringSlotInfo);
    for (const date of dates) {
      const info = recurringSlotInfo[date];
      if (info.available) continue;
      // If not available, must have a replacement selected and it must be valid
      const replacement = replacementSlots[date];
      if (!replacement) return false;
      if (!info.alternatives.some((a: { slot: string; roomNumber: string }) => `${a.slot}@${a.roomNumber}` === replacement)) return false;
    }
    // Check for any slot in the series being in the past or unresolved
    const daysToBook = customMode ? Number(customDuration) : (duration ?? 1);
    const now = new Date();
    for (let i = 0; i < daysToBook; i++) {
      const dateVal = addDays(startDate, i);
      // Use replacement slot if present
      const slot = replacementSlots[dateVal] || timeSlot;
      if (!slot) return false;
      if (isSlotInPast(dateVal, slot, now)) return false;
      if (!canBookAppointment({
        therapistIds: selectedTherapists,
        roomNumber: selectedRoom ?? '',
        date: dateVal,
        slot,
        appointments
      })) return false;
    }
    return true;
  };

  const handleStartTherapy = () => {
    setTouched({
      patient: true,
      therapy: true,
      therapists: true,
      date: true,
      time: true,
      duration: true
    });
    setSubmitAttempted(true);
    const now = new Date();
    const daysToBook = customMode ? Number(customDuration) : (duration ?? 1);
    const newAppointments = [];
    let lastCreatedAppointment = null;
    for (let i = 0; i < daysToBook; i++) {
      const dateVal = addDays(startDate, i);
      let slot: string | undefined = timeSlot === null ? undefined : timeSlot;
      let roomNumber: string | undefined = selectedRoom === null ? undefined : selectedRoom;
      // Use replacement if present and valid
      if (replacementSlots[dateVal]) {
        const [parsedSlot, parsedRoom] = replacementSlots[dateVal].split('-');
        slot = parsedSlot;
        roomNumber = parsedRoom;
      }
      if (!slot) {
        alert('Please select a valid slot for all unavailable days.');
        return;
      }
      if (isSlotInPast(dateVal, slot, now)) {
        alert('Cannot book a slot in the past. Please select a future time slot.');
        return;
      }
      if (!canBookAppointment({
        therapistIds: selectedTherapists,
        roomNumber: roomNumber ?? undefined,
        date: dateVal,
        slot,
        appointments,
        patientId: selectedPatient ?? undefined
      })) {
        alert('Room or therapist is already booked for this slot. Please choose another.');
        return;
      }
      const appointment = {
        id: `${Date.now()}_${selectedPatient}_${selectedTherapists.join('_')}_${dateVal}`,
        clientId: String(selectedPatient ?? ''),
        clientName: (PATIENTS.find(p => p.id === selectedPatient)?.name || selectedPatient || ''),
        therapistIds: selectedTherapists,
        therapistNames: selectedTherapists.map(id => (THERAPISTS.find(t => t.id === id)?.name || id)),
        treatmentId: selectedTherapy || '',
        treatmentName: (THERAPIES.find(t => t.id === selectedTherapy)?.name || selectedTherapy || ''),
        duration: daysToBook,
        dayIndex: i + 1,
        totalDays: daysToBook,
        roomNumber: roomNumber !== undefined && roomNumber !== null ? String(roomNumber) : undefined,
        date: dateVal,
        time: slot,
        status: 'scheduled' as 'scheduled',
        notes,
        tab: 'Therapy' as 'Therapy',
      };
      newAppointments.push(appointment);
      lastCreatedAppointment = appointment;
    }
    console.log('[handleStartTherapy] Current Redux appointments:', appointments);
    console.log('[handleStartTherapy] Adding new appointments:', newAppointments);
    dispatch(addAppointments(newAppointments));
    // Note: Accessing window.store is not type-safe and may not exist.
    // Instead, rely on Redux state updates and useSelector for latest appointments in the component.
    // If you need to debug, use useEffect to log appointments when they change.
    // setTimeout block removed to fix lint error.
    setRefreshKey(prev => prev + 1);
    if (onCreate && lastCreatedAppointment) onCreate(lastCreatedAppointment);
    if (onClose) onClose();
  };


  // Therapist filter logic
  const patientObj = PATIENTS.find((p: { id: string }) => p.id === selectedPatient);
  const genderFilter = patientObj ? patientObj.gender : null;
  let filteredTherapists = THERAPISTS as Therapist[];
  if (genderFilter && !showAllTherapists && !therapistSearch) {
    filteredTherapists = (THERAPISTS as Therapist[]).filter((t: Therapist) => t.gender === genderFilter);
  }
  if (therapistSearch) {
    filteredTherapists = (THERAPISTS as Therapist[]).filter((t: Therapist) => t.name.toLowerCase().includes(therapistSearch.toLowerCase()));
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
        <View style={styles.section}>
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

        <View style={[styles.section, {marginBottom: 16}]}> 
          <PatientPicker
            patients={PATIENTS}
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
        </View>
        {/* Therapy Picker */}
        <View style={[styles.section, {marginBottom: 16}]}> 
          <TherapyPicker
            therapies={THERAPIES}
            selectedTherapy={selectedTherapy}
            setSelectedTherapy={setSelectedTherapy}
            therapySearch={therapySearch}
            setTherapySearch={setTherapySearch}
            therapyInputFocused={therapyInputFocused}
            setTherapyInputFocused={setTherapyInputFocused}
            touched={touched.therapy || submitAttempted}
            setTouched={(t: any) => setTouched((prev: any) => ({ ...prev, therapy: true }))}
          />
        </View>

        <View style={[styles.section, {marginBottom: 16}]}> 
          <GenericDatePicker
            label="Start Date"
            value={startDate}
            onChange={val => { setStartDate(val); setTouched(t => ({ ...t, date: true })); }}
            inputStyle={{ fontVariant: ['tabular-nums'], fontFamily: 'monospace' }}
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
          />
        </View>

        <View style={[styles.section, {marginBottom: 16}]}> 
          {/* Duration Picker */}
          <Text style={styles.label}>Duration (days)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationScroll} contentContainerStyle={{ alignItems: 'center', gap: 8 }}>
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
          </ScrollView>

          {/* Validation: Duration (only show duration errors here) */}
          {((!duration && !customMode) || (customMode && (!customDuration || Number(customDuration) <= 0))) && (touched.duration || submitAttempted) && (
            <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please enter a valid duration in days.</Text>
          )}
        </View>

        {/* Therapist Picker */}
        <View style={styles.section}>
          <TherapistPicker
            therapists={THERAPISTS.map(t => ({
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
        </View>

        <View style={styles.section}>
          {/* Room (Optional) */}
          <Text style={styles.label}>Room (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomAvatarRow} contentContainerStyle={{ gap: 10, paddingVertical: 4 }}>
          {ROOMS.map(r => {
            const selected = selectedRoom === r.roomNumber;
            return (
              <TouchableOpacity
                key={r.roomNumber}
                style={[styles.roomAvatarTouchable, selected && styles.roomAvatarSelected]}
                onPress={() => setSelectedRoom(r.roomNumber)}
              >
                <View style={[styles.roomAvatarCircle, selected && styles.roomAvatarCircleSelected]}>
                  <Text style={[styles.roomAvatarText, selected && styles.roomAvatarTextSelected]}>{r.roomNumber}</Text>
                </View>
                <Text style={styles.roomAvatarName} numberOfLines={1}>{r.name}</Text>
              </TouchableOpacity>
            );
          })}
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
            const newAppointments = [];
            for (let i = 0; i < days; i++) {
              const date = addDays(startDate, i);
              const appointment = {
                id: `${Date.now()}_${selectedPatient}_${selectedTherapists.join('_')}_${date}`,
                clientId: String(selectedPatient ?? ''),
                clientName: (PATIENTS.find(p => p.id === selectedPatient)?.name || selectedPatient || ''),
                therapistIds: selectedTherapists,
                therapistNames: selectedTherapists.map(id => (THERAPISTS.find(t => t.id === id)?.name || id)),
                treatmentId: selectedTherapy || '',
                treatmentName: (THERAPIES.find(t => t.id === selectedTherapy)?.name || selectedTherapy || ''),
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
              newAppointments.push(appointment);
              lastCreatedAppointment = appointment;
            }
            dispatch(addAppointments(newAppointments.map(appointment => {
              const replacementSlot = replacementSlots[appointment.date];
              return {
                ...appointment,
                time: replacementSlot || appointment.time,
              };
            })));
            if (onCreate && lastCreatedAppointment) onCreate(lastCreatedAppointment);
            // Close the form after booking
            if (onClose) onClose();
          }}>
            <Text style={styles.startBtnText}>Start Therapy</Text>
          </TouchableOpacity>
        </View>
        {/* Show recurring slot preview if recurring booking is selected and any slot is unavailable */}
        {(() => {
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
            const slotInPast = isSlotInPast(dateVal, timeSlot, new Date('2025-05-19T10:28:03+05:30'));
            const canBook = canBookAppointment({
              therapistIds: selectedTherapists,
              roomNumber: selectedRoom ?? '',
              date: dateVal,
              slot: timeSlot,
              appointments
            });
            proposedAppointments.push({
              id: `preview_${selectedPatient}_${selectedTherapists.join('_')}_${dateVal}`,
              clientId: String(selectedPatient ?? ''),
              clientName: (PATIENTS.find(p => p.id === selectedPatient)?.name || selectedPatient || ''),
              therapistIds: selectedTherapists,
              therapistNames: selectedTherapists.map(id => (THERAPISTS.find(t => t.id === id)?.name || id)),
              treatmentId: selectedTherapy || '',
              treatmentName: (THERAPIES.find(t => t.id === selectedTherapy)?.name || selectedTherapy || ''),
              duration: daysToBook,
              dayIndex: i + 1,
              totalDays: daysToBook,
              roomNumber: selectedRoom != null ? String(selectedRoom) : undefined,
              date: dateVal,
              time: timeSlot,
              status: slotInPast ? 'unavailable' : (!canBook ? 'conflict' : 'preview'),
              notes,
              tab: 'Therapy',
              reason: slotInPast ? 'N/A' : (!canBook ? 'Conflict' : undefined),
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
            const availableSlotsByDate = previewResults.reduce((acc, result) => {
              acc[result.date] = result.availableSlots;
              return acc;
            }, {});
            const replacementSlots = previewResults.reduce((acc, result) => {
              if (result.replacementSlot) {
                acc[result.date] = result.replacementSlot;
              }
              return acc;
            }, {});
            return (
              <View style={styles.alternativesSection}>
                <RecurringSlotPreview
                  startDate={startDate}
                  days={customMode ? Number(customDuration) : (duration ?? 1)}
                  roomNumber={selectedRoom}
                  slotTime={timeSlot}
                  appointments={appointments}
                  skipNonWorkingDays={false}
                  recurringSlotInfo={recurringSlotInfo}
                  replacementSlots={replacementSlots}
                  onSlotChange={(date, slot) => {
                    setReplacementSlots(prev => ({ ...prev, [date]: slot }));
                  }}
                />
              </View>
            );
          }
          return null;
        })()}
        {/* Show alternatives if conflict and available */}
        </View>
      </ScrollView>
    </View>
  );
};

export default TherapyAppointments;
