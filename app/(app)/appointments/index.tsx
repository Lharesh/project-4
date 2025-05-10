import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, MoveVertical, Clock, Plus } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import { COLORS } from '@/constants/theme';

const todayKey = format(new Date(), 'yyyy-MM-dd');
const tomorrowKey = format(addDays(new Date(), 1), 'yyyy-MM-dd');
const yesterdayKey = format(subDays(new Date(), 1), 'yyyy-MM-dd');

type AppointmentStatus = 'completed' | 'cancelled' | 'pending';
type Appointment = {
  id: string;
  time: string;
  clientName: string;
  treatmentName: string;
  status: AppointmentStatus;
};

const mockAppointmentsByDate: Record<string, Appointment[]> = {
  [todayKey]: [
    { id: 'a1', time: '09:00 AM', clientName: 'Ravi Kumar', treatmentName: 'Abhyanga', status: 'pending' },
    { id: 'a2', time: '10:30 AM', clientName: 'Sunita Devi', treatmentName: 'Shirodhara', status: 'completed' },
  ],
  [tomorrowKey]: [
    { id: 'a3', time: '11:00 AM', clientName: 'Ajay Rao', treatmentName: 'Kati Basti', status: 'cancelled' },
    { id: 'a4', time: '04:00 PM', clientName: 'Neha Singh', treatmentName: 'Nasya', status: 'completed' },
    { id: 'a5', time: '05:00 PM', clientName: 'Manoj Joshi', treatmentName: 'Udvartana', status: 'pending' },
  ],
  [yesterdayKey]: [
    { id: 'a6', time: '08:30 AM', clientName: 'Deepa Iyer', treatmentName: 'Vamana', status: 'completed' },
  ],
};

export default function AppointmentsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const appointments = mockAppointmentsByDate[selectedKey] || [];

  const getStatusCounts = () => {
    const counts: Record<AppointmentStatus, number> = { completed: 0, cancelled: 0, pending: 0 };
    appointments.forEach((a) => counts[a.status]++);
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {appointments.map((appointment) => (
          <Card key={appointment.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.timeBlock}>
                <Clock size={16} color={COLORS.vata[600]} />
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
              <Text style={[styles.statusLabel, {
                backgroundColor:
                  appointment.status === 'completed' ? COLORS.kapha[100] :
                  appointment.status === 'cancelled' ? COLORS.pitta[100] : COLORS.vata[100],
                color:
                  appointment.status === 'completed' ? COLORS.kapha[700] :
                  appointment.status === 'cancelled' ? COLORS.pitta[700] : COLORS.vata[700],
              }]}> {appointment.status.toUpperCase()} </Text>
            </View>
            <View>
              <Text style={styles.clientName}>{appointment.clientName}</Text>
              <Text style={styles.treatmentName}>{appointment.treatmentName}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => console.log('Add appointment')}>
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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