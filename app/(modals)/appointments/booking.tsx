import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import TherapyAppointments from '@/features/appointments/modal/TherapyAppointments';
import { selectTherapists } from '@/features/appointments/selectors';
import { selectRooms, selectClinicTimings } from '../../(admin)/clinics/setup/setupSlice';
import { ROUTE_APPOINTMENTS, ROUTE_NEW_APPOINTMENT_BOOKING } from '@/constants/routes';

export default function BookingModalRoute() {
    const params = useLocalSearchParams();
    const router = useRouter();

    // Selectors for Redux state
    const clients = useAppSelector(state => state.clients.clients);
    const therapists = useAppSelector(selectTherapists);
    const rooms = useAppSelector(selectRooms) ?? [];
    const clinicTimings = useAppSelector(selectClinicTimings) ?? {};
    const appointments = useAppSelector(state => state.appointments.appointments);
    const therapies = useAppSelector(state => state.setup.treatmentSlots);
    const enforceGenderMatch = useAppSelector(state => state.config.enforceGenderMatch);

    // Extract initial values from params
    const initialClientId = params.clientId as string | undefined;
    const initialClientName = params.clientName as string | undefined;
    const initialClientPhone = params.clientMobile as string | undefined;
    const initialSlotStart = params.slotStart as string | undefined;
    const initialSlotEnd = params.slotEnd as string | undefined;
    const initialRoomId = params.roomId as string | undefined;
    const initialDate = params.date as string | undefined;

    return (
        <TherapyAppointments
            visible={true}
            onClose={() => router.replace(ROUTE_APPOINTMENTS)}
            onCreate={(appointments) => {
                // Pass the new appointment(s) to AppointmentsScreen via navigation params
                router.replace({
                    pathname: ROUTE_APPOINTMENTS,
                    params: { newAppointment: JSON.stringify(appointments) }
                });
            }}
            clients={clients}
            therapists={therapists}
            rooms={rooms}
            clinicTimings={clinicTimings}
            appointments={appointments}
            therapies={therapies}
            enforceGenderMatch={enforceGenderMatch}
            initialClientId={initialClientId}
            initialClientName={initialClientName}
            initialClientPhone={initialClientPhone}
            initialSlotStart={initialSlotStart}
            initialSlotEnd={initialSlotEnd}
            initialRoomId={initialRoomId}
            initialDate={initialDate}
        />
    );
}