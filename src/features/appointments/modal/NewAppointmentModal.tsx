// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (index.tsx).
// This is a strict project rule for appointments.
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
  initialClientId?: string;
  initialClientName?: string;
  initialClientPhone?: string;
  autoOpenDrawer?: boolean;
  newAppointment?: boolean; // signals intent to clear/reset state for new appointment
  initialSlotStart?: string;
  initialSlotEnd?: string;
  initialRoomId?: string;
  initialDate?: string;
  tab?: string;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps & { tab?: 'Doctor' | 'Therapy' }> = ({
  tab = 'Doctor',
  ...props
}) => {
  // If you want to allow switching tabs inside the modal:
  const [currentTab, setCurrentTab] = React.useState<'Doctor' | 'Therapy'>(tab);

  // Only update currentTab if the tab prop changes (e.g., due to route change)
  React.useEffect(() => {
    setCurrentTab(tab);
  }, [tab]);

  // Unified onCreate handler for both Doctor and Therapy
  const handleCreate = (appointmentOrArr: any) => {
    // Only call onCreate, do not dispatch here
    if (props.onCreate) props.onCreate(appointmentOrArr);
    // Show a toast/snackbar or alert for confirmation
    if (typeof window !== 'undefined' && window?.navigator?.product === 'ReactNative') {
      // For Android native
      try {
        const { ToastAndroid } = require('react-native');
        ToastAndroid.show('Appointment created successfully!', ToastAndroid.SHORT);
      } catch (e) {
        // fallback
        alert('Appointment created successfully!');
      }
    } else {
      // fallback for web or other
      alert('Appointment created successfully!');
    }
    if (props.onClose) props.onClose();
  };

  // Filter appointments by tab
  const doctorAppointments = (props.appointments ?? []).filter((app: any) => app.tab === 'Doctor');
  const therapyAppointments = (props.appointments ?? []).filter((app: any) => app.tab === 'Therapy');

  // Minimal styles (expand as needed)
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
    modal: { backgroundColor: '#fff', width: '94%', borderRadius: 18, padding: 18, flex: 1 },
    title: { fontSize: 23, fontWeight: '700', marginBottom: 4 },
    tabs: { flexDirection: 'row', marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: '#f1f2f6', alignItems: 'center', marginHorizontal: 3 },
    tabActive: { backgroundColor: '#1a2233' },
    tabLabel: { fontSize: 17, color: '#1a2233', fontWeight: '600' },
    tabLabelActive: { color: '#fff' },
  });

  return (
    <Modal visible={props.visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <Text style={styles.title}>New Appointment</Text>
              <TouchableOpacity onPress={props.onClose} accessibilityLabel="close-modal"><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
            </View>
            {/* Tabs */}
            <View style={styles.tabs}>
              <TouchableOpacity style={[styles.tab, currentTab === 'Doctor' && styles.tabActive]} onPress={() => setCurrentTab('Doctor')}>
                <Text style={[styles.tabLabel, currentTab === 'Doctor' && styles.tabLabelActive]}>Doctor</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.tab, currentTab === 'Therapy' && styles.tabActive]} onPress={() => setCurrentTab('Therapy')}>
                <Text style={[styles.tabLabel, currentTab === 'Therapy' && styles.tabLabelActive]}>Therapy</Text>
              </TouchableOpacity>
            </View>

            {currentTab === 'Doctor' ? (
              <DoctorAppointments
                clients={props.clients}
                onClose={props.onClose}
                onCreate={handleCreate}
                therapists={props.therapists}
                appointments={doctorAppointments}
                newAppointment={props.newAppointment}
              />
            ) : (
              <TherapyAppointments
                visible={props.visible}
                onClose={props.onClose}
                onCreate={handleCreate}
                clients={props.clients ?? []}
                therapists={props.therapists ?? []}
                rooms={props.rooms ?? []}
                clinicTimings={props.clinicTimings ?? {}}
                appointments={therapyAppointments}
                therapies={props.therapies ?? []}
                enforceGenderMatch={props.enforceGenderMatch}
                autoOpenDrawer={props.autoOpenDrawer}
                newAppointment={props.newAppointment}
                initialClientId={props.initialClientId}
                initialClientName={props.initialClientName}
                initialClientPhone={props.initialClientPhone}
                initialSlotStart={props.initialSlotStart}
                initialSlotEnd={props.initialSlotEnd}
                initialRoomId={props.initialRoomId}
                initialDate={props.initialDate}
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
