import React, { useState } from 'react';
import DoctorAppointmentsTab from '../components/DoctorAppointmentsTab';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectDoctors } from '../selectors';
import { selectClinicTimings, cancelAndShiftSeries, completeAppointment } from '../appointmentsSlice';
import { View, Text, TouchableOpacity, Platform, Alert, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, addDays, subDays } from 'date-fns';
import { useRouter } from 'expo-router';

// Add prop type for onSlotSelect
interface DoctorAppointmentsProps {
  onSlotSelect?: (doctor: any, slot: any, date: string) => void;
}

const DoctorAppointments: React.FC<DoctorAppointmentsProps> = ({ onSlotSelect }) => {
  const doctors = useAppSelector(selectDoctors);
  const appointments = useAppSelector(state => state.appointments.appointments);
  const clinicTimings = useAppSelector(selectClinicTimings);
  const dispatch = useAppDispatch();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedKey = selectedDate.toISOString().slice(0, 10);
  const router = useRouter();

  // Slot action handler (book, cancel, complete, no-showup)
  const handleSlotAction = (action: string, doctor: any, slot: any) => {
    if (action === 'select') {
      if (onSlotSelect) {
        onSlotSelect(doctor, slot, selectedKey);
      } else {
        router.push({
          pathname: '/clients',
          params: {
            doctorId: doctor.id,
            doctorName: doctor.name,
            slotTime: slot.time,
            date: selectedKey,
            tab: 'Doctor',
            select: 1,
          },
        });
      }
    } else if (action === 'cancel' || action === 'no-showup') {
      const confirmMsg = action === 'no-showup' ? 'Mark this slot as no-showup (will behave as cancel)?' : 'Cancel this appointment?';
      if (Platform.OS === 'web') {
        if (window.confirm(confirmMsg)) {
          (dispatch as any)(cancelAndShiftSeries({ appointmentId: slot.appointmentId }));
        }
      } else {
        Alert.alert('Confirm', confirmMsg, [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => (dispatch as any)(cancelAndShiftSeries({ appointmentId: slot.appointmentId })) },
        ]);
      }
    } else if (action === 'complete') {
      const confirmMsg = 'Mark this appointment as completed?';
      if (Platform.OS === 'web') {
        if (window.confirm(confirmMsg)) {
          (dispatch as any)(completeAppointment(slot.appointmentId));
        }
      } else {
        Alert.alert('Confirm', confirmMsg, [
          { text: 'No', style: 'cancel' },
          { text: 'Yes', onPress: () => (dispatch as any)(completeAppointment(slot.appointmentId)) },
        ]);
      }
    }
  };

  // Date navigation
  const handlePreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

  return (
    <View style={{ flex: 1 }}>
      {/* Date Bar */}
      <View style={styles.dateBarRow}>
        <TouchableOpacity onPress={handlePreviousDay} style={styles.dateNavButton}>
          <ChevronLeft size={26} color="#222" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.dateBarText}>{format(selectedDate, 'EEE, MMM dd')}</Text>
          <Text style={styles.dateBarSubtext}>{format(selectedDate, 'yyyy')}</Text>
        </View>
        <TouchableOpacity onPress={handleNextDay} style={styles.dateNavButton}>
          <ChevronRight size={26} color="#222" />
        </TouchableOpacity>
      </View>
      {/* Slot-based Doctor Appointments UI */}
      <DoctorAppointmentsTab
        doctors={doctors}
        appointments={appointments}
        clinicTimings={clinicTimings}
        onSlotAction={handleSlotAction}
        selectedDate={selectedKey}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  dateBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 36,
    zIndex: 2,
  },
  dateNavButton: {
    padding: 4,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 1.5,
  },
  dateBarText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#222',
  },
  dateBarSubtext: {
    fontSize: 9.75,
    color: '#888',
  },
});

export default DoctorAppointments;