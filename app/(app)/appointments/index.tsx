import React, { useEffect, useState, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ROUTE_NEW_APPOINTMENT, ROUTE_CLIENTS } from '@/constants/routes';
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
import { APPOINTMENT_PARAM_KEYS } from '@/features/appointments/constants/paramKeys';
import { completeAppointment } from '@/features/appointments/appointmentsSlice';
import { selectDoctors } from '@/features/appointments/selectors';
import DoctorAppointmentCard from '@/features/appointments/components/DoctorAppointmentCard';


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

  const doctors = useAppSelector(selectDoctors);

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

  // --- Centralized Action Handlers ---
  const handleBookAppointment = (slotOrAppointment: any) => {
    router.replace({
      pathname: ROUTE_CLIENTS,
      params: {
        [APPOINTMENT_PARAM_KEYS.SLOT_START]: slotOrAppointment.time || slotOrAppointment.startTime,
        [APPOINTMENT_PARAM_KEYS.SLOT_END]: slotOrAppointment.endTime,
        [APPOINTMENT_PARAM_KEYS.DURATION]: slotOrAppointment.duration,
        [APPOINTMENT_PARAM_KEYS.ROOM_ID]: slotOrAppointment.roomNumber || slotOrAppointment.roomId,
        [APPOINTMENT_PARAM_KEYS.DATE]: slotOrAppointment.date,
        select: 1,
        tab: Array.isArray(params.tab) ? params.tab[0] : params.tab || 'Therapy',
      },
    });
  };

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

  const handleRescheduleAppointment = (appointment: any) => {
    router.push({
      pathname: '/appointments/reschedule',
      params: { appointmentId: appointment.id },
    });
  };

  const handleMarkCompleteAppointment = (appointment: any) => {
    // Only allow if current time > slot start time
    const now = new Date();
    const slotDate = new Date(`${appointment.date}T${appointment.time || appointment.startTime || appointment.slot}`);
    if (now < slotDate) {
      if (Platform.OS === 'web') {
        window.alert('Cannot mark as completed before the appointment start time.');
      } else {
        Alert.alert('Error', 'Cannot mark as completed before the appointment start time.');
      }
      return;
    }
    dispatch(completeAppointment(appointment.id));
    if (Platform.OS === 'web') {
      window.alert('Appointment marked as completed.');
    } else {
      Alert.alert('Success', 'Appointment marked as completed.');
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
        {Platform.OS === 'web' ? (
          <div style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
            <View style={[
              styles.dateBarRow,
              {
                height: 60,
                paddingHorizontal: 9,
                position: 'relative',
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center',
                marginBottom: 3
              }
            ]}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={handlePreviousDay} style={[styles.dateNavButton, { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }]}>
                  <ChevronLeft size={20} color={colors.grayDark} />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginHorizontal: 6 }}>
                  <Text style={[styles.dateBarText, { fontSize: 12, fontWeight: 'bold', textAlign: 'center' }]}>{format(selectedDate, 'EEE, MMM dd')}</Text>
                  <Text style={[styles.dateBarSubtext, { fontSize: 10.5, color: '#888', textAlign: 'center', marginTop: 0 }]}>{format(selectedDate, 'yyyy')}</Text>
                </View>
                <TouchableOpacity onPress={handleNextDay} style={[styles.dateNavButton, { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }]}>
                  <ChevronRight size={20} color={colors.grayDark} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <View style={[styles.statusAvatarMobile, { backgroundColor: '#E8F5ED', paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 24, marginRight: 3 }]}>
                  <Text style={{ color: '#43A047', fontWeight: 'bold', fontSize: 9.75 }}>✔️</Text>
                  <Text style={[styles.statusCountText, { fontSize: 9.75 }]}>{completed}</Text>
                </View>
                <View style={[styles.statusAvatarMobile, { backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 24, marginRight: 3 }]}>
                  <Text style={{ color: '#E65100', fontWeight: 'bold', fontSize: 9.75 }}>✖️</Text>
                  <Text style={[styles.statusCountText, { fontSize: 9.75 }]}>{cancelled}</Text>
                </View>
                <View style={[styles.statusAvatarMobile, { backgroundColor: '#E6EDFF', paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 24 }]}>
                  <Text style={{ color: '#1976D2', fontWeight: 'bold', fontSize: 9.75 }}>⏰</Text>
                  <Text style={[styles.statusCountText, { fontSize: 9.75 }]}>{pending}</Text>
                </View>
              </View>
            </View>
          </div>
        ) : (
          <View style={[styles.dateBarRow, { height: 60, paddingHorizontal: 9, position: 'relative', backgroundColor: '#fff', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, marginBottom: 3 }]}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity onPress={handlePreviousDay} style={[styles.dateNavButton, { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }]}>
                <ChevronLeft size={20} color={colors.grayDark} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginHorizontal: 6 }}>
                <Text style={[styles.dateBarText, { fontSize: 12, fontWeight: 'bold', textAlign: 'center' }]}>{format(selectedDate, 'EEE, MMM dd')}</Text>
                <Text style={[styles.dateBarSubtext, { fontSize: 10.5, color: '#888', textAlign: 'center', marginTop: 0 }]}>{format(selectedDate, 'yyyy')}</Text>
              </View>
              <TouchableOpacity onPress={handleNextDay} style={[styles.dateNavButton, { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }]}>
                <ChevronRight size={20} color={colors.grayDark} />
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={[styles.statusAvatarMobile, { backgroundColor: '#E8F5ED', paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 24, marginRight: 3 }]}>
                <Text style={{ color: '#43A047', fontWeight: 'bold', fontSize: 9.75 }}>✔️</Text>
                <Text style={[styles.statusCountText, { fontSize: 9.75 }]}>{completed}</Text>
              </View>
              <View style={[styles.statusAvatarMobile, { backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 24, marginRight: 3 }]}>
                <Text style={{ color: '#E65100', fontWeight: 'bold', fontSize: 9.75 }}>✖️</Text>
                <Text style={[styles.statusCountText, { fontSize: 9.75 }]}>{cancelled}</Text>
              </View>
              <View style={[styles.statusAvatarMobile, { backgroundColor: '#E6EDFF', paddingHorizontal: 6, paddingVertical: 1.5, minWidth: 24 }]}>
                <Text style={{ color: '#1976D2', fontWeight: 'bold', fontSize: 9.75 }}>⏰</Text>
                <Text style={[styles.statusCountText, { fontSize: 9.75 }]}>{pending}</Text>
              </View>
            </View>
          </View>
        )}
        {/* Only show appointment cards for the selected date */}
        <ScrollView style={styles.contentContainer}>
          {appointments
            .filter(a => a.date === selectedKey)
            .map(appt => (
              appt.tab === 'Doctor' ? (
                <DoctorAppointmentCard
                  key={appt.id || `${appt.date}_${appt.time}_${appt.clientId || Math.random()}`}
                  appointment={appt}
                  onBook={() => handleBookAppointment(appt)}
                  onMarkComplete={() => handleMarkCompleteAppointment(appt)}
                />
              ) : (
                <AppointmentCard
                  key={appt.id || `${appt.date}_${appt.time}_${appt.clientId || Math.random()}`}
                  appointment={appt}
                  dayInfo={seriesDayLookup[appt.id]}
                  onBook={() => handleBookAppointment(appt)}
                  onCancel={() => handleCancelAppointment(appt.id)}
                  onReschedule={() => handleRescheduleAppointment(appt)}
                  onMarkComplete={() => handleMarkCompleteAppointment(appt)}
                />
              )
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
  statusAvatar: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, minWidth: 48, justifyContent: 'center' },
  statusCountText: { marginLeft: 6, fontWeight: 'bold', fontSize: 15, color: '#222' },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: { padding: 16 },
  card: { marginBottom: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusCountsMobile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusAvatarMobile: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, minWidth: 48, justifyContent: 'center' },
});
export default AppointmentsScreen;
export const options = {
  headerShown: false,
  title: 'Appointments',
};
