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
  customDuration: string;
  customMode: boolean;
  notes: string;
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
  // Use the generic form hook
  const form = useGenericForm<TherapyAppointmentFormValues>({
    initialState: initialValues,
    validate,
    onSubmit,
  });

  // Convenience setters for each field (optional, for easier integration)
  const setSelectedPatient = useCallback(
    (val: string | null) => form.setValues(v => ({ ...v, selectedPatient: val })),
    [form]
  );
  const setSelectedTherapy = useCallback(
    (val: string | null) => form.setValues(v => ({ ...v, selectedTherapy: val })),
    [form]
  );
  const setSelectedTherapists = useCallback(
    (val: string[]) => form.setValues(v => ({ ...v, selectedTherapists: val })),
    [form]
  );
  const setStartDate = useCallback(
    (val: string) => form.setValues(v => ({ ...v, startDate: val })),
    [form]
  );
  const setTimeSlot = useCallback(
    (val: string) => form.setValues(v => ({ ...v, timeSlot: val })),
    [form]
  );
  const setSelectedRoom = useCallback(
    (val: string | null) => form.setValues(v => ({ ...v, selectedRoom: val })),
    [form]
  );
  const setDuration = useCallback(
    (val: number | null) => form.setValues(v => ({ ...v, duration: val })),
    [form]
  );
  const setCustomDuration = useCallback(
    (val: string) => form.setValues(v => ({ ...v, customDuration: val })),
    [form]
  );
  const setCustomMode = useCallback(
    (val: boolean) => form.setValues(v => ({ ...v, customMode: val })),
    [form]
  );
  const setNotes = useCallback(
    (val: string) => form.setValues(v => ({ ...v, notes: val })),
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
    setCustomDuration,
    setCustomMode,
    setNotes,
  };
}
