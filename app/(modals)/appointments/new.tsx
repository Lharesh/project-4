import React from 'react';
import { useRouter } from 'expo-router';
import { ROUTE_APPOINTMENTS } from '@/constants/routes';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useAppointmentModalParams } from '../../(app)/appointments/_useNavigationParams';
import { selectEnforceGenderMatch } from '@/features/clinicConfig/configSlice';
import { selectTherapists, selectRooms, selectClinicTimings } from '../../(admin)/clinics/setup/setupSlice';
import { addAppointment } from '@/features/appointments/appointmentsSlice';
import NewAppointmentModal from '@/features/appointments/modal/NewAppointmentModal';
import type { TreatmentSlot } from '../../(admin)/clinics/setup/setupSlice';

export default function NewAppointmentPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const clients = useAppSelector(state => state.clients.clients);
    const therapists = useAppSelector(selectTherapists);
    const rooms = useAppSelector(selectRooms);
    const clinicTimings = useAppSelector(selectClinicTimings);
    const therapies: TreatmentSlot[] = useAppSelector(state => state.setup.treatmentSlots);
    const { appointments } = useAppSelector(state => state.appointments);
    const enforceGenderMatch = useAppSelector(selectEnforceGenderMatch);
    const {
        tab,
        initialClientId,
        initialClientName,
        initialClientPhone,
        autoOpenDrawer,
        newAppointment,
        initialSlotStart,
        initialSlotEnd,
        initialRoomId,
        initialDate
    } = useAppointmentModalParams();
    const validTab = (tab === 'Doctor' || tab === 'Therapy') ? tab : undefined;

    return (
        <NewAppointmentModal
            visible={true}
            clients={clients}
            therapists={therapists}
            rooms={rooms}
            clinicTimings={clinicTimings}
            onClose={() => router.replace({ pathname: ROUTE_APPOINTMENTS, params: {} })}
            onCreate={(appointmentOrArr: any) => {
                if (Array.isArray(appointmentOrArr)) {
                    appointmentOrArr.forEach(appt => dispatch(addAppointment(appt)));
                } else {
                    dispatch(addAppointment(appointmentOrArr));
                }
                router.replace({ pathname: ROUTE_APPOINTMENTS, params: {} });
            }}
            appointments={appointments}
            therapies={therapies}
            enforceGenderMatch={enforceGenderMatch}
            autoOpenDrawer={autoOpenDrawer}
            newAppointment={newAppointment}
            tab={validTab}
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