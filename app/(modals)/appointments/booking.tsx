import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import BookingModalPanel from '@/features/appointments/components/BookingModalPanel';
import BookingForm from '@/features/appointments/components/BookingForm';
import { selectTherapists } from '@/features/appointments/selectors';
import { addAppointment } from '@/features/appointments/appointmentsSlice';
import { addDays, format, parseISO } from 'date-fns';

function getStringParam(param: any): string {
    if (Array.isArray(param)) return param[0] || '';
    return param || '';
}

export default function BookingPage() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [formKey, setFormKey] = React.useState(Date.now());

    const therapies = useAppSelector(state => state.setup?.treatmentSlots || []);
    const rooms = useAppSelector(state => state.setup?.rooms || []);
    const therapists = useAppSelector(selectTherapists);
    const genderFlag = useAppSelector(state => state.config?.enforceGenderMatch ?? false);
    const clientGender = getStringParam(params.clientGender) || '';

    const initialValues = {
        selectedPatient: getStringParam(params.clientId),
        selectedTherapy: '',
        selectedTherapists: [],
        startDate: getStringParam(params.date),
        timeSlot: getStringParam(params.slotStart),
        selectedRoom: getStringParam(params.roomId),
        duration: null,
        notes: '',
        customDays: null,
        clientName: getStringParam(params.clientName),
        clientMobile: getStringParam(params.clientMobile),
        clientId: getStringParam(params.clientId),
    };

    const handleSubmit = (values: any) => {
        // Recurring booking logic
        const totalDays = values.totalDays || values.duration || 1;
        let appointmentsToAdd = [];
        if (totalDays > 1) {
            for (let i = 0; i < totalDays; i++) {
                const dateObj = addDays(parseISO(values.date), i);
                const dateStr = format(dateObj, 'yyyy-MM-dd');
                appointmentsToAdd.push({
                    ...values,
                    date: dateStr,
                    id: `${values.selectedPatient}_${(values.selectedTherapists || []).join('_')}_${values.selectedRoom}_${dateStr}_${values.timeSlot}`,
                });
            }
        } else {
            appointmentsToAdd = [values];
        }
        appointmentsToAdd.forEach((appt) => dispatch(addAppointment(appt)));
        setFormKey(Date.now());
        router.replace({ pathname: '/appointments', params: { tab: 'Therapy' } });
    };

    return (
        <BookingModalPanel visible={true} onClose={() => router.replace('/appointments')}>
            <BookingForm
                key={formKey}
                initialValues={initialValues}
                therapies={therapies}
                availableRooms={rooms}
                availableTherapists={therapists}
                onSubmit={handleSubmit}
                genderFlag={genderFlag}
                clientGender={clientGender}
            />
        </BookingModalPanel>
    );
}