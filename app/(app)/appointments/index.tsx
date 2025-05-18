import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Plus, Phone, Mail } from 'lucide-react-native';
import { Linking } from 'react-native';
import Card from '@/components/ui/Card';
import NewAppointmentModal from '../../schedule-appointments/modal/NewAppointmentModal';
import { COLORS } from '@/constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchAppointments, addAppointment } from '@/redux/slices/appointmentsSlice';
import type { Appointment } from '@/redux/slices/appointmentsSlice';
import AppointmentCard from './AppointmentCard';

type AppointmentStatus = 'completed' | 'cancelled' | 'pending';

function AppointmentsScreen() {
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const tab: 'Doctor' = 'Doctor'; // Show Doctor by default

  const { appointments, isLoading, error } = useSelector((state: RootState) => state.appointments);
  const selectedKey = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    dispatch(fetchAppointments({ tab, date: selectedKey }) as any);
  }, [dispatch, tab, selectedKey]);

  // Status counts
  const getStatusCounts = () => {
    const counts = { completed: 0, cancelled: 0, pending: 0 };
    appointments.forEach((a) => {
      if (a.status === 'scheduled') {
        counts.pending++;
      } else if (a.status === 'completed') {
        counts.completed++;
      } else if (a.status === 'cancelled') {
        counts.cancelled++;
      }
    });
    return counts;
  };
  const { completed, cancelled, pending } = getStatusCounts();

  const handlePreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handlePreviousDay} style={styles.dateNavButton}>
          <ChevronLeft size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        <View style={styles.dateBlock}>
          <Text style={styles.dateText}>{format(selectedDate, 'EEEE')}</Text>
          <Text style={styles.dateSubtext}>{format(selectedDate, 'MMMM d, yyyy')}</Text>
        </View>
        <TouchableOpacity onPress={handleNextDay} style={styles.dateNavButton}>
          <ChevronRight size={24} color={COLORS.neutral[600]} />
        </TouchableOpacity>
        <View style={styles.statusCounts}>
          <Text style={[styles.statusBadge, { backgroundColor: COLORS.kapha[100], color: COLORS.kapha[700] }]}>#{completed}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: COLORS.pitta[100], color: COLORS.pitta[700] }]}>#{cancelled}</Text>
          <Text style={[styles.statusBadge, { backgroundColor: COLORS.vata[100], color: COLORS.vata[700] }]}>#{pending}</Text>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.vata[500]} style={{ marginTop: 40 }} />
      ) : error ? (
        <Text style={{ color: 'red', padding: 16 }}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {appointments
            .filter((appointment: Appointment) => appointment.date === selectedKey)
            .map((appointment: Appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
      <NewAppointmentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreate={(appointment: any) => {
          if (appointment.tab === 'Doctor') {
            dispatch(addAppointment({ ...appointment, tab: 'Doctor', status: 'pending' }) as any);
          }
          // For Therapy, dispatch is already handled in TherapyAppointments
          setShowModal(false);
        }}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timeDoctorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  doctorName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.vata[700],
    marginLeft: 8,
  },
  statusTherapistBlock: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  therapistNames: {
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 2,
    fontStyle: 'italic',
  },
  container: { flex: 1, backgroundColor: COLORS.neutral[50] },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  dateNavButton: { padding: 8 },
  dateBlock: { flex: 1, alignItems: 'center' },
  dateText: { fontSize: 18, fontWeight: '600', color: COLORS.neutral[900] },
  dateSubtext: { fontSize: 14, color: COLORS.neutral[600] },
  statusCounts: { flexDirection: 'row', gap: 8, marginLeft: 8 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    overflow: 'hidden',
  },
  scrollContainer: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBlock: { flexDirection: 'row', alignItems: 'center' },
  timeText: { marginLeft: 6, fontSize: 14, fontWeight: '500', color: COLORS.vata[600] },
  statusLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: '500',
    overflow: 'hidden',
  },
  clientName: { fontSize: 16, fontWeight: '600', color: COLORS.neutral[900] },
  treatmentName: { fontSize: 14, color: COLORS.neutral[600] },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.vata[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});
export default AppointmentsScreen;

export const options = {
  title: 'Appointments',
};