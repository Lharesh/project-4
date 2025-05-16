import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import styles from './TherapyAppointments.styles';
import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';
import { MOCK_THERAPIES } from '../mock/therapies';
import { MOCK_THERAPISTS } from '../mock/therapists';
import { useDispatch } from 'react-redux';
import { addAppointment } from '../../../redux/slices/appointmentsSlice';


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

const MOCK_ROOMS = [
  { id: 'r1', name: 'Room 1 (Therapy)' },
  { id: 'r2', name: 'Room 2 (Therapy)' },
  { id: 'r3', name: 'Room 3 (Therapy)' },
];

const MOCK_PATIENTS = [
  { id: 'c1', name: 'Amit Kumar', gender: 'male' },
  { id: 'c2', name: 'Sunita Singh', gender: 'female' },
  { id: 'c3', name: 'Ravi Patel', gender: 'male' },
];

const DURATION_PRESETS = [1, 3, 7, 14, 21];

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = ({ onClose, onCreate }) => {
  const dispatch = useDispatch();
  // Validation state
  const [touched, setTouched] = useState({
    patient: false,
    therapy: false,
    therapists: false,
    date: false,
    time: false,
    duration: false,
  });
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
    const patientObj = MOCK_PATIENTS.find(p => p.id === selectedPatient);
    const therapyObj = MOCK_THERAPIES.find(t => t.id === selectedTherapy);
    // Build Redux-compatible appointment object
    // Utility to add days to a date string (YYYY-MM-DD)
    function addDays(dateStr: string, days: number) {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + days);
      return date.toISOString().slice(0, 10);
    }

    // Determine if duration is days or custom
    const daysDuration = customMode ? Number(customDuration) : (duration ?? 0);
    // Only allow 1, 3, 7, 14, 21 as days (not minutes)
    const validDurations = [1, 3, 7, 14, 21];
    const isDayDuration = validDurations.includes(daysDuration);

    let createdAppointments = [];
    // Assume sessionDuration is the actual session duration in minutes (default 60 if not set)
    let sessionDuration = 60;
    if (therapyObj && typeof therapyObj.slotDuration === 'number') {
      sessionDuration = therapyObj.slotDuration;
    }
    if (customMode && Number(customDuration) > 0) {
      sessionDuration = Number(customDuration);
    }
    
    // Prevent duplicate appointments: Only add for the current therapy, and only for the selected days, not for previous therapies.

