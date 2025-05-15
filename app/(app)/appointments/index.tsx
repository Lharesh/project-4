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
import { NewAppointmentModal } from './modal/NewAppointmentModal';
import { COLORS } from '@/constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { fetchAppointments, addAppointment } from '@/redux/slices/appointmentsSlice';

const todayKey = format(new Date(), 'yyyy-MM-dd');
const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');

type AppointmentStatus = 'completed' | 'cancelled' | 'pending';
type Appointment = {
  id: string;
  time: string;
  date: string; // Added date property
  clientName: string;
  clientId?: string;
  clientMobile?: string;
  clientEmail?: string;
  treatmentName: string;
  status: AppointmentStatus;
};

const mockAppointmentsByDate: Record<string, Appointment[]> = {
  [todayKey]: [
    { id: 'a1', time: '09:00 AM', date: todayKey, clientName: 'Ravi Kumar', clientId: 'client1', clientMobile: '9876543210', clientEmail: 'ravi.kumar@email.com', treatmentName: 'Abhyanga', status: 'pending' },
    { id: 'a2', time: '10:30 AM', date: todayKey, clientName: 'Sunita Devi', clientId: 'client2', clientMobile: '9123456780', clientEmail: 'sunita.devi@email.com', treatmentName: 'Shirodhara', status: 'completed' },
  ],
  [tomorrowKey]: [
    { id: 'a3', time: '11:00 AM', date: tomorrowKey, clientName: 'Ajay Rao', clientId: 'client3', clientMobile: '9988776655', clientEmail: 'ajay.rao@email.com', treatmentName: 'Kati Basti', status: 'cancelled' },
    { id: 'a4', time: '04:00 PM', date: tomorrowKey, clientName: 'Neha Singh', clientId: 'client4', clientMobile: '9876512345', clientEmail: 'neha.singh@email.com', treatmentName: 'Nasya', status: 'completed' },
    { id: 'a5', time: '05:00 PM', date: tomorrowKey, clientName: 'Manoj Joshi', clientId: 'client5', clientMobile: '9001122334', clientEmail: 'manoj.joshi@email.com', treatmentName: 'Udvartana', status: 'pending' },
  ],
  [yesterdayKey]: [
    { id: 'a6', time: '08:30 AM', date: yesterdayKey, clientName: 'Deepa Iyer', clientId: 'client6', clientMobile: '9090909090', clientEmail: 'deepa.iyer@email.com', treatmentName: 'Vamana', status: 'completed' },
  ],
};

export default function AppointmentsScreen() {
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
          {appointments.filter(a => a.date === selectedKey).map((appointment) => (
            <Card key={appointment.id} style={[styles.card, {paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8}]}>
              {/* Card Header: Time (left) & Doctor/Status (right), Patient Name aligned with Status */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
                {/* Left column: Time (top), Patient Name (below) */}
                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <Clock size={16} color={COLORS.vata[600]} />
                     <Text style={[styles.timeText, { color: COLORS.vata[600], fontWeight: 'bold' }]}>{appointment.time}</Text>
                   </View>
                   <Text style={{ fontWeight: 'bold', fontSize: 15, color: COLORS.neutral[900], marginTop: 2, marginBottom: 0 }}>
                     {appointment.clientName} {appointment.clientId ? <Text style={{ color: COLORS.neutral[500], fontSize: 13 }}>({appointment.clientId})</Text> : null}
                   </Text>
                   <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 0, marginBottom: 0 }}>
                     {appointment.clientMobile ? (
  <TouchableOpacity onPress={() => Linking.openURL(`tel:${appointment.clientMobile}`)}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Phone size={13} color={COLORS.neutral[500]} style={{ marginRight: 4 }} />
      <Text style={{ fontSize: 13, color: COLORS.neutral[700], marginRight: 10 }}>{appointment.clientMobile}</Text>
    </View>
  </TouchableOpacity>
) : null}
                   </View>
                   <Text style={{ color: COLORS.vata[600], fontWeight: 'normal', fontSize: 13, marginTop: 0, marginBottom: 0 }}>{appointment.treatmentName}</Text>
                   {appointment.tab === 'Therapy' && appointment.roomNumber ? (
                     <Text style={{ fontSize: 12, color: COLORS.neutral[500], marginTop: 0, marginBottom: 0 }}>Room: {appointment.roomNumber}</Text>
                   ) : null}
                   <Text style={{ fontSize: 12, color: COLORS.neutral[500], marginTop: 0, marginBottom: 0 }}>Duration: {appointment.duration || 15} min</Text>
                   {appointment.notes ? <Text style={{ fontSize: 12, color: COLORS.neutral[400], marginTop: 0, marginBottom: 0 }}>Notes: {appointment.notes}</Text> : null}
                 </View>
                {/* Right column: Doctor, Status, Therapist Names (all right-aligned) */}
                <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: 70 }}>
                  {appointment.doctorName ? (
                    <Text style={[styles.doctorName, { textAlign: 'right', width: '100%', marginBottom: 6 }]}>{appointment.doctorName}</Text>
                  ) : null}
                  <Text style={[styles.statusLabel, {
                    backgroundColor:
                      appointment.status === 'completed' ? COLORS.kapha[100] :
                      appointment.status === 'cancelled' ? COLORS.pitta[100] : COLORS.vata[100],
                    color:
                      appointment.status === 'completed' ? COLORS.kapha[700] :
                      appointment.status === 'cancelled' ? COLORS.pitta[700] : COLORS.vata[700],
                    alignSelf: 'flex-end',
                    fontSize: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginBottom: 6,
                  }]}> {appointment.status.toUpperCase()} </Text>
                  {appointment.therapistNames && appointment.therapistNames.length > 0 ? (
                    <Text style={[styles.therapistNames, { textAlign: 'right', width: '100%', marginBottom: 6 }]}>{appointment.therapistNames.join(', ')}</Text>
                  ) : null}
                </View>
              </View>

            </Card>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
      <NewAppointmentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreate={appointment => {
          dispatch(addAppointment({ ...appointment, tab: 'Doctor', status: 'pending' }) as any);
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
export const options = {
  title: 'Appointments',
};