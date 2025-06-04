// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (NewAppointmentModal).
// This is a strict project rule for appointments.
import React from 'react';
import { useTherapyAppointmentFormV2 } from '../helpers/useTherapyAppointmentFormV2';
import * as validationUtils from '@/hooks/validationUtils';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import styles from './TherapyAppointments.styles';
import ScheduleMatrix from '../components/ScheduleMatrix';
import TherapyAppointmentDrawer from '../components/TherapyAppointmentDrawer';
import type { Client } from '@/features/clients/clientsSlice';
import { buildScheduleMatrix } from './buildScheduleMatrix';
import { getRecurringConflicts } from '../helpers/conflictCalculations';
import { getRecurringSlotAlternatives } from '../helpers/recurringSlotAlternatives';
import { format, parseISO, addDays } from 'date-fns';
import { safeFormatDate } from '../helpers/dateHelpers';
import { isSlotInPast } from '../helpers/isSlotInPast';
import type { Therapist } from '../helpers/availabilityUtils';
import { filterTherapistsByGender, getBookingOptions } from '../helpers/rulesEngine';
import { addDynamicAvailability } from '../helpers/dynamicAvailability';
import { useLocalSearchParams } from 'expo-router';

interface DrawerForm {
  client: { id: string; name: string; mobile: string };
  therapy: string;
  date: string;
  time: string;
  duration: string;
  therapists: { id: string; name: string }[];
  selectedTherapists: string[];
  notes: string;
}
interface TherapyAppointmentsProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (values: any) => void;
  clients: Client[];
  therapists: any[];
  rooms: any[];
  clinicTimings: any;
  appointments: any[];
  therapies: any[];
  enforceGenderMatch: boolean;
  autoOpenDrawer?: boolean;
  newAppointment?: boolean; // signals intent to clear/reset state for new appointment
  initialClientId?: string;
  initialClientName?: string;
  initialClientPhone?: string;
  initialSlotStart?: string;
  initialSlotEnd?: string;
  initialRoomId?: string;
  initialDate?: string;
}

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = (props) => {
  // Support newAppointment prop for resetting state
  const { newAppointment } = props;

  // Destructure all required props at the top
  const {
    visible,
    onClose,
    onCreate,
    clients = [],
    therapists = [],
    rooms = [],
    clinicTimings = {},
    appointments = [],
    therapies = [],
    enforceGenderMatch,
    autoOpenDrawer,
    initialSlotStart = '',
    initialSlotEnd = '',
    initialRoomId = '',
    initialClientId = '',
    initialClientName = '',
    initialClientPhone = '',
    initialDate = '',
  } = props;

  // Defensive: fallback to empty array if therapists is undefined
  const safeTherapists = Array.isArray(therapists) ? therapists : [];

  // Defensive: ensure all arrays are always arrays
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeTherapies = Array.isArray(therapies) ? therapies : [];

  // Debug log for all drawerForm initial values
  console.log('drawerForm init', {
    initialClientId,
    initialClientName,
    initialClientPhone,
    therapists: safeTherapists,
  });

  // --- Drawer State ---
  // Only declare these ONCE at the top of the component!
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  const [drawerForm, setDrawerForm] = React.useState<DrawerForm>({
    client: {
      id: initialClientId,
      name: initialClientName,
      mobile: initialClientPhone,
    },
    therapy: '',
    date: '',
    time: '',
    duration: '1d',
    therapists: safeTherapists.map((t: any) => ({ id: t.id, name: t.name })),
    selectedTherapists: [],
    notes: '',
  });

  // Defensive logs for debugging (optional, comment out if not needed)
  // console.log('[TherapyAppointments] props:', props);
  // console.log('[TherapyAppointments] clients:', clients);
  // console.log('[TherapyAppointments] therapists:', therapists);
  // console.log('[TherapyAppointments] rooms:', rooms);
  // console.log('[TherapyAppointments] appointments:', appointments);
  // console.log('[TherapyAppointments] therapies:', therapies);

  // Only open drawer for newAppointment (IntelligentSlot 'Create') or explicit slot select
  React.useEffect(() => {
    if (newAppointment) {
      setDrawerForm({
        client: { id: '', name: '', mobile: '' },
        therapy: '',
        date: '',
        time: '',
        duration: '1d',
        therapists: (therapists || []).map((t: any) => ({ id: t.id, name: t.name })),
        selectedTherapists: [],
        notes: '',
      });
      setDrawerVisible(true);
    }
  }, [newAppointment, therapists]);

  // Drawer close handler: always clear drawerForm and close drawer
  const handleDrawerClose = React.useCallback(() => {
    setDrawerVisible(false);
    setDrawerForm({
      client: { id: '', name: '', mobile: '' },
      therapy: '',
      date: '',
      time: '',
      duration: '1d',
      therapists: (therapists || []).map((t: any) => ({ id: t.id, name: t.name })),
      selectedTherapists: [],
      notes: '',
    });
  }, [therapists]);





  // --- DEBUG: Log when drawerVisible is set to true ---
  const openDrawer = React.useCallback(() => {
    setDrawerVisible(true);
  }, []);

  // --- Automatically open drawer if autoOpenDrawer and valid client info ---
  // When autoOpenDrawer or client info changes, update drawerForm with client info and sensible defaults


  // --- Handler for slot creation (used in ScheduleMatrix) ---
  const handleCreateSlot = (slotInfo: any) => {
  // slotInfo should contain clientId, date, slot/time, therapyId, etc.
  const { clientId, date, time, therapyId } = slotInfo || {};
  const patient = clients.find(p => p.id === clientId);
  const patientGender = patient?.gender;
  let filteredTherapists: any[] = [];
  if (patientGender && date && time) {
    const genderMatched = filterTherapistsByGender(therapists, patientGender, enforceGenderMatch);
    filteredTherapists = genderMatched.filter(t => {
      if (!t || !t.availability || !t.availability[date]) return false;
      return t.availability[date].includes(time);
    });
  } else {
    filteredTherapists = therapists.map(t => ({ id: t.id, name: t.name }));
  }
  setDrawerForm((prev: any) => ({
    ...prev,
    client: { id: clientId || '', name: patient?.name || '', mobile: patient?.mobile || '' },
    date: date || '',
    time: time || '',
    therapy: therapyId || '',
    therapists: filteredTherapists,
    selectedTherapists: [],
    notes: '',
  }));
  setDrawerVisible(true);
};

  // --- STATE and handlers (existing logic follows here) ---
  // DEBUG: Effect for navigation params (if any)
  const params = useLocalSearchParams();

  React.useEffect(() => {
  // Only open drawer if router params for slot and client are present
  const slotStart = params.slotStart as string | undefined;
  const slotEnd = params.slotEnd as string | undefined;
  const roomId = params.roomId as string | undefined;
  const date = params.date as string | undefined;
  const clientId = params.clientId as string | undefined;
  const clientName = params.clientName as string | undefined;
  const clientPhone = params.clientPhone as string | undefined;
  if (slotStart && slotEnd && roomId && date && clientId) {
    // Blur any focused element before opening drawer (web accessibility fix)
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    // Find patient gender for filtering
    const patient = clients.find(p => p.id === clientId);
    const patientGender = patient?.gender;
    // Find therapy duration
    const therapyId = (drawerForm && drawerForm.therapy) || '';
    const therapyObj = (therapies || []).find(t => t.id === therapyId);
    const therapyDuration = therapyObj?.duration ? String(therapyObj.duration) : '60';
    // Filter therapists by gender and slot availability
    let filteredTherapists: any[] = [];
    if (patientGender && date && slotStart) {
      const genderMatched = filterTherapistsByGender(therapists, patientGender, enforceGenderMatch);
      filteredTherapists = genderMatched.filter(t => {
        if (!t || !t.availability || !t.availability[date]) return false;
        return t.availability[date].includes(slotStart);
      });
    } else {
      filteredTherapists = therapists.map(t => ({ id: t.id, name: t.name }));
    }
    setDrawerForm(prev => ({
      ...prev,
      client: {
        id: clientId,
        name: clientName || '',
        mobile: clientPhone || ''
      },
      date,
      time: slotStart,
      duration: therapyDuration,
      therapists: (filteredTherapists as any[]).map((t: any) => ({ id: t.id, name: t.name })),
      selectedTherapists: [],
      notes: ''
    }));
    setDrawerVisible(true);
    // Optionally: clear params here if needed (requires router.replace or navigation reset)
  }
}, [params.slotStart, params.slotEnd, params.roomId, params.date, params.clientId]);
  // Helper to ensure param is always a string
  const getString = (v: string | string[] | undefined) => Array.isArray(v) ? v[0] || '' : v || '';


  const {
    values,
    setValues,
    touched,
    setTouched,
    error,
    setError,
    submitAttempted,
    setSubmitAttempted,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setSelectedPatient,
    setSelectedTherapy,
    setSelectedTherapists,
    setStartDate,
    setTimeSlot,
    setSelectedRoom,
    setDuration,
    setNotes,
  } = useTherapyAppointmentFormV2({
    initialValues: {
      selectedPatient: '',
      selectedTherapy: '',
      selectedTherapists: Array.isArray(safeTherapists) ? [] : [], // always array
      startDate: '',
      timeSlot: '',
      selectedRoom: '',
      duration: 1,
      notes: '',
    },
    validate: (formValues) => validationUtils.validateRequiredFields(formValues, [
      'selectedPatient',
      'selectedTherapy',
      'selectedTherapists',
      'startDate',
      'timeSlot',
      'selectedRoom',
      'duration'
    ]),
    onSubmit: (values) => {
      if (props.onCreate) props.onCreate(values);
    },
  });

  // --- Matrix Date, Therapy Object, Stable Rooms ---
  const matrixDate = values?.startDate || safeFormatDate(new Date(), 'yyyy-MM-dd');
  const selectedTherapyObj = (safeTherapies ?? []).find((t: any) => t.id === values?.selectedTherapy) || null;
  const stableRooms = React.useMemo(() => safeRooms, [safeRooms]);


  // Runtime check for undefined arrays/fields
  if (
    values.selectedTherapists === undefined ||
    !Array.isArray(values.selectedTherapists) ||
    safeTherapists === undefined ||
    safeClients === undefined ||
    safeRooms === undefined ||
    safeAppointments === undefined ||
    safeTherapies === undefined
  ) {
    console.error('[TherapyAppointments] FATAL: One or more initialValues or safe arrays are undefined!', {
      values,
      safeTherapists,
      safeClients,
      safeRooms,
      safeAppointments,
      safeTherapies,
    });
  }
  console.log('[TherapyAppointments] useTherapyAppointmentFormV2 initial values:', values);

  const [therapySearch, setTherapySearch] = React.useState('');
  const [therapyInputFocused, setTherapyInputFocused] = React.useState(false);
  const [therapistSearch, setTherapistSearch] = React.useState('');
  const [showAllTherapists, setShowAllTherapists] = React.useState(false);
  const [therapistInputFocused, setTherapistInputFocused] = React.useState(false);

  const [clientGender, setClientGender] = React.useState<string | null>(null);

  const filteredTherapists = React.useMemo(() => {
    if (!clientGender) return therapists ?? [];
    return filterTherapistsByGender(therapists ?? [], clientGender, enforceGenderMatch);
  }, [therapists, clientGender, enforceGenderMatch]);

  const [replacementSlots, setReplacementSlots] = React.useState<Record<string, string>>({});

  // Memoize appointments, therapists, and rooms to ensure stable references for useMemo dependencies
  const stableAppointments = React.useMemo(() => appointments ?? [], [appointments]);
  const stableTherapists = React.useMemo(() => therapists ?? [], [therapists]);
  // Default slot values.duration is 60 minutes until a therapy is selected
  const slotDuration = selectedTherapyObj ? selectedTherapyObj.duration : 60;
  const therapistsWithAvailability = addDynamicAvailability({
    entities: therapists,
    entityType: 'therapist',
    date: values.startDate || safeFormatDate(new Date(), 'yyyy-MM-dd'),
    appointments,
    clinicTimings,
    slotDuration,
  });
  const roomsWithAvailability = addDynamicAvailability({
    entities: rooms,
    entityType: 'room',
    date: values.startDate || safeFormatDate(new Date(), 'yyyy-MM-dd'),
    appointments,
    clinicTimings,
    slotDuration,
  });

  // --- Generate slot matrix for UI ---
  // Always use therapistsWithAvailability to ensure correct dynamic slot availability

  // State hooks at the top
  const [showAlternatives, setShowAlternatives] = React.useState(false);
  // Only declare recommendedSlots state ONCE at the top
  const [recommendedSlots, setRecommendedSlots] = React.useState<any[]>([]);

  // --- Therapy Room Schedule states ---
  const [scheduleDate, setScheduleDate] = React.useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  // Build the schedule matrix using only stable dependencies
  const matrix: any[] = React.useMemo(() => {
    if (!matrixDate) return [];
    const safeStableAppointments = Array.isArray(stableAppointments) ? stableAppointments : [];
    console.log('[TherapyAppointments] Appointments for matrix:', Array.isArray(safeStableAppointments) ? safeStableAppointments.length : 'not array', safeStableAppointments && safeStableAppointments.length > 0 ? safeStableAppointments.slice(0, 2) : safeStableAppointments);
    console.log('[Matrix Inputs]', {
      matrixDate,
      rooms: stableRooms,
      therapists: stableTherapists,
      clinicTimings,
    });

    const weekday = new Date(matrixDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    console.log('[Matrix Weekday]', weekday, clinicTimings.weekdays[weekday]);
    const safeMatrix = Array.isArray(matrix) ? matrix : [];
    console.log('[TherapyAppointments] matrix for render:', safeMatrix, Array.isArray(safeMatrix), safeMatrix.length, typeof safeMatrix, safeMatrix);
    if (!Array.isArray(safeMatrix)) {
      console.error('[TherapyAppointments] matrix is not array!', safeMatrix);
    }
    
    const scheduleMatrix = buildScheduleMatrix(
      matrixDate,
      stableAppointments,
      stableRooms,
      stableTherapists,
      clinicTimings,
      enforceGenderMatch,
      clientGender ?? undefined,
      selectedTherapyObj?.duration || 60,
      clients // Pass as clients argument
    );
    return scheduleMatrix || [];
  }, [matrixDate, stableAppointments, stableRooms, stableTherapists, clinicTimings, enforceGenderMatch, clientGender, selectedTherapyObj, clients]);

  React.useEffect(() => {

  }, [matrix, matrixDate, stableAppointments]);

  React.useEffect(() => {
    if (Array.isArray(matrix)) {
      matrix.forEach(room => {
      });
    }
  }, [matrix]);

  // Compute recurring slot alternatives and reasons
  const getRecurringSlotInfo = React.useCallback(() => {
    // Prevent if no client selected
    if (!values.startDate || !values.selectedRoom || !values.selectedPatient || !values.selectedTherapists) return {};
    const date = values.startDate;
    // Use dynamic slotDuration for recurring slot alternatives as well
    const slotDuration = selectedTherapyObj?.duration || 60;
    const therapistsWithAvailability = addDynamicAvailability({
      entities: therapists,
      entityType: 'therapist',
      date,
      appointments,
      clinicTimings,
      slotDuration,
    });
    const roomsWithAvailability = addDynamicAvailability({
      entities: rooms,
      entityType: 'room',
      date,
      appointments,
      clinicTimings,
      slotDuration,
    });
    return getRecurringSlotAlternatives({
      enforceGenderMatch,
      startDate: values.startDate,
      days: values.duration ?? 1,
      requestedSlot: values.timeSlot,
      selectedTherapists: values.selectedTherapists,
      appointments,
      selectedRoom: values.selectedRoom,
      clientId: values.selectedPatient,
      allTherapists: therapistsWithAvailability,
      allRooms: roomsWithAvailability,
      clients: clients,
      now: new Date(),
    });
  }, [appointments, values.startDate, values.timeSlot, values.selectedTherapists, values.selectedRoom, therapists, rooms, clients, values.duration]);

  // Handler for dropdown
  const handleSlotChange = (date: string, slot: string) => {
    setReplacementSlots((prev: Record<string, string>) => ({ ...prev, [date]: slot }));
  };

  // Show alternatives if there is a conflict
  React.useEffect(() => {
    const safeSelectedTherapists = Array.isArray(values.selectedTherapists) ? values.selectedTherapists : [];
    console.log('[TherapyAppointments] safeSelectedTherapists:', safeSelectedTherapists, typeof safeSelectedTherapists);
    if (!values.startDate || !values.timeSlot || safeSelectedTherapists.length === 0 || !values.selectedRoom) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }
    const canBook = getBookingOptions({
      enforceGenderMatch,
      clientId: values.selectedPatient ?? '',
      selectedTherapists: values.selectedTherapists,
      selectedRoom: values.selectedRoom ?? '',
      date: safeFormatDate(values.startDate, 'yyyy-MM-dd'),
      slot: values.timeSlot,
      appointments,
      allTherapists: therapists,
      allRooms: rooms,
      clients: clients,
      now: new Date(),
      maxAlternatives: 3
    });
    if (canBook) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }
    // --- FIX: Compute recurring slot alternatives ---
    const alternativesResult = getRecurringSlotAlternatives({
      enforceGenderMatch: enforceGenderMatch,
      startDate: values.startDate,
      days: values.duration ?? 1,
      requestedSlot: values.timeSlot,
      selectedTherapists: values.selectedTherapists,
      appointments: appointments,
      selectedRoom: values.selectedRoom,
      clientId: values.selectedPatient || "",
      allTherapists: therapists,
      allRooms: rooms,
      clients: clients,
      now: new Date(),
    });
    setRecommendedSlots(alternativesResult[0]?.alternatives || []);
    setShowAlternatives(true);
  }, [appointments, values.startDate, values.timeSlot, values.selectedTherapists, values.selectedRoom, matrix, values.duration, clients, therapists, rooms]);

  // Memoize recurringConflicts
  const isRecurring = values.duration && [3, 7, 14, 21].includes(values.duration);
  const recurringConflicts = React.useMemo(() => {
    const safeSelectedTherapists2 = Array.isArray(values.selectedTherapists) ? values.selectedTherapists : [];
    console.log('[TherapyAppointments] safeSelectedTherapists2:', safeSelectedTherapists2, typeof safeSelectedTherapists2);
    if (safeSelectedTherapists2.length > 0 && values.startDate && values.timeSlot && isRecurring) {
      const days = values.duration ?? 1;
      const dateAdd = (dateStr: string, n: number) => format(addDays(parseISO(dateStr), n), 'yyyy-MM-dd');
      const conflicts = getRecurringConflicts(
        appointments,
        values.startDate,
        days,
        values.timeSlot,
        values.selectedTherapists,
        dateAdd
      );
      return conflicts;
    }
    return [];
  }, [appointments, values.startDate, values.timeSlot, values.selectedTherapists, values.duration, isRecurring]);

  // Validation logic 
  const isValid = () => {
    const safeSelectedTherapists3 = Array.isArray(values.selectedTherapists) ? values.selectedTherapists : [];
    console.log('[TherapyAppointments] safeSelectedTherapists3:', safeSelectedTherapists3, typeof safeSelectedTherapists3);
    if (!values.selectedPatient || !values.selectedTherapy || safeSelectedTherapists3.length === 0 || !values.startDate || !values.timeSlot || (!values.duration && !(false))) {
      return false;
    }
    // Ensure values.selectedPatient and values.selectedRoom are never null or undefined
    const clientId = values.selectedPatient ? values.selectedPatient : '';
    const roomId = values.selectedRoom ? values.selectedRoom : '';
    // Check for any slot in the series being in the past or unresolved
    const daysToBook = values.duration ?? 1;
    const now = new Date();


    for (let i = 0; i < daysToBook; i++) {
      const dateVal = format(addDays(parseISO(values.startDate), i), 'yyyy-MM-dd');
      // Use replacement slot if present
      const slot = replacementSlots[dateVal] || values.timeSlot;
      if (!slot) return false;
      if (isSlotInPast(dateVal, slot, now)) return false;
      const bookingOptionsInput = {
        enforceGenderMatch,
        clientId,
        selectedTherapists: values.selectedTherapists,
        selectedRoom: roomId,
        date: dateVal,
        slot,
        appointments,
        allTherapists: therapists,
        allRooms: rooms,
        clients: clients,
        now: new Date(),
        maxAlternatives: 3
      };
      // DEBUG: Log input to getBookingOptions
      // (log removed for cleanup)'[DEBUG][isValid][getBookingOptions][INPUT]', bookingOptionsInput);
      const bookingOptionsResult = getBookingOptions(bookingOptionsInput);
      // DEBUG: Log output from getBookingOptions
      // (log removed for cleanup)'[DEBUG][isValid][getBookingOptions][OUTPUT]', bookingOptionsResult);
      if (!bookingOptionsResult) return false;
    }
    return true;
  };
  // --- Handler for booking appointments ---
  const handleBookAppointments = () => {
    // setTouched removed: not needed with new form hook
    if (!isValid()) return;

    // Strict conflict check using getBookingOptions
    const bookingOptions = getBookingOptions({
      enforceGenderMatch,
      clientId: values.selectedPatient ? values.selectedPatient : '',
      selectedTherapists: values.selectedTherapists,
      selectedRoom: values.selectedRoom ? values.selectedRoom : '',
      date: safeFormatDate(values.startDate, 'yyyy-MM-dd'),
      slot: values.timeSlot,
      appointments,
      allTherapists: therapists,
      allRooms: rooms,
      clients: clients,
      now: new Date(),
      maxAlternatives: 3
    });
    if (!bookingOptions[0]?.available) {
      setShowAlternatives(true);
      setRecommendedSlots(bookingOptions[0]?.alternatives || []);
      // Optionally show a message to the user
      return;
    }

    // Build recurring appointments for each day in values.duration
    const days = values.duration ?? 1;
    let lastCreatedAppointment = null;
    const daysToBook = Number(days);
    const generatedAppointments: any[] = [];

    // Find the selected therapy object for values.duration/name/id lookup
    const selectedTherapyObj = therapies.find((t: any) => t.id === values.selectedTherapy);
    for (let i = 0; i < daysToBook; i++) {
      const dateObj = addDays(values.startDate, i);
      const slotString = values.timeSlot;
      const roomObj = rooms.find((r: any) => r.id === values.selectedRoom);
      const appointment = {
        id: `${values.selectedPatient}_${values.selectedTherapists.join('_')}_${roomObj?.id || values.selectedRoom}_${safeFormatDate(new Date(dateObj), 'yyyy-MM-dd')}_${slotString}`,
        clientId: String(values.selectedPatient),
        clientName: (clients.find((p: Client) => p.id === values.selectedPatient)?.name || values.selectedPatient || ''),
        therapistIds: values.selectedTherapists,
        therapistNames: values.selectedTherapists.map((id: string) => (therapists.find((t: Therapist) => t.id === id)?.name || id)),
      };

      generatedAppointments.push(appointment);
    }

    // TODO: Implement logic to create appointments
  };

  return (
    <View style={{ flex: 1 }}>
      <View>
        <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1, paddingBottom: 40 }]} keyboardShouldPersistTaps="handled">
          {/* Immersive edge-to-edge Schedule Matrix area */}
          <View style={{ margin: 0, padding: 0, backgroundColor: 'transparent', borderRadius: 0 }}>
            <View style={{ margin: 0, padding: 0, backgroundColor: 'transparent', borderRadius: 0 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <TouchableOpacity onPress={() => setStartDate(format(addDays(parseISO(matrixDate), -1), 'yyyy-MM-dd'))}>
                  <Text style={{ fontSize: 28 }}>‹</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 }}>{matrixDate}</Text>
                <TouchableOpacity onPress={() => setStartDate(format(addDays(parseISO(matrixDate), 1), 'yyyy-MM-dd'))}>
                  <Text style={{ fontSize: 28 }}>›</Text>
                </TouchableOpacity>
              </View>
              {Array.isArray(matrix) && matrix.length > 0 ? (
                <ScheduleMatrix
                  matrix={matrix}
                  conflicts={getRecurringConflicts
                    ? getRecurringConflicts(
                      appointments,
                      values.startDate,
                      Number(values.duration ?? 1),
                      values.timeSlot,
                      values.selectedTherapists,
                      (dateStr: string, days: number) => {
                        if (!dateStr) return '';
                        const date = addDays(dateStr, days);
                        if (!date || isNaN(date.getTime())) return '';
                        return format(date, 'yyyy-MM-dd');
                      }
                    )
                    : []
                  }
                  selectedDate={matrixDate}
                  selectedTherapists={values.selectedTherapists ?? []}
                  selectedSlot={{ id: values.selectedRoom || '', slot: values.timeSlot || '' }}
                  recommendedSlots={recommendedSlots ?? []}
                  onSlotSelect={(roomId: string, slot: string, date: string) => {
                    setSelectedRoom(roomId);
                    setTimeSlot(slot);
                    setStartDate(date);
                  }}
                  therapists={therapists ?? []}
                  onCreateSlot={handleCreateSlot}
                  highlightedSlot={{ slotStart: values.timeSlot || '', slotRoom: values.selectedRoom || '' }}
                  onCloseModal={() => setDrawerVisible(false)}
                />
              ) : (
                <Text style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                  No schedule available for this date.
                </Text>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <View style={{ flex: 1 }}>
        {/* ...main content... */}
        {drawerVisible && (
          <View style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            width: '100%',
            // add shadow, etc.
          }}>
            {/* Backdrop */}
            <TouchableOpacity
              style={[
                {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                }
              ]}
              activeOpacity={1}
              onPress={() => setDrawerVisible(false)}
            />
            {/* Drawer */}
            <View style={{
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              backgroundColor: '#fff',
              minHeight: 700,
              maxHeight: '90%',
              width: '100%',
              overflow: 'hidden',
            }}>
              <TherapyAppointmentDrawer
                visible={drawerVisible}
                onClose={handleDrawerClose}
                onSubmit={(appointment) => {
                  if (props.onCreate) {
                    props.onCreate(appointment);
                  }
                  handleDrawerClose(); // Always clear and close after booking

                }}
                client={drawerForm.client}
                therapy={drawerForm.therapy}
                onTherapyChange={therapyId => {
                  // Find selected therapy object
                  const therapyObj = (therapies || []).find(t => t.id === therapyId);
                  // Get duration from therapy
                  const therapyDuration = therapyObj?.duration ? String(therapyObj.duration) : '60';
                  // Find patient gender
                  const patient = clients.find(p => p.id === drawerForm.client.id);
                  const patientGender = patient?.gender;
                  // Defensive: get date and slot
                  const date = drawerForm.date;
                  const slot = drawerForm.time;
                    // Filter therapists by gender and slot availability
                    let filteredTherapists: any[] = [];
                    if (patientGender && date && slot) {
                      const genderMatched = filterTherapistsByGender(therapists, patientGender, enforceGenderMatch);
                      filteredTherapists = genderMatched.filter(t => {
                        if (!t || !t.availability || !t.availability[date]) return false;
                        return t.availability[date].includes(slot);
                      });
                    } else {
                      filteredTherapists = therapists.map(t => ({ id: t.id, name: t.name }));
                    }
                    setDrawerForm((f: DrawerForm) => ({
                      ...f,
                      therapy: therapyId,
                      duration: therapyDuration,
                      therapists: filteredTherapists,
                    }));
                } }
                date={drawerForm.date}
                time={drawerForm.time}
                onDateChange={date => {
                  const patient = clients.find(p => p.id === drawerForm.client.id);
                  const patientGender = patient?.gender;
                  const slot = drawerForm.time;
                  let filteredTherapists: any[] = [];
                  if (patientGender && date && slot) {
                    const genderMatched = filterTherapistsByGender(therapists, patientGender, enforceGenderMatch);
                    filteredTherapists = genderMatched.filter(t => {
                      if (!t || !t.availability || !t.availability[date]) return false;
                      return t.availability[date].includes(slot);
                    });
                  } else {
                    filteredTherapists = therapists.map(t => ({ id: t.id, name: t.name }));
                  }
                  setDrawerForm((f: DrawerForm) => ({
                    ...f,
                    date,
                    therapists: filteredTherapists,
                  }));
                }}
                onTimeChange={time => {
                  const patient = clients.find(p => p.id === drawerForm.client.id);
                  const patientGender = patient?.gender;
                  const date = drawerForm.date;
                  let filteredTherapists: any[] = [];
                  if (patientGender && date && time) {
                    const genderMatched = filterTherapistsByGender(therapists, patientGender, enforceGenderMatch);
                    filteredTherapists = genderMatched.filter(t => {
                      if (!t || !t.availability || !t.availability[date]) return false;
                      return t.availability[date].includes(time);
                    });
                  } else {
                    filteredTherapists = therapists.map(t => ({ id: t.id, name: t.name }));
                  }
                  setDrawerForm((f: DrawerForm) => ({
                    ...f,
                    time,
                    therapists: filteredTherapists,
                  }));
                }}
                duration={drawerForm.duration}
                onDurationChange={duration => setDrawerForm((f: DrawerForm) => ({ ...f, duration }))}
                therapists={drawerForm.therapists}
                selectedTherapists={drawerForm.selectedTherapists}
                onTherapistToggle={id => setDrawerForm((f: DrawerForm) => ({ ...f, selectedTherapists: f.selectedTherapists.includes(id) ? f.selectedTherapists.filter((tid: string) => tid !== id) : [...f.selectedTherapists, id] }))}
                notes={drawerForm.notes}
                onNotesChange={notes => setDrawerForm((f: DrawerForm) => ({ ...f, notes }))}
                therapies={props.therapies || []}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default TherapyAppointments;
