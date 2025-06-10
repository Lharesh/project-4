// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (NewAppointmentModal).
// This is a strict project rule for appointments.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTherapyAppointmentFormV2, TherapyAppointmentFormValues } from '../helpers/useTherapyAppointmentFormV2';
import * as validationUtils from '@/hooks/validationUtils';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import styles, { pickerSelectStyles } from './TherapyAppointments.styles';
import ScheduleMatrix from '../components/ScheduleMatrix';
import type { Client } from '@/features/clients/clientsSlice';
import { buildScheduleMatrix } from './buildScheduleMatrix';
import { getRecurringConflicts } from '../helpers/conflictCalculations';
import { getRecurringSlotAlternatives } from '../helpers/recurringSlotAlternatives';
import { format, parseISO, addDays } from 'date-fns';
import { safeFormatDate } from '../helpers/dateHelpers';
import { isSlotInPast } from '../helpers/isSlotInPast';
import type { Therapist, Room } from '../helpers/availabilityUtils'; // Assuming Room is defined here or provide a local type
import { filterTherapistsByGender, getBookingOptions } from '../helpers/rulesEngine';
import { addDynamicAvailability } from '../helpers/dynamicAvailability';
import { useLocalSearchParams } from 'expo-router';
import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';
import { router } from 'expo-router';
import BookingModalPanel from '../components/BookingModalPanel';
import BookingForm from '../components/BookingForm';
import { APPOINTMENT_STATUS } from '../constants/status';
import CancelAppointmentDialog from '../components/CancelAppointmentDialog';
import { useAppDispatch } from '@/redux/hooks';
import { cancelAndShiftSeries, completeAppointment } from '../appointmentsSlice';
import { Platform, Alert } from 'react-native';

console.log('TherapyAppointments file loaded');

type SlotInfo = {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
};
interface DrawerForm {
  client: { id: string; name: string; mobile: string };
  therapy: string;
  room: string;
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
  onCancelAppointment?: (appointmentId: string) => void;
}

const initialTherapyFormValues: TherapyAppointmentFormValues = {
  selectedPatient: '',
  selectedTherapy: '',
  selectedTherapists: [],
  startDate: '',
  timeSlot: '',
  selectedRoom: '',
  duration: null, // Default to null, forcing user to select or use custom
  notes: '',
  customDays: null, // For custom duration input
};

