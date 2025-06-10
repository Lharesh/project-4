import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, Platform, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectTherapists } from '@/features/appointments/selectors';
import { selectClinicTimings } from '@/features/appointments/appointmentsSlice';
import BookingForm from '@/features/appointments/components/BookingForm';
import { rescheduleAppointmentThunk } from '@/features/appointments/appointmentsSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterTherapistsByGender } from '@/features/appointments/helpers/rulesEngine';
import { selectEnforceGenderMatch } from '@/features/clinicConfig/configSlice';
import { APPOINTMENT_PARAM_KEYS } from '@/features/appointments/constants/paramKeys';

export default function RescheduleAppointmentModal() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const dispatch = useAppDispatch();
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
        try {
            // Prevent date change for series appointments
            if (appointment.seriesId && values.startDate !== appointment.date) {
                setError('Date change is not allowed for multi-day/series appointments.');
                setSubmitting(false);
                return;
            }
            // Dispatch reschedule thunk (implement in slice)
            await dispatch(rescheduleAppointmentThunk({ original: appointment, updates: values }) as any);
            if (Platform.OS === 'web') {
                window.alert('Appointment rescheduled successfully.');
            } else {
                Alert.alert('Success', 'Appointment rescheduled successfully.');
            }
            router.replace('/appointments');
        } catch (e: any) {
            setError(e.message || 'Failed to reschedule appointment.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Reschedule Appointment</Text>
                {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}
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
                />
            </View>
        </SafeAreaView>
    );
}

export const options = {
    headerShown: false,
    presentation: 'modal',
}; 