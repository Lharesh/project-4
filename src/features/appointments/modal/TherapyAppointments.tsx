// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (NewAppointmentModal).
// This is a strict project rule for appointments.
import React from 'react';
import { useTherapyAppointmentFormV2 } from '@/hooks/useTherapyAppointmentFormV2';
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
import { useAppSelector } from '@/redux/hooks';
import { selectTherapists } from '../../../../app/(admin)/clinics/setup/setupSlice';

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
  initialClientId?: string;
  initialClientName?: string;
  initialClientPhone?: string;
}

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = (props = {} as TherapyAppointmentsProps) => {
  // Destructure all required props at the top
  const {
    visible,
    onClose,
    onCreate,
    clients,
    therapists,
    rooms,
    clinicTimings,
    appointments,
    therapies,
    enforceGenderMatch,
    autoOpenDrawer,
    initialClientId = '',
    initialClientName = '',
    initialClientPhone = '',
  } = props || {};

  // --- Drawer State ---
  const [drawerVisible, setDrawerVisible] = React.useState(false);
  const [drawerForm, setDrawerForm] = React.useState<DrawerForm>({
    client: {
      id: initialClientId || '',
      name: initialClientName || '',
      mobile: initialClientPhone || ''
    },
    therapy: '',
    date: '',
    time: '',
    duration: '1d',
    therapists: (therapists || []).map((t: any) => ({ id: t.id, name: t.name })),

    selectedTherapists: [],
    notes: '',
  });



  // --- DEBUG: Log when drawerVisible is set to true ---
  const openDrawer = React.useCallback(() => {
    setDrawerVisible(true);
  }, []);

  // --- Automatically open drawer if autoOpenDrawer and valid client info ---
  // When autoOpenDrawer or client info changes, update drawerForm with client info and sensible defaults
  React.useEffect(() => {
    if (
      autoOpenDrawer &&
      initialClientId && initialClientName && initialClientPhone
    ) {
      setDrawerForm((f) => ({
        ...f,
        client: {
          id: initialClientId,
          name: initialClientName,
          mobile: initialClientPhone
        },
        // Set sensible defaults if not already set
        therapy: f.therapy || '',
        date: f.date || safeFormatDate(new Date(), 'yyyy-MM-dd'),
        time: f.time || '',
        duration: f.duration || '1d',
        therapists: f.therapists && f.therapists.length > 0 ? f.therapists : (therapists || []).map((t: any) => ({ id: t.id, name: t.name })),

        selectedTherapists: f.selectedTherapists || [],
        notes: f.notes || ''
      }));
    }
  }, [autoOpenDrawer, initialClientId, initialClientName, initialClientPhone, therapists]);

  // --- Handler for slot creation (used in ScheduleMatrix) ---
  const handleCreateSlot = (slotInfo: any) => {
    // Only open drawer in response to IntelligentSlot action
    setDrawerVisible(true);
    // Optionally, set drawerForm state here based on slotInfo if needed
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
      setDrawerForm(prev => ({
        ...prev,
        client: {
          id: clientId,
          name: clientName || '',
          mobile: clientPhone || ''
        },
        date,
        time: slotStart,
        duration: String((Number(slotEnd.split(':')[0]) * 60 + Number(slotEnd.split(':')[1])) - (Number(slotStart.split(':')[0]) * 60 + Number(slotStart.split(':')[1]))),
        selectedTherapists: [],
        therapists: [],
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
    setCustomDuration,
    setCustomMode,
    setNotes,
  } = useTherapyAppointmentFormV2({
    initialValues: {
      selectedPatient: null,
      selectedTherapy: null,
      selectedTherapists: [],
      startDate: '',
      timeSlot: '',
      selectedRoom: null,
      duration: null,
      customDuration: '',
      customMode: false,
      notes: ''
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
    onSubmit: onCreate
  });

  const [therapySearch, setTherapySearch] = React.useState('');
  const [therapyInputFocused, setTherapyInputFocused] = React.useState(false);
  const [therapistSearch, setTherapistSearch] = React.useState('');
  const [showAllTherapists, setShowAllTherapists] = React.useState(false);
  const [therapistInputFocused, setTherapistInputFocused] = React.useState(false);

  const [clientGender, setClientGender] = React.useState<string | null>(null);

  const filteredTherapists = React.useMemo(() => {
    if (!clientGender) return therapists;
    return filterTherapistsByGender(therapists, clientGender, enforceGenderMatch);
  }, [therapists, clientGender, enforceGenderMatch]);

  const [replacementSlots, setReplacementSlots] = React.useState<Record<string, string>>({});

  // Memoize appointments, therapists, and rooms to ensure stable references for useMemo dependencies
  const stableAppointments = React.useMemo(() => appointments, [appointments]);
  const stableTherapists = React.useMemo(() => therapists, [therapists]);
  const stableRooms = React.useMemo(() => rooms, [rooms]);

  // Matrix date state, controlled by the date slider above the matrix
  const [matrixDate, setMatrixDate] = React.useState(safeFormatDate(new Date(), 'yyyy-MM-dd'));

  // Map therapists and rooms with all required variables from props
  const date = values.startDate;
  // Dynamically determine slotDuration from selected therapy
  const selectedTherapyObj = React.useMemo(() => {
    return therapies?.find((t: any) => t.id === values.selectedTherapy) || null;
  }, [therapies, values.selectedTherapy]);
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
  const matrix = React.useMemo(() => {
    if (!matrixDate) return [];
    return buildScheduleMatrix(
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
      days: values.customMode ? Number(values.customDuration) : (values.duration ?? 1),
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
  }, [appointments, values.startDate, values.timeSlot, values.selectedTherapists, values.selectedRoom, therapists, rooms, clients, values.customMode, values.customDuration, values.duration]);

  // Handler for dropdown
  const handleSlotChange = (date: string, slot: string) => {
    setReplacementSlots((prev: Record<string, string>) => ({ ...prev, [date]: slot }));
  };

  // Show alternatives if there is a conflict
  React.useEffect(() => {
    if (!values.startDate || !values.timeSlot || !values.selectedTherapists.length || !values.selectedRoom) {
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
    const days = values.customMode ? Number(values.customDuration) : (values.duration ?? 1);
    const alternativesResult = getRecurringSlotAlternatives({
      enforceGenderMatch: enforceGenderMatch,
      startDate: values.startDate,
      days: days,
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
  }, [appointments, values.startDate, values.timeSlot, values.selectedTherapists, values.selectedRoom, matrix, values.customMode, values.customDuration, values.duration, clients, therapists, rooms]);

  // Memoize recurringConflicts
  const isRecurring = (values.customMode && Number(values.customDuration) > 1) || (!values.customMode && values.duration && [3, 7, 14, 21].includes(values.duration));
  const recurringConflicts = React.useMemo(() => {
    if (values.selectedTherapists.length > 0 && values.startDate && values.timeSlot && isRecurring) {
      const days = values.customMode ? Number(values.customDuration) : (values.duration ?? 1);
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
  }, [appointments, values.startDate, values.timeSlot, values.selectedTherapists, values.customMode, values.customDuration, values.duration, isRecurring]);

  // Validation logic 
  const isValid = () => {
    if (!values.selectedPatient || !values.selectedTherapy || values.selectedTherapists.length === 0 || !values.startDate || !values.timeSlot || (!values.duration && !(values.customMode && !!values.customDuration && Number(values.customDuration) > 0))) {
      return false;
    }
    // Ensure values.selectedPatient and values.selectedRoom are never null or undefined
    const clientId = values.selectedPatient ? values.selectedPatient : '';
    const roomId = values.selectedRoom ? values.selectedRoom : '';
    // Check for any slot in the series being in the past or unresolved
    const daysToBook = values.customMode ? Number(values.customDuration) : (values.duration ?? 1);
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
    const days = values.customMode ? Number(values.customDuration) : (values.duration ?? 1);
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
                <TouchableOpacity onPress={() => setMatrixDate(format(addDays(parseISO(matrixDate), -1), 'yyyy-MM-dd'))}>
                  <Text style={{ fontSize: 28 }}>‹</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 }}>{matrixDate}</Text>
                <TouchableOpacity onPress={() => setMatrixDate(format(addDays(parseISO(matrixDate), 1), 'yyyy-MM-dd'))}>
                  <Text style={{ fontSize: 28 }}>›</Text>
                </TouchableOpacity>
              </View>
              {matrix && matrix.length > 0 ? (
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
                  selectedDate={values.startDate}
                  selectedTherapists={values.selectedTherapists}
                  selectedSlot={{ id: values.selectedRoom || '', slot: values.timeSlot || '' }}
                  recommendedSlots={recommendedSlots}
                  onSlotSelect={(roomId: string, slot: string, date: string) => {
                    setSelectedRoom(roomId);
                    setTimeSlot(slot);
                    setStartDate(date);
                  }}
                  therapists={therapists}
                  onCreateSlot={handleCreateSlot}
                  highlightedSlot={{ slotStart: values.timeSlot || '', slotRoom: values.selectedRoom || '' }}
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
                onClose={() => setDrawerVisible(false)}
                onSubmit={(appointment) => {
                  if (props.onCreate) {
                    props.onCreate(appointment);
                  }
                  setDrawerVisible(false);
                }}
                client={drawerForm.client}
                therapy={drawerForm.therapy}
                onTherapyChange={therapy => setDrawerForm((f: DrawerForm) => ({ ...f, therapy }))}
                date={drawerForm.date}
                time={drawerForm.time}
                onDateChange={date => setDrawerForm((f: DrawerForm) => ({ ...f, date }))}
                onTimeChange={time => setDrawerForm((f: DrawerForm) => ({ ...f, time }))}
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