const TherapyAppointments: React.FC<TherapyAppointmentsProps> = (props) => {
  console.log('[TherapyAppointments] onCancelAppointment prop:', typeof props.onCancelAppointment, props.onCancelAppointment);
  console.log('[TherapyAppointments] appointments prop:', props.appointments);
  console.log('TherapyAppointments component rendered');
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
    onCancelAppointment,
  } = props;

  // Add debug logs for all initialClient* values and showBookingModal
  console.log('[TherapyAppointments] Params:', {
    initialClientId,
    initialClientName,
    initialClientPhone,
    initialSlotStart,
    initialSlotEnd,
    initialRoomId,
    initialDate
  });

  // Defensive: fallback to empty array if therapists is undefined
  const safeTherapists = Array.isArray(therapists) ? therapists : [];

  // Defensive: ensure all arrays are always arrays
  const safeClients = Array.isArray(clients) ? clients : [];
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeTherapies = Array.isArray(therapies) ? therapies : [];

  // Initialize router params hook early
  const params = useLocalSearchParams();

  // Memoized initial values for the custom hook
  const memoizedInitialValues = React.useMemo(() => ({
    ...initialTherapyFormValues,
    selectedPatient: (params.clientId as string) || initialTherapyFormValues.selectedPatient,
    startDate: (params.date as string) || initialTherapyFormValues.startDate,
    timeSlot: (params.slotStart as string) || initialTherapyFormValues.timeSlot,
    selectedRoom: (params[APPOINTMENT_PARAM_KEYS.ROOM_ID] as string) || initialTherapyFormValues.selectedRoom,
  }), [params.clientId, params.date, params.slotStart, params[APPOINTMENT_PARAM_KEYS.ROOM_ID]]);

  // Use ONLY the custom hook for form state
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
    setCustomDays,
  } = useTherapyAppointmentFormV2({
    initialValues: memoizedInitialValues, // use your memoized version for stability
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

  // Find the selected patient object and therapy object for easy access (AFTER hook initialization)
  const selectedPatientObj = React.useMemo(() =>
    clients.find(c => c.id === values.selectedPatient),
    [clients, values.selectedPatient]
  );
  const selectedTherapyObj = React.useMemo(() =>
    therapies.find(t => t.id === values.selectedTherapy),
    [therapies, values.selectedTherapy]
  );

  // Default slot duration is from selected therapy or 60 minutes (AFTER hook initialization)
  const slotDuration = React.useMemo(() =>
    selectedTherapyObj ? selectedTherapyObj.duration : 60,
    [selectedTherapyObj]
  );

  const matrixDate = useMemo(() => values?.startDate || safeFormatDate(new Date(), 'yyyy-MM-dd'), [values.startDate]);
  const therapistsWithAvailability = useMemo(() => addDynamicAvailability({
    entities: safeTherapists,
    entityType: 'therapist',
    date: matrixDate, // Use the defined matrixDate
    appointments: safeAppointments,
    clinicTimings,
    slotDuration,
  }), [safeTherapists, matrixDate, safeAppointments, clinicTimings, slotDuration]);

  const roomsWithAvailability = useMemo(() => addDynamicAvailability({
    entities: safeRooms,
    entityType: 'room',
    date: matrixDate, // Use the defined matrixDate
    appointments: safeAppointments,
    clinicTimings,
    slotDuration,
  }), [safeRooms, matrixDate, safeAppointments, clinicTimings, slotDuration]);

  // Calculate recurring conflicts for the schedule matrix (moved here after all dependencies are declared)
  const recurringConflicts = useMemo(() => {
    if (!values.startDate || !values.timeSlot || values.selectedTherapists.length === 0) {
      return [];
    }
    return getRecurringConflicts(
      safeAppointments,
      matrixDate, // This is values.startDate or today
      1, // Check for conflicts on the selected day only for now
      String(values.timeSlot), // Ensure string type
      values.selectedTherapists.map(String), // Ensure array of strings
      (dateStr, numDays) => format(addDays(parseISO(dateStr), numDays), 'yyyy-MM-dd')
    );
  }, [safeAppointments, matrixDate, values.timeSlot, values.selectedTherapists, addDays, format, parseISO]);
  const [showRoomSelection, setShowRoomSelection] = React.useState(false);
  const [drawerError, setDrawerError] = React.useState<string | undefined>(undefined);
  const handleRoomChange = (roomId: string) => setSelectedRoom(roomId);

  // Other state variables
  const [appointmentsToCreate, setAppointmentsToCreate] = React.useState<any[]>([]);
  const [recommendedSlots, setRecommendedSlots] = React.useState<any[]>([]);
  const [showAlternatives, setShowAlternatives] = React.useState(false);
  const [replacementSlots, setReplacementSlots] = React.useState<Record<string, string>>({});
  const [clientGender, setClientGender] = React.useState<string | null>(null);

  // --- Replace with useMemo for availableRooms ---
  const availableRooms = useMemo(() => {
    return roomsWithAvailability || [];
  }, [roomsWithAvailability]);

  // --- Replace with useMemo for availableTherapists ---
  const availableTherapists = useMemo(() => {
    let finalTherapists = therapistsWithAvailability || [];
    const currentPatient = safeClients.find(c => c.id === values.selectedPatient);
    const currentPatientGender = currentPatient?.gender;
    if (enforceGenderMatch && currentPatientGender && Array.isArray(finalTherapists)) {
      finalTherapists = filterTherapistsByGender(finalTherapists, currentPatientGender, true);
    }
    return finalTherapists;
  }, [therapistsWithAvailability, safeClients, values.selectedPatient, enforceGenderMatch]);

  // --- Automatically open drawer if autoOpenDrawer and valid client info ---
  // --- Handler for slot creation (used in ScheduleMatrix) ---
  const handleCreateSlot = (slotInfo: any) => {
    const {
      roomId,
      date,
      startTime,
      endTime,
      duration,
      clientId,
      clientName,
      clientMobile,
      therapyId,
      availableTherapists,
      customDays,
    } = slotInfo || {};

    // Prefill all relevant drawer values
    setValues((prev: any) => ({
      ...prev,
      selectedPatient: clientId || '',
      patientName: clientName || '',
      patientMobile: clientMobile || '',
      startDate: date || '',
      timeSlot: startTime || '',
      selectedTherapy: therapyId || '',
      selectedTherapists: [],
      selectedRoom: roomId || '',
      duration: duration || 60,
      customDays: customDays || '',
      notes: '',
      // drawerMode: 'create', // if you use a mode flag
      // appointmentType: 'therapy', // if you support multiple types
    }));

    // Use param constants for navigation
    router.push({
      pathname: '/(app)/clients',
      params: {
        [APPOINTMENT_PARAM_KEYS.SLOT_START]: startTime,
        [APPOINTMENT_PARAM_KEYS.SLOT_END]: endTime,
        [APPOINTMENT_PARAM_KEYS.ROOM_NUMBER]: roomId,
        slotRoom: roomId,
        [APPOINTMENT_PARAM_KEYS.DATE]: date,
        ...(clientId && { [APPOINTMENT_PARAM_KEYS.CLIENT_ID]: clientId }),
        ...(clientName && { [APPOINTMENT_PARAM_KEYS.CLIENT_NAME]: clientName }),
        ...(clientMobile && { [APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE]: clientMobile }),
        select: 1, // triggers client selection
        new: 1,    // signals to open the drawer for a new appointment
        t: Date.now(), // ensures navigation uniqueness
        tab: 'Therapy',
      }
    });

    // Delay opening the drawer so form state is updated first (if needed)
    // setTimeout(() => setDrawerVisible(true), 0);
  };

  // --- STATE and handlers (existing logic follows here) ---
  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handler: Therapy change
  const handleTherapyChange = (therapyId: string) => {
    setValues((prev: any) => ({
      ...prev,
      selectedTherapy: therapyId,
    }));
  };

  // Handler: Date change
  const handleDateChange = (date: string) => {
    setValues((prev: any) => ({
      ...prev,
      startDate: date,
    }));
  };

  // Handler: Time change
  const handleTimeChange = (time: string) => {
    setValues((prev: any) => ({
      ...prev,
      timeSlot: time,
    }));
  };

  // Handler: Duration change
  const handleDurationChange = (newDuration: string | number | null) => {
    // The 'duration' prop for chips in Drawer sends string ('1', '3', 'Cust')
    // The hook's setDuration expects number | null
    // The form's values.duration is number | null

    if (newDuration === 'Cust') {
      setDuration(null); // Or a specific number like 0 or -1 to indicate custom, if preferred by form logic
      // For now, setting to null and relying on customDays
      // When 'Cust' is selected, customDays will be set via onCustomDaysChange
    } else if (typeof newDuration === 'string') {
      const numericDuration = parseInt(newDuration, 10);
      setDuration(isNaN(numericDuration) ? null : numericDuration);
    } else {
      setDuration(newDuration); // Handles number or null directly
    }

    // If 'Cust' is chosen, also clear customDays unless it's being actively set
    // This part is tricky: if user clicks 'Cust', then types, customDays is set.
    // If user clicks 'Cust', then clicks '7d', customDays should ideally be cleared or ignored.
    // For now, let `handleBookAppointments` logic handle which field to read.
  };

  // Handler: Therapist toggle
  const handleTherapistToggle = (therapistId: string) => {
    setValues((prev: any) => {
      const selected = prev.selectedTherapists || [];
      const exists = selected.includes(therapistId);
      return {
        ...prev,
        selectedTherapists: exists
          ? selected.filter((id: string) => id !== therapistId)
          : [...selected, therapistId],
      };
    });
  };

  // Handler: Notes change
  const handleNotesChange = (notes: string) => {
    setValues((prev: any) => ({
      ...prev,
      notes,
    }));
  };

  React.useEffect(() => {
    // Only open drawer if router params for slot and client are present and tab is Therapy
    const slotStart = params[APPOINTMENT_PARAM_KEYS.SLOT_START] as string | undefined;
    const slotEnd = params[APPOINTMENT_PARAM_KEYS.SLOT_END] as string | undefined;
    const roomId = params[APPOINTMENT_PARAM_KEYS.ROOM_NUMBER] as string | undefined;
    const date = params[APPOINTMENT_PARAM_KEYS.DATE] as string | undefined;
    const clientId = params[APPOINTMENT_PARAM_KEYS.CLIENT_ID] as string | undefined;
    const clientName = params[APPOINTMENT_PARAM_KEYS.CLIENT_NAME] as string | undefined;
    const clientMobile = params[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] as string | undefined;
    const tab = params.tab as string | undefined;
    if (
      tab === 'Therapy' &&
      slotStart && slotEnd && roomId && date && clientId &&
      (!showRoomSelection ||
        values.selectedPatient !== clientId ||
        values.timeSlot !== slotStart ||
        values.startDate !== date)
    ) {
      setValues((prev: any) => ({
        ...prev,
        selectedPatient: clientId,
        patientName: clientName || '',
        patientMobile: clientMobile || '',
        startDate: date,
        timeSlot: slotStart,
        selectedRoom: roomId,
        // ...other fields as needed
      }));
      setShowRoomSelection(true);
    }
  }, [
    params[APPOINTMENT_PARAM_KEYS.SLOT_START],
    params[APPOINTMENT_PARAM_KEYS.SLOT_END],
    params[APPOINTMENT_PARAM_KEYS.ROOM_NUMBER],
    params[APPOINTMENT_PARAM_KEYS.DATE],
    params[APPOINTMENT_PARAM_KEYS.CLIENT_ID],
    params[APPOINTMENT_PARAM_KEYS.CLIENT_NAME],
    params[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE],
    params.tab,
    therapists,
    showRoomSelection,
    values.selectedPatient,
    values.timeSlot,
    values.startDate, // Added startDate as it affects matrixDate which is a dependency
  ]);

  const matrix = useMemo(() => {
    if (!matrixDate || !safeAppointments || !safeRooms || !safeTherapists || !clinicTimings || !safeClients) {
      return []; // Return empty if essential data is missing
    }
    console.log('[TherapyAppointments] safeAppointments:', safeAppointments);
    return buildScheduleMatrix(
      matrixDate,
      safeAppointments,
      safeRooms,
      safeTherapists,
      clinicTimings,
      enforceGenderMatch,
      clientGender || undefined, // Ensure undefined if null for buildScheduleMatrix
      selectedTherapyObj?.duration || 60, // Default to 60 if therapy duration not found
      safeClients
    );
  }, [matrixDate, safeAppointments, safeRooms, safeTherapists, clinicTimings, enforceGenderMatch, clientGender, selectedTherapyObj, safeClients]);

  // Callback to get recurring slot information, used by ScheduleMatrix and potentially other components
  const getRecurringSlotInfo = useCallback((date: string, slot: string, roomId: string) => {
    if (!values.selectedPatient || !values.selectedTherapists || !selectedTherapyObj) return {};

    return getRecurringSlotAlternatives({
      enforceGenderMatch,
      startDate: date,
      days: Number(values.duration ?? values.customDays ?? 1),
      requestedSlot: slot,
      selectedTherapists: values.selectedTherapists,
      appointments: safeAppointments,
      selectedRoom: roomId,
      clientId: values.selectedPatient,
      allTherapists: therapistsWithAvailability, // Already memoized
      allRooms: roomsWithAvailability, // Already memoized
      clients: safeClients,
      now: new Date()
      // clinicTimings, therapyDuration, and clientGender are handled internally by getRecurringSlotAlternatives
    });
  }, [
    values.selectedPatient,
    values.selectedTherapists,
    values.duration,
    values.customDays,
    selectedTherapyObj,
    safeAppointments,
    therapistsWithAvailability,
    roomsWithAvailability,
    safeClients,
    enforceGenderMatch,
  ]);

  // Normalization helper
  function normalizeAppointments(appts: any[]): any[] {
    return (appts || []).reduce((acc: any[], appt: any) => {
      const slot = appt.slot || appt[APPOINTMENT_PARAM_KEYS.SLOT_START] || appt.time || appt.startTime || '';
      const durationRaw = appt.duration || appt[APPOINTMENT_PARAM_KEYS.DURATION] || 60;
      const duration = Number(durationRaw);
      if (!slot || isNaN(duration)) {
        console.warn('[normalizeAppointments] Skipping appointment missing slot or duration:', appt);
        return acc;
      }
      return [...acc, { ...appt, slot, duration }];
    }, []);
  }

  // Strict conflict check using getBookingOptions - this sets recommendedSlots and showAlternatives
  useEffect(() => {
    const formIsComplete =
      values.selectedPatient &&
      values.selectedTherapy &&
      Array.isArray(values.selectedTherapists) && values.selectedTherapists.length > 0 &&
      values.startDate &&
      values.timeSlot &&
      values.selectedRoom;

    if (!formIsComplete) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }

    const normalizedAppointments = normalizeAppointments(safeAppointments);
    console.log('[getBookingOptions] Input normalizedAppointments:', normalizedAppointments);
    console.log('[getBookingOptions] Input params:', {
      enforceGenderMatch,
      clientId: values.selectedPatient || '',
      selectedTherapists: values.selectedTherapists,
      selectedRoom: values.selectedRoom || '',
      date: values.startDate,
      slot: values.timeSlot,
      slotDuration: selectedTherapyObj?.duration || slotDuration || 60,
    });
    const bookingOptions = getBookingOptions({
      enforceGenderMatch,
      clientId: values.selectedPatient || '',
      selectedTherapists: values.selectedTherapists,
      selectedRoom: values.selectedRoom || '',
      date: values.startDate,
      slot: values.timeSlot,
      appointments: normalizedAppointments,
      allTherapists: therapistsWithAvailability, // Use memoized version
      allRooms: roomsWithAvailability, // Use memoized version
      clients: safeClients,
      now: new Date(),
      maxAlternatives: 3,
      slotDuration: selectedTherapyObj?.duration || slotDuration || 60,
    });
    console.log('[getBookingOptions] Output:', bookingOptions);

    if (bookingOptions && bookingOptions.length > 0 && !bookingOptions[0]?.available) {
      setRecommendedSlots(bookingOptions[0]?.alternatives || []);
      setShowAlternatives(true);
    } else if (bookingOptions && bookingOptions.length > 0 && bookingOptions[0]?.available) {
      setRecommendedSlots([]); // Slot is available, no alternatives needed
      setShowAlternatives(false);
    } else {
      setRecommendedSlots([]); // Default to no recommendations if bookingOptions is empty or malformed
      setShowAlternatives(false);
    }
  }, [
    values.selectedPatient,
    values.selectedTherapy,
    values.selectedTherapists,
    values.startDate,
    values.timeSlot,
    values.selectedRoom,
    safeAppointments,
    therapistsWithAvailability,
    roomsWithAvailability,
    safeClients,
    enforceGenderMatch,
    selectedTherapyObj,
    slotDuration,
  ]);

  const isValid = () => {
    const safeSelectedTherapists = Array.isArray(values.selectedTherapists) ? values.selectedTherapists : [];
    if (
      !values.selectedPatient ||
      !values.selectedTherapy ||
      safeSelectedTherapists.length === 0 ||
      !values.startDate ||
      !values.timeSlot ||
      !values.duration
    ) {
      return false;
    }

    const clientId = values.selectedPatient || '';
    const roomId = values.selectedRoom || '';
    const daysToBook = Number(values.duration ?? 1);
    const now = new Date();

    for (let i = 0; i < daysToBook; i++) {
      const dateVal = format(addDays(parseISO(values.startDate), i), 'yyyy-MM-dd');
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
        maxAlternatives: 3,
        slotDuration: selectedTherapyObj?.duration || slotDuration || 60,
      };
      const bookingOptionsResult = getBookingOptions(bookingOptionsInput);
      if (!bookingOptionsResult[0]?.available) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const formIsComplete =
      values.selectedPatient &&
      values.selectedTherapy &&
      Array.isArray(values.selectedTherapists) && values.selectedTherapists.length > 0 &&
      values.startDate &&
      values.timeSlot &&
      values.selectedRoom;

    if (!formIsComplete) {
      setRecommendedSlots([]);
      setShowAlternatives(false);
      return;
    }

    const normalizedAppointments = normalizeAppointments(safeAppointments);
    const bookingOptions = getBookingOptions({
      enforceGenderMatch,
      clientId: values.selectedPatient || '',
      selectedTherapists: values.selectedTherapists,
      selectedRoom: values.selectedRoom || '',
      date: values.startDate,
      slot: values.timeSlot,
      appointments: normalizedAppointments,
      allTherapists: therapists,
      allRooms: rooms,
      clients: clients,
      now: new Date(),
      maxAlternatives: 3,
      slotDuration: selectedTherapyObj?.duration || slotDuration || 60,
    });

    if (!bookingOptions[0]?.available) {
      setRecommendedSlots(bookingOptions[0]?.alternatives || []);
      setShowAlternatives(true);
    } else {
      setRecommendedSlots([]);
      setShowAlternatives(false);
    }
  }, [
    values.selectedPatient,
    values.selectedTherapy,
    values.selectedTherapists,
    values.startDate,
    values.timeSlot,
    values.selectedRoom,
    safeAppointments,
    therapists,
    rooms,
    clients,
    selectedTherapyObj,
    slotDuration,
  ]);

  const handleBookAppointments = (formValues: any) => {
    try {
      // Auto-assign room and therapists if not selected
      let selectedRoom = formValues.selectedRoom;
      let selectedTherapists = formValues.selectedTherapists;
      // Find available therapists and rooms for the selected slot
      const availableTherapistsForSlot = availableTherapists;
      const availableRoomsForSlot = availableRooms;
      let autoAssigned = false;
      if (!selectedRoom && availableRoomsForSlot.length > 0) {
        selectedRoom = availableRoomsForSlot[0].id;
        autoAssigned = true;
      }
      if ((!selectedTherapists || selectedTherapists.length === 0) && availableTherapistsForSlot.length > 0) {
        selectedTherapists = [availableTherapistsForSlot[0].id];
        autoAssigned = true;
      }
      if (autoAssigned) {
        setDrawerError('Therapist and/or room auto-assigned from available options.');
      }
      let daysToBook = 0;
      if (formValues.duration === null && formValues.customDays) {
        daysToBook = Number(formValues.customDays);
      } else if (formValues.duration !== null) {
        daysToBook = Number(formValues.duration);
      } else {
        daysToBook = 1; // Default to 1 if somehow both are null/invalid
      }
      if (isNaN(daysToBook) || daysToBook <= 0) {
        setDrawerError('Invalid number of days for booking.');
        return;
      }
      const currentSelectedTherapyObj = therapies.find(t => t.id === formValues.selectedTherapy);
      const slotString = formValues.timeSlot;
      const roomObj = safeRooms.find((r: any) => r.id === selectedRoom);
      const therapyDuration = currentSelectedTherapyObj?.duration || slotDuration || 60;
      if (!slotString || typeof slotString !== 'string' || !slotString.match(/^[0-9]{2}:[0-9]{2}$/)) {
        setDrawerError('Invalid time slot format. Expected HH:MM.');
        return;
      }
      let dateObj;
      try {
        if (!formValues.startDate || typeof formValues.startDate !== 'string' || !formValues.startDate.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/)) {
          throw new Error('Invalid startDate format. Expected YYYY-MM-DD.');
        }
        dateObj = parseISO(formValues.startDate);
      } catch (error: any) {
        setDrawerError(error.message || 'Invalid start date format.');
        return;
      }
      const startTimeObj = new Date(dateObj);
      const [hours, minutesValue] = slotString.split(':').map(Number);
      startTimeObj.setHours(hours, minutesValue, 0, 0);
      const endTimeObj = new Date(startTimeObj.getTime() + therapyDuration * 60000);
      const formattedEndTime = `${String(endTimeObj.getHours()).padStart(2, '0')}:${String(endTimeObj.getMinutes()).padStart(2, '0')}`;
      const appointment = {
        id: `${formValues.selectedPatient}_${selectedTherapists.join('_')}_${selectedRoom}_${safeFormatDate(dateObj, 'yyyy-MM-dd')}_${slotString}`,
        [APPOINTMENT_PARAM_KEYS.CLIENT_ID]: formValues.selectedPatient,
        [APPOINTMENT_PARAM_KEYS.CLIENT_NAME]: safeClients.find(c => c.id === formValues.selectedPatient)?.name || '',
        [APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE]: formValues.clientMobile || selectedPatientObj?.mobile || '',
        therapistIds: selectedTherapists,
        therapistNames: selectedTherapists.map((id: string) => (safeTherapists.find((t: Therapist) => t.id === id)?.name || id)),
        [APPOINTMENT_PARAM_KEYS.TREATMENT_ID]: formValues.selectedTherapy,
        [APPOINTMENT_PARAM_KEYS.TREATMENT_NAME]: currentSelectedTherapyObj?.name || '',
        [APPOINTMENT_PARAM_KEYS.ROOM_ID]: selectedRoom,
        roomId: selectedRoom,
        roomNumber: selectedRoom,
        roomName: roomObj?.name || '',
        [APPOINTMENT_PARAM_KEYS.DATE]: safeFormatDate(dateObj, 'yyyy-MM-dd'),
        [APPOINTMENT_PARAM_KEYS.TIME]: slotString,
        startTime: slotString,
        endTime: formattedEndTime,
        [APPOINTMENT_PARAM_KEYS.DURATION]: therapyDuration,
        totalDays: daysToBook,
        notes: formValues.notes || '',
        [APPOINTMENT_PARAM_KEYS.STATUS]: APPOINTMENT_STATUS.SCHEDULED,
        [APPOINTMENT_PARAM_KEYS.TAB]: 'Therapy',
        [APPOINTMENT_PARAM_KEYS.SLOT_START]: slotString,
        slot: slotString, // for matrix matching
        createdAt: new Date().toISOString(),
      };
      // Final validation: check for slot conflict for the first day only
      const bookingOptions = getBookingOptions({
        date: appointment.date,
        slot: appointment.startTime,
        clientId: appointment.clientId,
        selectedTherapists: appointment.therapistIds,
        selectedRoom: appointment.roomNumber,
        appointments: normalizeAppointments(safeAppointments),
        allTherapists: safeTherapists,
        allRooms: safeRooms,
        clients: safeClients,
        now: new Date(),
        enforceGenderMatch,
        maxAlternatives: 3,
        slotDuration: appointment.duration,
      });
      if (!bookingOptions[0]?.available) {
        setDrawerError(bookingOptions[0]?.reason || 'Slot is not available.');
        return;
      }
      if (typeof onCreate === 'function') {
        onCreate(appointment);
      }
      resetForm();
    } catch (e) {
      setDrawerError('Unexpected error while booking.');
      throw e;
    }
  };

  // Loosen the showBookingModal condition
  const showBookingModal = Boolean(initialClientId && initialSlotStart && initialRoomId && initialDate);
  console.log('[TherapyAppointments] showBookingModal:', showBookingModal);

  // Prepare initial values for BookingForm
  const bookingFormInitialValues = React.useMemo(() => ({
    selectedPatient: initialClientId,
    startDate: initialDate,
    timeSlot: initialSlotStart,
    selectedRoom: initialRoomId,
    selectedTherapy: '',
    selectedTherapists: [],
    duration: null,
    notes: '',
    customDays: null,
    clientName: initialClientName,
    clientMobile: initialClientPhone,
    clientId: initialClientId,
  }), [initialClientId, initialDate, initialSlotStart, initialRoomId, initialClientName, initialClientPhone]);

  console.log('Show Booking Modal:', showBookingModal);
  console.log('Booking Form Initial Values:', bookingFormInitialValues);

  // Handler to close booking modal and return to new appointment modal
  const handleCancelBooking = React.useCallback(() => {
    resetForm();
    if (onClose) onClose();
    // Navigate to new appointment modal with therapy tab
    router.replace({ pathname: '/appointments/new', params: { tab: 'Therapy' } });
  }, [resetForm, onClose]);

  // Log appointments prop and derived values on every update
  React.useEffect(() => {
    console.log('[TherapyAppointments] appointments prop changed:', appointments);
    console.log('[TherapyAppointments] safeTherapists:', safeTherapists);
    console.log('[TherapyAppointments] safeRooms:', safeRooms);
    console.log('[TherapyAppointments] matrix:', matrix);
  }, [appointments, safeTherapists, safeRooms, matrix]);

  const dispatch = useAppDispatch();
  // State for cancel dialog
  const [cancelDialog, setCancelDialog] = React.useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null });

  // Handler to open cancel dialog (called from slot or card)
  const handleOpenCancelDialog = (appointmentId: string) => {
    const appt = props.appointments.find((a: any) => a.id === appointmentId);
    setCancelDialog({ open: true, appointment: appt });
  };

  // Handler for reschedule: navigates to the reschedule overlay route
  const handleRescheduleAppointment = (booking: any) => {
    if (booking && booking.id) {
      router.push({ pathname: '/appointments/reschedule', params: { appointmentId: booking.id } });
    }
  };

  // Handler for Mark Complete
  const handleCompleteAppointment = useCallback((booking: any) => {
    // Validate: only allow if current time > slot start time
    const now = new Date();
    const slotDate = new Date(`${booking[APPOINTMENT_PARAM_KEYS.DATE]}T${booking[APPOINTMENT_PARAM_KEYS.TIME] || booking.startTime || booking.slot}`);
    if (now < slotDate) {
      if (Platform.OS === 'web') {
        window.alert('Cannot mark as completed before the appointment start time.');
      } else {
        Alert.alert('Error', 'Cannot mark as completed before the appointment start time.');
      }
      return;
    }
    // Only mark the selected slot as completed (even in a series)
    dispatch(completeAppointment(booking.id));
    if (Platform.OS === 'web') {
      window.alert('Appointment marked as completed.');
    } else {
      Alert.alert('Success', 'Appointment marked as completed.');
    }
  }, [dispatch]);

  return (
    <React.Fragment>
      <ScrollView contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* General Error Display */}
        {error && typeof error === 'string' && (
          <View style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#ffebee', borderRadius: 4, marginVertical: 10 }}>
            <Text style={[styles.errorText, { textAlign: 'center' }]}>{error}</Text>
          </View>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setStartDate(format(addDays(parseISO(matrixDate), -1), 'yyyy-MM-dd'))}>
            <Text style={{ fontSize: 28 }}>‹</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginHorizontal: 16 }}>{matrixDate}</Text>
          <TouchableOpacity onPress={() => setStartDate(format(addDays(parseISO(matrixDate), 1), 'yyyy-MM-dd'))}>
            <Text style={{ fontSize: 28 }}>›</Text>
          </TouchableOpacity>
        </View>
        {/* Schedule Matrix */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
          <View style={styles.matrixContainer}>
            {matrix.length > 0 ? (
              <ScheduleMatrix
                matrix={matrix}
                conflicts={recurringConflicts}
                therapists={therapistsWithAvailability}
                onSlotSelect={(roomId: string, time: string, date: string) => {
                  console.log('Slot selected in TherapyAppointments:', { roomId, time, date });
                  handleChange('timeSlot', time);
                  handleChange('selectedRoom', roomId);
                  handleChange('startDate', date);
                }}
                selectedTherapists={values.selectedTherapists}
                selectedDate={matrixDate}
                onCreateSlot={handleCreateSlot}
                onCancelAppointment={handleOpenCancelDialog}
                onRescheduleAppointment={handleRescheduleAppointment}
                onCompleteAppointment={handleCompleteAppointment}
                onCloseModal={onClose}
              />
            ) : (
              <Text>No matrix data available.</Text>
            )}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Booking Modal Panel */}
      <BookingModalPanel visible={showBookingModal} onClose={onClose}>
        <BookingForm
          initialValues={bookingFormInitialValues}
          therapies={safeTherapies}
          availableRooms={safeRooms}
          availableTherapists={safeTherapists}
          onSubmit={handleBookAppointments}
          genderFlag={enforceGenderMatch}
          clientGender={selectedPatientObj?.gender || ''}
          error={drawerError}
          onCancel={handleCancelBooking}
        />
      </BookingModalPanel>

      {/* Cancel Appointment Dialog (cross-platform) */}
      <CancelAppointmentDialog
        visible={cancelDialog.open}
        appointmentInfo={cancelDialog.appointment ? {
          clientName: cancelDialog.appointment.clientName,
          date: cancelDialog.appointment.date,
          time: cancelDialog.appointment.startTime || cancelDialog.appointment.time,
        } : undefined}
        onClose={() => setCancelDialog({ open: false, appointment: null })}
        onCancel={() => {
          if (cancelDialog.appointment) {
            dispatch(cancelAndShiftSeries({ appointmentId: cancelDialog.appointment.id }));
          }
          setCancelDialog({ open: false, appointment: null });
        }}
        onPush={() => {
          if (cancelDialog.appointment) {
            dispatch(cancelAndShiftSeries({ appointmentId: cancelDialog.appointment.id, push: true }));
          }
          setCancelDialog({ open: false, appointment: null });
        }}
        onCancelAll={() => {
          if (cancelDialog.appointment) {
            dispatch(cancelAndShiftSeries({ appointmentId: cancelDialog.appointment.id, cancelAll: true }));
          }
          setCancelDialog({ open: false, appointment: null });
        }}
      />
    </React.Fragment>
  );
};

export default TherapyAppointments;
