import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { CLIENTS } from './NewAppointmentModal';
import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';
import { useDispatch } from 'react-redux';
import styles from './DoctorAppointments.styles';

const DOCTORS = [
  { id: '1', name: 'Dr. Sharma (Ayurvedic Physician)' },
  { id: '2', name: 'Dr. Gupta (Therapist)' },
];

interface DoctorAppointmentsProps {
  onClose: () => void;
  onCreate: (appointment: any) => void;
}

interface DoctorAppointmentsProps {
  onClose: () => void;
  onCreate: (appointment: any) => void;
}

const DoctorAppointments: React.FC<DoctorAppointmentsProps> = ({ onClose, onCreate }) => {
  const dispatch = useDispatch();
  const [doctor, setDoctor] = useState(DOCTORS[0].id);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientMobile, setClientMobile] = useState('');
  const [clientMobileTouched, setClientMobileTouched] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [consultation, setConsultation] = useState<string[]>([]);
  const [mode, setMode] = useState<'Online' | 'Walk-in'>('Online');
  const [notes, setNotes] = useState('');
  const [clientTouched, setClientTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);

  const CONSULT_TYPES = ['New Consultation', 'Follow Up Consultation'];
  const MODE_OPTIONS = ['Online', 'Walk-in'];

  const filteredClients = CLIENTS.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const toggleConsultation = (type: string) => {
    setConsultation(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleCreate = () => {
    let valid = true;
    if (!selectedClient) {
      setClientTouched(true);
      valid = false;
    }
    if (!date) {
      setDateTouched(true);
      valid = false;
    }
    if (!time) {
      setTimeTouched(true);
      valid = false;
    }
    if (!/^\d{10,}$/.test(clientMobile)) {
      setClientMobileTouched(true);
      valid = false;
    }
    if (!valid) return;
    // Find client and doctor objects
    const clientObj = CLIENTS.find(c => c.id === selectedClient);
    const doctorObj = DOCTORS.find(d => d.id === doctor);
    // Use consultation or default
    const consultationArr = consultation.length > 0 ? consultation : ['Consultation'];
    const consultationId = consultationArr[0]?.toLowerCase().replace(/\s+/g, '-') || 'consultation';
    const consultationName = consultationArr[0] || 'Consultation';
    const duration = 15;
    const roomNumber = '101'; // Can be randomized or set
    onCreate({
      id: Date.now().toString(),
      clientId: clientObj?.id || selectedClient,
      clientName: clientObj?.name || '',
      clientMobile: clientMobile,
      doctorId: doctorObj?.id || '',
      doctorName: doctorObj?.name || '',
      treatmentId: 'treatment1',
      treatmentName: consultationName,
      consultationId,
      consultationName,
      duration,
      roomNumber,
      date,
      time,
      mode, // Added mode field
      status: 'pending',
      notes,
      tab: 'Doctor',
    });
    onClose();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Select Doctor</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={doctor}
          onValueChange={setDoctor}
          style={styles.picker}
        >
          {DOCTORS.map(d => (
            <Picker.Item key={d.id} label={d.name} value={d.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Client</Text>
      <TextInput
        style={[styles.input, { marginBottom: 6 }]}
        placeholder="Search client by name"
        value={clientSearch}
        onChangeText={setClientSearch}
        editable={!selectedClient}
      />
      {clientSearch.length > 0 && !selectedClient && (
        <View style={styles.dropdownList}>
          {filteredClients.map(c => (
            <TouchableOpacity
              key={c.id}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedClient(c.id);
                setClientSearch(c.name);
                setClientMobile(c.mobile);
              }}
            >
              <Text style={{ color: selectedClient === c.id ? '#1a73e8' : '#222' }}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!selectedClient && (clientTouched) && (
        <Text style={{ color: 'red', marginBottom: 6 }}>Please select a client</Text>
      )}

      <Text style={styles.label}>Client Mobile</Text>
      <TextInput
        style={[styles.input, { marginBottom: 6 }]}
        placeholder="Enter mobile number"
        value={clientMobile}
        onChangeText={setClientMobile}
        keyboardType="phone-pad"
        maxLength={10}
        onBlur={() => setClientMobileTouched(true)}
      />
      {clientMobileTouched && !/^\d{10,}$/.test(clientMobile) && (
        <Text style={{ color: 'red', marginBottom: 6 }}>Enter valid 10-digit mobile</Text>
      )}

      <GenericDatePicker
        label="Date"
        value={date}
        onChange={val => setDate(val)}
        inputStyle={{ fontVariant: ['tabular-nums'], fontFamily: 'monospace' }}
        style={{ marginBottom: 8 }}
      />
      {dateTouched && !date && (
        <Text style={{ color: 'red', marginBottom: 6 }}>Select a date</Text>
      )}

      <GenericTimePicker
  label="Start Time"
  value={time}
  onChange={val => { setTime(val); setTimeTouched(true); }}
  style={{ marginBottom: 8 }}
/>
      {timeTouched && !time && (
        <Text style={{ color: 'red', marginBottom: 6 }}>Select a time</Text>
      )}

      <Text style={styles.label}>Consultation Type</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {CONSULT_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.checkbox, consultation.includes(type) && styles.checkboxActive]}
            onPress={() => toggleConsultation(type)}
          >
            <Text style={{ color: consultation.includes(type) ? '#fff' : '#1a73e8' }}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Mode</Text>
      <View style={{ flexDirection: 'row', marginBottom: 8 }}>
        {MODE_OPTIONS.map(modeOpt => (
          <TouchableOpacity
            key={modeOpt}
            style={[styles.checkbox, mode === modeOpt && styles.checkboxActive]}
            onPress={() => setMode(modeOpt as 'Online' | 'Walk-in')}
          >
            <Text style={{ color: mode === modeOpt ? '#fff' : '#1a73e8' }}>{modeOpt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { minHeight: 44, maxHeight: 100 }]}
        placeholder="Add notes (optional)"
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      <View style={{ flexDirection: 'row', marginTop: 18, gap: 12 }}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.startBtn} onPress={handleCreate}>
          <Text style={styles.startBtnText}>Create Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DoctorAppointments;
