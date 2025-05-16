import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import DoctorAppointments from './DoctorAppointments';
import TherapyAppointments from './TherapyAppointments';

// Mock Data
const DOCTORS = [
  { id: '1', name: 'Dr. Sharma (Ayurvedic Physician)' },
  { id: '2', name: 'Dr. Gupta (Therapist)' },
];
export interface Client {
  id: string;
  name: string;
  mobile: string; // primary phone number, required
}

export const CLIENTS: Client[] = [
  { id: 'c1', name: 'Amit Kumar', mobile: '9876543210' },
  { id: 'c2', name: 'Sunita Singh', mobile: '9123456780' },
  { id: 'c3', name: 'Ravi Patel', mobile: '9988776655' },
];
const NON_WORKING_DAYS = [0, 6]; // Sunday, Saturday
const MOCK_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM'];
const CONSULT_TYPES = ['Initial', 'Follow Up', 'Online', 'Walk-in'];

interface NewAppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (appointment: any) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ visible, onClose, onCreate }) => {
  const [tab, setTab] = useState<'Doctor' | 'Therapy'>('Doctor');
  const [doctor, setDoctor] = useState(DOCTORS[0].id);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientMobile, setClientMobile] = useState('');
  const [clientMobileTouched, setClientMobileTouched] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState(MOCK_TIMES[0]);
  const [consultation, setConsultation] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const filteredClients = CLIENTS.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));

  const toggleConsultation = (type: string) => {
    setConsultation(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const isNonWorkingDay = (d: string) => {
    // Mock: treat Saturday and Sunday as non-working
    const day = new Date(d).getDay();
    return NON_WORKING_DAYS.includes(day);
  };

  const [clientTouched, setClientTouched] = useState(false);
  const [dateTouched, setDateTouched] = useState(false);
  const [timeTouched, setTimeTouched] = useState(false);

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
    let therapistIds: string[] = [];
    let therapistNames: string[] = [];
    if (tab === 'Therapy') {
      // For demo, select first 2 therapists (mock, since therapist selection UI is not present)
      therapistIds = ['therapist1', 'therapist2'];
      therapistNames = ['Dr. Gupta', 'Dr. Patel'];
    }
    onCreate({
      id: Date.now().toString(),
      clientId: clientObj?.id || selectedClient,
      clientName: clientObj?.name || '',
      clientMobile: clientMobile,
      doctorId: doctorObj?.id || '',
      doctorName: doctorObj?.name || '',
      therapistIds,
      therapistNames,
      treatmentId: 'treatment1',
      treatmentName: consultationName,
      consultationId,
      consultationName,
      duration,
      roomNumber,
      date,
      time,
      status: 'pending',
      notes,
      tab,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Text style={styles.title}>New Appointment</Text>
              <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
            </View>
            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, tab === 'Doctor' && styles.tabActive]} onPress={() => setTab('Doctor')}>
                <Text style={[styles.tabLabel, tab === 'Doctor' && styles.tabLabelActive]}>Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, tab === 'Therapy' && styles.tabActive]} onPress={() => setTab('Therapy')}>
                <Text style={[styles.tabLabel, tab === 'Therapy' && styles.tabLabelActive]}>Therapy</Text>
              </TouchableOpacity>
            </View>
            {tab === 'Doctor' ? (
  <DoctorAppointments onClose={onClose} onCreate={onCreate} />
) : (
  <TherapyAppointments onClose={onClose} onCreate={onCreate} />
)}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: '#fff', width: '94%', borderRadius: 18, padding: 18, flex: 1 },
  title: { fontSize: 23, fontWeight: '700', marginBottom: 4 },
  tabs: { flexDirection: 'row', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: '#f1f2f6', alignItems: 'center', marginHorizontal: 3 },
  tabActive: { backgroundColor: '#1a2233' },
  tabLabel: { fontSize: 17, color: '#1a2233', fontWeight: '600' },
  tabLabelActive: { color: '#fff' },
  label: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 6, marginTop: 10 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafbfc', marginBottom: 8 },
  picker: { height: 44, width: '100%' },
  inputWrapper: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fafbfc', marginBottom: 8 },
  input: { height: 44, paddingHorizontal: 10, fontSize: 16, color: '#222', backgroundColor: 'transparent' },
  clientItem: { padding: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  checkbox: { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#1a73e8', backgroundColor: '#fff', marginRight: 8, marginBottom: 8 },
  checkboxActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
  createBtn: { backgroundColor: '#1a2233', borderRadius: 12, marginTop: 18, paddingVertical: 16, alignItems: 'center' },
  createBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
