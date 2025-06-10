import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';
import type { TherapyAppointmentFormValues } from './useTherapyAppointmentFormV2';

/**
 * Transforms therapy booking form values to an Appointment object for Redux/state.
 * Uses param keys from paramKeys.ts for all field names.
 * @param values - The form values from useTherapyAppointmentFormV2
 * @param therapies - Array of therapy objects (with id, name, duration, etc.)
 * @param rooms - Array of room objects (with id, name, etc.)
 * @param therapists - Array of therapist objects (with id, name, etc.)
 * @returns Appointment object for Redux/state
 */
export function transformTherapyFormToAppointment(
    values: TherapyAppointmentFormValues,
    therapies: any[],
    rooms: any[],
    therapists: any[]
) {
    const therapy = therapies.find(t => t.id === values.selectedTherapy);
    const room = rooms.find(r => r.id === values.selectedRoom);
    const therapistNames = (values.selectedTherapists || []).map(
        id => therapists.find(t => t.id === id)?.name || id
    );
    const slotDuration = therapy?.duration || 60; // Default to 60 if not found

    return {
        id: `${values.selectedPatient}_${(values.selectedTherapists || []).join('_')}_${values.selectedRoom}_${values.startDate}_${values.timeSlot}`,
        [APPOINTMENT_PARAM_KEYS.CLIENT_ID]: values.selectedPatient,
        [APPOINTMENT_PARAM_KEYS.CLIENT_NAME]: (values as any).clientName || '',
        [APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE]: (values as any).clientMobile || '',
        therapistIds: values.selectedTherapists,
        therapistNames,
        [APPOINTMENT_PARAM_KEYS.TREATMENT_ID]: values.selectedTherapy,
        [APPOINTMENT_PARAM_KEYS.TREATMENT_NAME]: therapy?.name || '',
        [APPOINTMENT_PARAM_KEYS.ROOM_NUMBER]: values.selectedRoom,
        roomName: room?.name || '',
        date: values.startDate,
        slot: values.timeSlot,
        time: values.timeSlot,
        startTime: values.timeSlot,
        duration: slotDuration, // Slot duration in minutes
        slotDuration, // Explicitly add slotDuration for downstream consumers
        totalDays: values.duration || values.customDays || 1, // Recurring days
        notes: values.notes || '',
        status: 'scheduled',
        tab: 'Therapy',
        createdAt: new Date().toISOString(),
    };
}

export default transformTherapyFormToAppointment; 