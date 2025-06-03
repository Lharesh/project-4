import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { THERAPISTS, ROOMS } from '../mock/scheduleMatrixMock';
import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';
import { useDispatch, useSelector } from 'react-redux';
import { selectDoctors, selectDoctorAvailability, selectAppointments, selectClients } from '../selectors';
import styles from './DoctorAppointments.styles';
import { CountryCodePicker } from '../../clients/components/CountryCodePicker';
import { Picker as CustomPicker } from '../../../components/ui/Picker';
import { Client } from '@/features/clients/clientsSlice';



import type { StaffMember } from '../../../../app/(admin)/clinics/setup/setupSlice';

interface DoctorAppointmentsProps {
  initialClientId?: string;
  initialClientName?: string;
  initialClientPhone?: string;
  onSlotCreate?: () => void;
  onCancel?: (appointment: any) => void;
  onReschedule?: (appointment: any, newAppointment: any) => void;
  onComplete?: (appointment: any) => void;
  clients: Client[];
  onClose: () => void;
  onCreate: (appointment: any) => void;
  appointments: any[];
  therapists: StaffMember[];
  therapies?: any[];
  newAppointment?: boolean; // signals intent to clear/reset state for new appointment
}

import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';

const DoctorAppointments: React.FC<DoctorAppointmentsProps> = ({
  onCancel, onReschedule, onComplete, clients, appointments, onClose, onCreate, therapists, therapies,
  initialClientId, initialClientName, initialClientPhone, newAppointment
}) => {
  const router = useRouter();
  // Patient selection state
  const [selectedClient, setSelectedClient] = React.useState<{ id?: string; name?: string; phone?: string }>({
    id: initialClientId,
    name: initialClientName,
    phone: initialClientPhone,
  });

  // Reset local state if newAppointment is triggered
  React.useEffect(() => {
    if (newAppointment) {
      setSelectedClient({ id: initialClientId, name: initialClientName, phone: initialClientPhone });
      setDate('');
      setTime('09:00 AM');
      setConsultation([]);
      setMode('Walk-in');
      setNotes('');
      setClientMobile('');
      setClientMobileCode('+91');
      setClientMobileTouched(false);
      setClientTouched(false);
      setDateTouched(false);
      setTimeTouched(false);
      setDoctor(therapists.length > 0 ? therapists[0].id : '');
      setSubmitAttempted(false);
      setError(null);
    }
  }, [newAppointment, initialClientId, initialClientName, initialClientPhone, therapists]);

  React.useEffect(() => {
    if (initialClientId || initialClientName || initialClientPhone) {
      setSelectedClient({
        id: initialClientId,
        name: initialClientName,
        phone: initialClientPhone,
      });
    }
  }, [initialClientId, initialClientName, initialClientPhone]);

  // Debug print: log the full Redux state
  // eslint-disable-next-line no-console
  //console.log('DEBUG Redux state:', useSelector((s) => s));
  // State for submit attempt
  const [submitAttempted, setSubmitAttempted] = useState(false);
  // Fetch doctors, doctor availability, and clients from Redux
  const doctors = useSelector(selectDoctors);
  const doctorAvailability = useSelector(selectDoctorAvailability);
  const clientsList = useSelector(selectClients);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const [doctor, setDoctor] = useState(doctors.length > 0 ? doctors[0].id : '');
  const [clientMobile, setClientMobile] = useState('');
  const [clientMobileCode, setClientMobileCode] = useState('+91');
  const [clientMobileTouched, setClientMobileTouched] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM');
  const [consultation, setConsultation] = useState<string[]>([]);
  const [mode, setMode] = useState<'Online' | 'Walk-in'>('Walk-in');
  const [notes, setNotes] = useState('');
  const [clientTouched, setClientTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);

  const CONSULT_TYPES = ['New', 'Follow-up'];
  const MODE_OPTIONS = ['Walk-in', 'Online'];

  const toggleConsultation = (type: string) => {
    setConsultation(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const handleCreate = () => {
    setSubmitAttempted(true);
    setError(null);
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
    // Doctor appointment booking check using new helper
    const { checkDoctorBooking } = require('../helpers/doctorBookingUtils');
    const bookingResult = checkDoctorBooking({
      doctorId: doctor,
      date,
      slot: time,
      appointments,
      patientId: selectedClient,
      doctorAvailability,
      now: new Date(),
    });
    if (!bookingResult.available) {
      setError(bookingResult.reason || 'Slot unavailable.');
      // Optionally, show alternatives to the user
      // bookingResult.alternatives contains up to 5 next available slots
      return;
    }
    // Find client and doctor objects
    const patientObj = clients.find((p: Client) => p.id === selectedClient);
    const doctorObj = doctors.find((d: any) => d.id === doctor);
    // Use consultation or default
    const consultationArr = consultation.length > 0 ? consultation : ['Consultation'];
    const consultationId = consultationArr[0]?.toLowerCase().replace(/\s+/g, '-') || 'consultation';
    const consultationName = consultationArr[0] || 'Consultation';
    const duration = 15;
    onCreate({
      id: `${patientObj?.id || selectedClient}_${doctorObj?.id || ''}_${format(new Date(date), 'yyyy-MM-dd')}_${time}`,
      clientId: patientObj?.id || selectedClient,
      clientName: patientObj?.name || '',
      clientMobile: patientObj?.mobile || clientMobile,
      doctorId: doctorObj?.id || '',
      doctorName: doctorObj?.name || '',
      treatmentId: 'treatment1',
      treatmentName: consultationName,
      consultationId,
      consultationName,
      duration,

      date: format(new Date(date), 'yyyy-MM-dd'),
      time,
      mode, // Added mode field
      status: 'scheduled',
      notes,
      tab: 'Doctor',
    });
    onClose();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {error && (
        <View style={{ backgroundColor: '#ffe0e0', borderRadius: 10, padding: 12, marginBottom: 14, alignItems: 'center' }}>
          {/* eslint-disable-next-line no-console */}
          {(() => { console.log('DEBUG render error:', error); return null; })()}
          <Text testID="error-message" style={{ color: '#d32f2f', fontWeight: '700', fontSize: 16 }}>{error}</Text>
        </View>
      )}
      <View style={{ marginBottom: 8 }}>
        <CustomPicker
          label="Doctor"
          items={doctors.length > 0 ? doctors.map((d: any) => ({ label: d.name, value: d.id })) : [{ label: 'No doctors available', value: '' }]}
          selectedValue={doctor}
          onValueChange={doctors.length > 0 ? setDoctor : () => { }}
        >
        </CustomPicker>
      </View>
      <Text style={styles.label}>Patient</Text>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafbfc', marginBottom: 8, paddingHorizontal: 10 }}
        onPress={() => router.push({ pathname: '/clients', params: { select: 1 } })}
        testID="patient-picker"
      >
        {selectedClient?.name ? (
          <Text style={[styles.input, { flex: 1 }]}>{selectedClient.name}</Text>
        ) : (
          <Text style={[styles.input, { color: '#888', flex: 1 }]}>Select Patient</Text>
        )}
        <MaterialIcons name="add" size={22} color="#1a73e8" style={{ marginLeft: 6 }} />
      </TouchableOpacity>
      {(submitAttempted && !selectedClient) && (
        <Text style={styles.errorText}>Please select a patient</Text>
      )}

      <Text style={styles.label}>Client Mobile</Text>
      <View style={styles.mobileRow}>
        <View style={styles.codePickerWrapper}>
          <CountryCodePicker
            value={clientMobileCode}
            onChange={setClientMobileCode}
          />
        </View>
        <TextInput
          style={[styles.input, { flex: 1, height: 44, marginBottom: 0 }]}
          placeholder="Mobile"
          value={clientMobile}
          onChangeText={setClientMobile}
          keyboardType="numeric"
          maxLength={10}
          onBlur={() => setClientMobileTouched(true)}
          testID="mobile-input"
        />
      </View>
      {clientMobileTouched && !/^\d{10,}$/.test(clientMobile) && (
        <Text style={styles.errorText}>Enter valid 10-digit mobile</Text>
      )}

      <GenericDatePicker
        label="Date"
        value={date}
        onChange={val => setDate(val)}
        inputStyle={{ fontVariant: ['tabular-nums'], fontFamily: 'monospace' }}
        style={{ marginBottom: 8 }}
        testID="date-picker"
      />
      {dateTouched && !date && (
        <Text style={{ color: 'red', marginBottom: 6 }}>Select a date</Text>
      )}

      <GenericTimePicker
        label="Start Time"
        value={time}
        onChange={val => { setTime(val); setTimeTouched(true); }}
        style={{ marginBottom: 8 }}
        testID="time-picker"
      />
      {timeTouched && !time && (
        <Text style={{ color: 'red', marginBottom: 6 }}>Select a time</Text>
      )}

      <Text style={styles.label}>Consultation Type</Text>
      <View style={styles.consultationRow}>
        {CONSULT_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.checkbox, consultation.includes(type) && styles.checkboxActive]}
            onPress={() => toggleConsultation(type)}
          >
            <Text style={{ color: consultation.includes(type) ? '#fff' : '#1a73e8', fontSize: 15, fontWeight: '600' }}>{type}</Text>
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


      {/* Show doctor error only after submit is attempted */}
      {submitAttempted && doctors.length === 0 && (
        <Text style={{ color: 'red', marginBottom: 8 }}>
          No doctors available. Please add doctors in staff management.
        </Text>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="create-appointment-btn"
          style={[styles.startBtn, doctors.length === 0 && { opacity: 0.5 }]}
          onPress={handleCreate}
          disabled={doctors.length === 0}
        >
          <Text style={styles.startBtnText}>Create Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default DoctorAppointments;