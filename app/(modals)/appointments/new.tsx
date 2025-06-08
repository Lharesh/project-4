import React from 'react';
import { useRouter } from 'expo-router';
import { ROUTE_APPOINTMENTS } from '@/constants/routes';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { useAppointmentModalParams } from '../../(app)/appointments/_useNavigationParams';
import { selectEnforceGenderMatch } from '@/features/clinicConfig/configSlice';
import { selectTherapists, selectRooms, selectClinicTimings } from '../../(admin)/clinics/setup/setupSlice';
import { addAppointment, cancelAndShiftSeries, fetchAppointments } from '@/features/appointments/appointmentsSlice';
import NewAppointmentModal from '@/features/appointments/modal/NewAppointmentModal';
import type { TreatmentSlot } from '../../(admin)/clinics/setup/setupSlice';
import CancelAppointmentDialog from '@/features/appointments/components/CancelAppointmentDialog';

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

    // State for cancel dialog
    const [cancelDialog, setCancelDialog] = React.useState<{ open: boolean; appointment: any | null }>({ open: false, appointment: null });

    // Handler to open cancel dialog
    const handleOpenCancelDialog = (appointmentId: string) => {
        const appt = appointments.find((a: any) => a.id === appointmentId);
        setCancelDialog({ open: true, appointment: appt });
    };

    // Handler to refetch appointments after cancel
    const refetchAppointments = () => {
        const tabToUse = validTab ?? 'Therapy';
        const dateToUse = initialDate || new Date().toISOString().slice(0, 10);
        dispatch(fetchAppointments({ validTab: tabToUse, date: dateToUse }));
    };

    return (
        <>
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
                onCancelAppointment={handleOpenCancelDialog}
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
                        refetchAppointments();
                    }
                    setCancelDialog({ open: false, appointment: null });
                }}
                onPush={() => {
                    if (cancelDialog.appointment) {
                        dispatch(cancelAndShiftSeries({ appointmentId: cancelDialog.appointment.id, push: true }));
                        refetchAppointments();
                    }
                    setCancelDialog({ open: false, appointment: null });
                }}
                onCancelAll={() => {
                    if (cancelDialog.appointment) {
                        dispatch(cancelAndShiftSeries({ appointmentId: cancelDialog.appointment.id, cancelAll: true }));
                        refetchAppointments();
                    }
                    setCancelDialog({ open: false, appointment: null });
                }}
            />
        </>
    );
} 