if (isDayDuration && daysDuration > 1) {
  createdAppointments = [];
  for (let i = 0; i < daysDuration; i++) {
    
    const appt = {
      id: `${Date.now()}_${i}_${therapyObj?.id}`,
      clientId: patientObj?.id || '',
      clientName: patientObj?.name || '',
      therapistIds: selectedTherapists,
      therapistNames: selectedTherapists.map(tid => {
        const th = MOCK_THERAPISTS.find(t => t.id === tid);
        return th ? th.name : '';
      }),
      treatmentId: therapyObj?.id,
      treatmentName: `Day ${i + 1}: ${therapyObj?.name}`,
      duration: sessionDuration,
      roomNumber: selectedRoom || '',
      date: addDays(startDate, i),
      time: timeSlot,
      status: 'scheduled' as 'scheduled',
      notes,
      tab: 'Therapy' as 'Therapy',
    };
    
    createdAppointments.push(appt);
  }
  // Only dispatch once per appointment (not on every render or modal open)
  
  createdAppointments.forEach(appt => {
    dispatch(addAppointment(appt));
    
  });
  if (onCreate) {
    
    onCreate(createdAppointments[0]);
  }
} else {
  
  const appt = {
    id: `${Date.now()}_${therapyObj?.id}`,
    clientId: patientObj?.id || '',
    clientName: patientObj?.name || '',
    therapistIds: selectedTherapists,
    therapistNames: selectedTherapists.map(tid => {
      const th = MOCK_THERAPISTS.find(t => t.id === tid);
      return th ? th.name : '';
    }),
    treatmentId: therapyObj?.id,
    treatmentName: therapyObj?.name,
    duration: sessionDuration,
    roomNumber: selectedRoom || '',
    date: startDate,
    time: timeSlot,
    status: 'scheduled' as 'scheduled',
    notes,
    tab: 'Therapy' as 'Therapy',
  };
  
  dispatch(addAppointment(appt));
  
  if (onCreate) {
    
    onCreate(appt);
  }
}
    
    onClose();
  };
  // Patient
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientGender, setPatientGender] = useState<'male' | 'female' | null>(null);
  const [patientInputFocused, setPatientInputFocused] = useState(false);

  // Therapy
  const [therapySearch, setTherapySearch] = useState('');
  const [selectedTherapy, setSelectedTherapy] = useState<string | null>(null);
  const [therapyInputFocused, setTherapyInputFocused] = useState(false);

  // Therapists
  const [selectedTherapists, setSelectedTherapists] = useState<string[]>([]);
  const [therapistSearch, setTherapistSearch] = useState('');
  const [showAllTherapists, setShowAllTherapists] = useState(false);
  const [therapistInputFocused, setTherapistInputFocused] = useState(false);

  // Date & Time
  const [startDate, setStartDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Duration
  const [duration, setDuration] = useState<number | null>(7);
  const [customDuration, setCustomDuration] = useState('');
  const [customMode, setCustomMode] = useState(false);

  // Room
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Notes
  const [notes, setNotes] = useState('');

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
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Patient Search */}
      <Text style={styles.label}>Patient</Text>
      <View style={{ position: 'relative', marginBottom: 8 }}>
        <TextInput
          style={styles.input}
          placeholder="Search or select patient..."
          value={selectedPatient && !patientInputFocused ? (MOCK_PATIENTS.find(p => p.id === selectedPatient)?.name || '') : patientSearch}
          onFocus={() => {
            setPatientInputFocused(true);
            setPatientSearch('');
            setSelectedPatient(null);
          }}
          onBlur={() => {
            setPatientInputFocused(false);
            setTouched(t => ({ ...t, patient: true }));
          }}
          onChangeText={(text: string) => {
            setPatientSearch(text);
          }}
          editable={!selectedPatient}
        />
      </View>
      {patientSearch.length > 0 && !selectedPatient && (
        <View style={styles.dropdownList}>
          {filteredPatients.map(p => (
            <TouchableOpacity
              key={p.id}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedPatient(p.id);
                setPatientSearch(p.name);
                setPatientGender(p.gender as 'male' | 'female');
                setPatientInputFocused(false);
              }}
            >
              <Text style={{ color: selectedPatient === p.id ? '#1a73e8' : '#222' }}>{p.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {!selectedPatient && (touched.patient || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a patient.</Text>
      )}

      {/* Therapy Section */}
      <Text style={styles.label}>Therapy Name</Text>
      <View style={{ position: 'relative', marginBottom: 8 }}>
        <TextInput
          style={styles.input}
          placeholder="Search or select therapy..."
          value={selectedTherapy && !therapyInputFocused ? (MOCK_THERAPIES.find(t => t.id === selectedTherapy)?.name || '') : therapySearch}
          onFocus={() => {
            setTherapyInputFocused(true);
            setTherapySearch('');
            setSelectedTherapy(null);
          }}
          onBlur={() => {
            setTherapyInputFocused(false);
            setTouched(t => ({ ...t, therapy: true }));
          }}
          onChangeText={(text: string) => {
            setTherapySearch(text);
          }}
          editable={!selectedTherapy}
        />
        {therapySearch.length >= 2 && !selectedTherapy && (
          <View style={styles.dropdownList}>
            {filteredTherapies.length === 0 ? (
              <Text style={{ padding: 12, color: '#888' }}>No therapies found</Text>
            ) : (
              filteredTherapies.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedTherapy(t.id);
                    setTherapySearch(t.name);
                    setTherapyInputFocused(false);
                    setTouched(touch => ({ ...touch, therapy: true }));
                  }}
                >
                  <Text style={{ color: selectedTherapy === t.id ? '#1a73e8' : '#222' }}>{t.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        <View style={styles.quickPicksRow}>
          {frequentTherapies.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.quickPickBox, selectedTherapy === t.id && styles.quickPickBoxActive]}
              onPress={() => {
                setSelectedTherapy(t.id);
                setTherapySearch(t.name);
                setTherapyInputFocused(false);
                setTouched(touch => ({ ...touch, therapy: true }));
              }}
            >
              <Text style={{ color: selectedTherapy === t.id ? '#fff' : '#222' }}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Picker */}
        <GenericDatePicker
          label="Start Date"
          value={startDate}
          onChange={val => { setStartDate(val); setTouched(t => ({ ...t, date: true })); }}
          inputStyle={{ fontVariant: ['tabular-nums'], fontFamily: 'monospace' }}
          style={{ marginBottom: 8 }}
        />

        {/* Time Picker */}
        <GenericTimePicker
          label="Start Time"
          value={timeSlot}
          onChange={val => { setTimeSlot(val); setTouched(t => ({ ...t, time: true })); }}
          style={{ marginBottom: 8 }}
        />

        {/* Duration Picker */}
        <Text style={styles.label}>Duration (minutes)</Text>
        <View style={styles.durationRow}>
          {DURATION_PRESETS.map(preset => (
            <TouchableOpacity
              key={preset}
              style={[styles.durationBox, duration === preset && !customMode && styles.durationBoxActive]}
              onPress={() => { setDuration(preset); setCustomMode(false); setTouched(t => ({ ...t, duration: true })); }}
            >
              <Text style={{ color: duration === preset && !customMode ? '#fff' : '#222' }}>{preset}</Text>
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
              placeholder="min"
              keyboardType="numeric"
              value={customDuration}
              onChangeText={val => { setCustomDuration(val); setTouched(t => ({ ...t, duration: true })); }}
            />
          )}
        </View>

      </View>

      {/* Validation: Patient */}
      {!selectedPatient && (touched.patient || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a patient.</Text>
      )}
      {/* Validation: Therapy */}
      {!selectedTherapy && (touched.therapy || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a therapy.</Text>
      )}
      {/* Validation: Therapists */}
      {selectedTherapists.length === 0 && (touched.therapists || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select at least one therapist.</Text>
      )}
      {/* Validation: Date */}
      {!startDate && (touched.date || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a date.</Text>
      )}
      {/* Validation: Time */}
      {!timeSlot && (touched.time || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select a time slot.</Text>
      )}
      {/* Validation: Duration */}
      {((!duration && !customMode) || (customMode && (!customDuration || Number(customDuration) <= 0))) && (touched.duration || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please enter a valid duration.</Text>
      )}

      {/* Therapist Section */}
      <Text style={styles.label}>Therapists</Text>
      <View style={{ position: 'relative', marginBottom: 8 }}>
        <TextInput
          style={styles.input}
          placeholder="Search or select therapist..."
          value={
            therapistInputFocused && therapistSearch.length > 0
              ? therapistSearch
              : selectedTherapists
                  .map(id => {
                    const t = MOCK_THERAPISTS.find(th => th.id === id);
                    return t ? t.name : '';
                  })
                  .filter(Boolean)
                  .join(', ')
          }
          onFocus={() => setTherapistInputFocused(true)}
          onBlur={() => setTimeout(() => setTherapistInputFocused(false), 100)}
          onChangeText={text => {
            setTherapistSearch(text);
            // If user clears the search bar, also clear selected therapists
            if (text === '') setSelectedTherapists([]);
          }}
          editable={true}
        />
        <View style={styles.quickPicksRow}>
          {filteredTherapists.slice(0, 5).map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.quickPickBox, selectedTherapists.includes(t.id) && styles.quickPickBoxActive]}
              onPress={() => { toggleTherapist(t.id); setTouched(touch => ({ ...touch, therapists: true })); setTherapistInputFocused(false); }}
            >
              <Text style={{ color: selectedTherapists.includes(t.id) ? '#fff' : '#222' }}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {patientGender && (
          <TouchableOpacity onPress={() => setShowAllTherapists(s => !s)}>
            <Text style={styles.genderFilterToggle}>{showAllTherapists ? 'Filter by gender' : 'Show all'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {therapistInputFocused && (
        <View style={styles.therapistList}>
          {filteredTherapists.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.therapistItem, selectedTherapists.includes(t.id) && styles.therapistItemActive]}
              onPress={() => { toggleTherapist(t.id); setTouched(touch => ({ ...touch, therapists: true })); setTherapistInputFocused(false); }}
            >
              <Text style={{ color: selectedTherapists.includes(t.id) ? '#fff' : '#222', fontWeight: '600' }}>{t.name}</Text>
              <Text style={styles.therapistAvailability}>
                Available: {Object.keys(t.availability).slice(0, 2).map(day => `${day} (${(t.availability as Record<string, string[]>)[day]?.join(', ') || ''})`).join('; ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {selectedTherapists.length === 0 && (touched.therapists || submitAttempted) && (
        <Text style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>Please select at least one therapist.</Text>
      )}

      {/* Room (Optional) */}
      <Text style={styles.label}>Room (Optional)</Text>
      <View style={styles.roomList}>
        {MOCK_ROOMS.map(r => (
          <TouchableOpacity
            key={r.id}
            style={[styles.roomBox, selectedRoom === r.id && styles.roomBoxActive]}
            onPress={() => setSelectedRoom(r.id)}
          >
            <Text style={{ color: selectedRoom === r.id ? '#fff' : '#222' }}>{r.name}</Text>
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
        <TouchableOpacity style={styles.startBtn} onPress={handleStartTherapy}>
          <Text style={styles.startBtnText}>Start Therapy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default TherapyAppointments;
