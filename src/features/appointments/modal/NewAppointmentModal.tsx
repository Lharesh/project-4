import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import DoctorAppointments from './DoctorAppointments';
import TherapyAppointments from './TherapyAppointments';
import { Client } from '@/features/clients/clientsSlice';

interface NewAppointmentModalProps {
  visible: boolean;
  clients: Client[];
  therapists: any[];
  rooms: any[];
  clinicTimings: any;
  onClose: () => void;
  onCreate?: (appointmentOrArr: any) => void;
  appointments: any[];
  therapies?: any[];
  enforceGenderMatch: boolean;
}


const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ visible, clients, therapists, rooms, clinicTimings, onClose, onCreate, appointments, therapies, enforceGenderMatch }) => {

  // Unified onCreate handler for both Doctor and Therapy
  const handleCreate = (appointmentOrArr: any) => {
    // Only call onCreate, do not dispatch here
    if (onCreate) onCreate(appointmentOrArr);
    if (onClose) onClose();
  };

  const [tab, setTab] = useState<'Doctor' | 'Therapy'>('Doctor');



  // Filter appointments by tab
  const doctorAppointments = (appointments ?? []).filter(app => app.tab === 'Doctor');
  const therapyAppointments = (appointments ?? []).filter(app => app.tab === 'Therapy');

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Text style={styles.title}>New Appointment</Text>
              <TouchableOpacity onPress={onClose} accessibilityLabel="close-modal"><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
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


            {/* ... the appointments should only be passed to the component via props from Redux */}

            {tab === 'Doctor' ? (
              <DoctorAppointments
                clients={clients}
                onClose={onClose}
                onCreate={handleCreate}
                appointments={doctorAppointments}
              />
            ) : (
              <TherapyAppointments
                visible={visible}
                onClose={onClose}
                onCreate={handleCreate}
                clients={clients}
                therapists={therapists}
                rooms={rooms}
                clinicTimings={clinicTimings}
                appointments={therapyAppointments}
                therapies={therapies || []}
                enforceGenderMatch={enforceGenderMatch}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default NewAppointmentModal;

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
