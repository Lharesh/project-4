import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ROUTE_NEW_APPOINTMENT } from '@/constants/routes';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { format, addDays, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Plus, Phone, Mail } from 'lucide-react-native';
import { useAppointmentModalParams } from './_useNavigationParams';
import { selectEnforceGenderMatch } from '@/features/clinicConfig/configSlice';
import { useAppSelector } from '@/redux/hooks';
import { useDispatch } from 'react-redux';
import { fetchAppointments, cancelAndShiftSeries, addAppointmentThunk } from '@/features/appointments/appointmentsSlice';
import AppointmentCard from '@/features/appointments/components/AppointmentCard';
import { selectTherapists, selectRooms, selectClinicTimings } from '../../(admin)/clinics/setup/setupSlice';
import type { TreatmentSlot } from '../../(admin)/clinics/setup/setupSlice';
import { safeFormatDate } from '@/features/appointments/helpers/dateHelpers';
import type { Appointment as AppointmentType } from '@/features/appointments/appointmentsSlice';
import { APPOINTMENT_STATUS } from '@/features/appointments/constants/status';


type AppointmentStatus = 'completed' | 'cancelled' | 'pending';
function AppointmentsScreen() {
  const clients = useAppSelector(state => state.clients.clients);
  const therapists = useAppSelector(selectTherapists);
  const rooms = useAppSelector(selectRooms);
  const clinicTimings = useAppSelector(selectClinicTimings);
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);

  // Get navigation params for modal auto-open and client info
  const { tab, initialClientId, initialClientName, initialClientPhone, autoOpenDrawer, newAppointment, initialSlotStart, initialSlotEnd, initialRoomId, initialDate } = useAppointmentModalParams();
  const validTab = (tab === 'Doctor' || tab === 'Therapy') ? tab : undefined;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const pathname = usePathname();// Only show the modal if you are on the /appointments route (not /clients, etc.
  const therapies: TreatmentSlot[] = useAppSelector(state => state.setup.treatmentSlots);
  const { appointments, isLoading, error } = useAppSelector(state => state.appointments);
  const selectedKey = safeFormatDate(selectedDate, '', 'yyyy-MM-dd');

  // Add log to print appointments array
  console.log('[AppointmentsScreen] appointments:', appointments);

  const params = useLocalSearchParams();
  const router = useRouter();

  // Web cancel dialog state
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; appointmentId: string | null }>({ open: false, appointmentId: null });

  useEffect(() => {
    const tabToUse: 'Doctor' | 'Therapy' = validTab ?? 'Doctor';
    dispatch(fetchAppointments({ validTab: tabToUse, date: selectedKey }) as any);
  }, [dispatch, validTab, selectedKey]);

  const enforceGenderMatch = useAppSelector(selectEnforceGenderMatch);

  // Status counts
  const getStatusCounts = () => {
    const counts = { completed: 0, cancelled: 0, pending: 0 };
    const filtered = appointments.filter(a => a.date === selectedKey);
    filtered.forEach((a) => {
      if (a.status === APPOINTMENT_STATUS.SCHEDULED) {
        counts.pending++;
      } else if (a.status === APPOINTMENT_STATUS.COMPLETED) {
        counts.completed++;
      } else if (a.status === APPOINTMENT_STATUS.CANCELLED) {
        counts.cancelled++;
      }
    });
    return counts;
  };

  const handlePreviousDay = () => setSelectedDate((prev) => subDays(prev, 1));
  const handleNextDay = () => setSelectedDate((prev) => addDays(prev, 1));

  // Get status counts
  const { completed, cancelled, pending } = getStatusCounts();

  // Add effect to handle newAppointment param
  React.useEffect(() => {
    let newAppointmentParam = params.newAppointment;
    if (Array.isArray(newAppointmentParam)) {
      newAppointmentParam = newAppointmentParam[0];
    }
    if (newAppointmentParam) {
      let newAppt;
      try {
        newAppt = JSON.parse(newAppointmentParam);
      } catch (e) {
        newAppt = null;
      }
      if (newAppt) {
        if (Array.isArray(newAppt)) {
          newAppt.forEach(appt => dispatch(addAppointmentThunk({ appointment: appt }) as any));
        } else {
          dispatch(addAppointmentThunk({ appointment: newAppt }) as any);
        }
        // Remove the param to prevent duplicate addition
        router.replace('/appointments');
      }

    }

  }, [params.newAppointment]);

  // Efficiently build a lookup table for dayIndex/totalDays per seriesId
  const seriesDayLookup = useMemo(() => {
    const map: Record<string, AppointmentType[]> = {};
    for (const appt of appointments) {
      if (typeof appt.seriesId !== 'string') continue;
      if (!map[appt.seriesId]) map[appt.seriesId] = [];
      map[appt.seriesId].push(appt as AppointmentType);
    }
    const lookup: Record<string, { dayIndex: number; totalDays: number }> = {};
    for (const [seriesId, appts] of Object.entries(map)) {
      const sorted = (appts as AppointmentType[])
        .filter(a => a.status !== APPOINTMENT_STATUS.CANCELLED)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      sorted.forEach((a, idx) => {
        lookup[a.id] = {
          dayIndex: idx + 1,
          totalDays: sorted.length,
        };
      });
    }
    return lookup;
  }, [appointments]);

  const handleCancelAppointment = (appointmentId: string) => {
    if (Platform.OS === 'web') {
      setCancelDialog({ open: true, appointmentId });
    } else {
      Alert.alert(
        'Cancel Appointment',
        'Choose an option:',
        [
          { text: 'Close', style: 'cancel' },
          { text: 'Cancel', onPress: () => dispatch(cancelAndShiftSeries({ appointmentId }) as any) },
          { text: 'Cancel & Push', onPress: () => dispatch(cancelAndShiftSeries({ appointmentId, push: true }) as any) },
          { text: 'Cancel All', onPress: () => dispatch(cancelAndShiftSeries({ appointmentId, cancelAll: true }) as any) },
        ]
      );
    }
  };

  function handleWebDialogAction(action: 'cancel' | 'push' | 'cancelAll') {
    if (!cancelDialog.appointmentId) return;
    const payload: any = { appointmentId: cancelDialog.appointmentId, clinicTimings };
    if (action === 'push') payload.push = true;
    if (action === 'cancelAll') payload.cancelAll = true;
    dispatch(cancelAndShiftSeries(payload) as any);
    setCancelDialog({ open: false, appointmentId: null });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { flex: 1 }]} edges={['bottom', 'left', 'right']}>
      <View style={{ flex: 1, position: 'relative' }}>
        {/* Web Cancel Dialog */}
        {Platform.OS === 'web' && cancelDialog.open && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 2000, background: 'rgba(0,0,0,0.25)' }}>
            <div style={{ background: '#fff', maxWidth: 340, margin: '120px auto', borderRadius: 12, boxShadow: '0 2px 16px #0002', padding: 24, textAlign: 'center' }}>
              <h3 style={{ marginBottom: 16 }}>Cancel Appointment</h3>
              <p style={{ marginBottom: 24 }}>Choose an option:</p>
              <button style={{ margin: 4, padding: '8px 16px' }} onClick={() => setCancelDialog({ open: false, appointmentId: null })}>Close</button>
              <button style={{ margin: 4, padding: '8px 16px', background: '#e3f0fa' }} onClick={() => handleWebDialogAction('cancel')}>Cancel</button>
              <button style={{ margin: 4, padding: '8px 16px', background: '#ffe8d2' }} onClick={() => handleWebDialogAction('push')}>Cancel & Push</button>
              <button style={{ margin: 4, padding: '8px 16px', background: '#ffe0e0' }} onClick={() => handleWebDialogAction('cancelAll')}>Cancel All</button>
            </div>
          </div>
        )}
        {/* Date Slider and Status Hashes */}
        <View style={styles.dateBarRow}>
          <TouchableOpacity onPress={handlePreviousDay} style={styles.dateNavButton}>
            <ChevronLeft size={24} color={colors.grayDark} />
          </TouchableOpacity>
          <View style={styles.dateBarBlock}>
            <Text style={styles.dateBarText}>{format(selectedDate, 'EEE, MMM d')}</Text>
            <Text style={styles.dateBarSubtext}>{format(selectedDate, 'yyyy')}</Text>
          </View>
          <TouchableOpacity onPress={handleNextDay} style={styles.dateNavButton}>
            <ChevronRight size={24} color={colors.grayDark} />
          </TouchableOpacity>
          <View style={styles.statusCounts}>
            <Text style={[styles.statusBadge, { backgroundColor: colors.kapha.background, color: colors.kapha.primary }]}>#{completed}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: colors.pitta.background, color: colors.pitta.primary }]}>#{cancelled}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: colors.vata.background, color: colors.vata.primary }]}>#{pending}</Text>
          </View>
        </View>
        {/* Appointment List */}
        <ScrollView style={{ flex: 1 }}>
          {appointments
            .filter(a => a.date === selectedKey)
            .map(appt => (
              <AppointmentCard
                key={appt.id || `${appt.date}_${appt.time}_${appt.clientId || Math.random()}`}
                appointment={appt}
                dayInfo={seriesDayLookup[appt.id]}
                onCancel={() => handleCancelAppointment(appt.id)}
              />
            ))}
          {appointments.filter(a => a.date === selectedKey).length === 0 && (
            <Text style={{ textAlign: 'center', marginTop: 32, color: '#888' }}>
              No appointments for this day.
            </Text>
          )}
        </ScrollView>
        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => {
          router.push({ pathname: ROUTE_NEW_APPOINTMENT as any });
        }} accessibilityLabel="Add Appointment">
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.vata.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    backgroundColor: colors.tabBarBackground,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingBottom: 8,
  },
  footerTab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  footerTabActive: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
    borderTopWidth: 3,
    borderTopColor: colors.tabBarActive,
    backgroundColor: colors.tabBarBackground,
  },
  footerTabIcon: {
    fontSize: 22,
    color: colors.tabBarActive,
  },
  footerTabText: {
    fontSize: 12,
    color: colors.tabBarActive,
    marginTop: 2,
  },
  menuDropdown: {
    position: 'absolute',
    right: 16,
    top: 56,
    backgroundColor: colors.white,
    borderRadius: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 100,
    minWidth: 140,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.headerText,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: colors.headerBackground,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    paddingHorizontal: 16,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.headerText,
    fontFamily: typography.fontFamily,
    letterSpacing: 0.5,
  },
  headerMenuButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    height: 56,
  },
  headerMenuIcon: {
    fontSize: 24,
    color: colors.headerText,
    fontWeight: '700',
  },
  dateBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    minHeight: 48,
    zIndex: 2,
  },
  dateBarBlock: {
    alignItems: 'center',
    flex: 1,
  },
  dateBarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  dateBarSubtext: {
    fontSize: 13,
    color: '#888',
  },
  dateNavButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 2,
  },
  statusCounts: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statusBadge: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 8,
  },
  scrollContainer: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
});
export default AppointmentsScreen;
export const options = {
  headerShown: false,
  title: 'Appointments',
};
