import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, Platform, Alert, Modal } from 'react-native';
import { useAppSelector } from '@/redux/hooks';
import { selectTherapists } from '@/features/appointments/selectors';
import { selectClinicTimings } from '@/features/appointments/appointmentsSlice';
import BookingForm from '@/features/appointments/components/BookingForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterTherapistsByGender } from '@/features/appointments/helpers/rulesEngine';
import { selectEnforceGenderMatch } from '@/features/clinicConfig/configSlice';
import { APPOINTMENT_PARAM_KEYS } from '@/features/appointments/constants/paramKeys';

export default function RescheduleAppointmentModalUI({ onSubmit }: { onSubmit: (args: { original: any, updates: any }) => Promise<void> }) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const appointmentId = params.appointmentId as string;
    const appointment = useAppSelector(state =>
        state.appointments.appointments.find(a => a.id === appointmentId)
    );
    const client = useAppSelector(state =>
        state.clients.clients.find(c => c.id === appointment?.clientId)
    );
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const therapists = useAppSelector(selectTherapists);
    const rooms = useAppSelector(state => state.setup?.rooms || []);
    const therapies = useAppSelector(state => state.setup?.treatmentSlots || []);
    const clinicTimings = useAppSelector(selectClinicTimings);
    const enforceGenderMatch = useAppSelector(selectEnforceGenderMatch);

    if (!appointment) {
        return (
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <Text>Appointment not found.</Text>
            </SafeAreaView>
        );
    }

    // Debug logs for ID mapping
    console.log('[Reschedule] appointment.treatmentId:', appointment.treatmentId, 'therapies:', therapies.map(t => t.id));
    console.log('[Reschedule] appointment.roomNumber:', appointment.roomNumber, 'rooms:', rooms.map(r => r.id));
    // Use constants for robust field access
    const appt: Record<string, any> = appointment;
    const selectedTherapyId = therapies.find(
        t => String(t.id) === String(appt[APPOINTMENT_PARAM_KEYS.TREATMENT_ID])
    )?.id || '';
    const selectedRoomId = rooms.find(
        r => String(r.id) === String(appt[APPOINTMENT_PARAM_KEYS.ROOM_NUMBER])
    )?.id || '';
    const timeSlot = typeof appt[APPOINTMENT_PARAM_KEYS.TIME] === 'string'
        ? appt[APPOINTMENT_PARAM_KEYS.TIME]
        : '';
    const safeInitialValues = {
        selectedTherapy: selectedTherapyId,
        selectedRoom: selectedRoomId,
        selectedTherapists: appt[APPOINTMENT_PARAM_KEYS.THERAPIST_IDS] || [],
        startDate: appt[APPOINTMENT_PARAM_KEYS.DATE] || '',
        timeSlot,
        duration: appt[APPOINTMENT_PARAM_KEYS.TOTAL_DAYS] || 1,
        notes: appt[APPOINTMENT_PARAM_KEYS.NOTES] || '',
        clientName: appt[APPOINTMENT_PARAM_KEYS.CLIENT_NAME] || '',
        clientMobile: appt[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] || '',
        clientId: appt[APPOINTMENT_PARAM_KEYS.CLIENT_ID] || '',
    };
    // Therapist gender filtering
    const filteredTherapists = filterTherapistsByGender(
        therapists,
        client?.gender,
        enforceGenderMatch
    );

    const handleSubmit = async (values: any) => {
        setSubmitting(true);
        setError(null);
        // Compare editable fields to detect changes
        const fieldsToCheck = [
            'selectedTherapy',
            'selectedRoom',
            'selectedTherapists',
            'startDate',
            'timeSlot',
            'duration',
            'notes',
        ];
        const initial: Record<string, any> = safeInitialValues;
        const current: Record<string, any> = values;
        let changed = false;
        for (const key of fieldsToCheck) {
            if (Array.isArray(initial[key]) && Array.isArray(current[key])) {
                if (initial[key].length !== current[key].length ||
                    initial[key].some((v: any, i: number) => v !== current[key][i])) {
                    changed = true;
                    break;
                }
            } else if (initial[key] !== current[key]) {
                changed = true;
                break;
            }
        }
        if (!changed) {
            setError('Nothing has been changed.');
            setSubmitting(false);
            return;
        }
        try {
            await onSubmit({ original: appointment, updates: values });
            if (Platform.OS === 'web') {
                window.alert('Appointment rescheduled successfully.');
            } else {
                Alert.alert('Success', 'Appointment rescheduled successfully.');
            }
            router.replace('/appointments');
        } catch (e: any) {
            setError(e.message || 'Failed to reschedule appointment.');
            // Do NOT show the success message or navigate away!
        } finally {
            setSubmitting(false);
        }
    };

    const content = (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Reschedule Appointment</Text>
                {submitting && <ActivityIndicator size="large" color="#1976d2" style={{ marginBottom: 16 }} />}
                <BookingForm
                    initialValues={safeInitialValues}
                    therapies={therapies}
                    availableRooms={rooms}
                    availableTherapists={filteredTherapists}
                    onSubmit={handleSubmit}
                    genderFlag={!!enforceGenderMatch}
                    clientGender={client?.gender || ''}
                    error={error || undefined}
                    onCancel={() => router.replace('/appointments')}
                    mode="reschedule"
                />
            </View>
        </SafeAreaView>
    );

    if (Platform.OS === 'web') {
        return content;
    }

    // On mobile, wrap in a true Modal
    return (
        <Modal visible={true} animationType="slide" onRequestClose={() => router.replace('/appointments')}>
            {content}
        </Modal>
    );
} 