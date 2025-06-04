// Moved to helpers/appointments as appointment-specific helper
import { useGenericForm } from '@/hooks/useGenericForm';
import { useCallback } from 'react';

// Types for therapy appointment form values
export interface TherapyAppointmentFormValues {
  selectedPatient: string | null;
  selectedTherapy: string | null;
  selectedTherapists: string[];
  startDate: string;
  timeSlot: string;
  selectedRoom: string | null;
  duration: number | null;
  notes: string;
  customDays: string | null; // Added for custom duration input
}

export function useTherapyAppointmentFormV2({
  initialValues,
  validate,
  onSubmit,
}: {
  initialValues: TherapyAppointmentFormValues;
  validate: (values: TherapyAppointmentFormValues) => string | null;
  onSubmit: (values: TherapyAppointmentFormValues) => void;
}) {
  // Ensure initialValues includes customDays, defaulting to null if not provided
  const fullInitialValues = {
    ...initialValues,
    customDays: initialValues.customDays === undefined ? null : initialValues.customDays,
  };
  // Use the generic form hook
  const form = useGenericForm<TherapyAppointmentFormValues>({
    initialState: fullInitialValues,
    validate,
    onSubmit,
  });

  // Convenience setters for each field (optional, for easier integration)
  const setSelectedPatient = useCallback(
    (val: string | null) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, selectedPatient: val })),
    [form]
  );
  const setSelectedTherapy = useCallback(
    (val: string | null) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, selectedTherapy: val })),
    [form]
  );
  const setSelectedTherapists = useCallback(
    (val: string[]) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, selectedTherapists: val })),
    [form]
  );
  const setStartDate = useCallback(
    (val: string) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, startDate: val })),
    [form]
  );
  const setTimeSlot = useCallback(
    (val: string) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, timeSlot: val })),
    [form]
  );
  const setSelectedRoom = useCallback(
    (val: string | null) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, selectedRoom: val })),
    [form]
  );
  const setDuration = useCallback(
    (val: number | null) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, duration: val })),
    [form]
  );
  const setNotes = useCallback(
    (val: string) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, notes: val })),
    [form]
  );
  const setCustomDays = useCallback(
    (val: string | null) => form.setValues((v: TherapyAppointmentFormValues) => ({ ...v, customDays: val })),
    [form]
  );

  return {
    ...form,
    setSelectedPatient,
    setSelectedTherapy,
    setSelectedTherapists,
    setStartDate,
    setTimeSlot,
    setSelectedRoom,
    setDuration,
    setNotes,
    setCustomDays,
  };
}
