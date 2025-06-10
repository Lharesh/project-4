import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, Platform, Alert } from 'react-native';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { selectTherapists } from '@/features/appointments/selectors';
import { selectClinicTimings, rescheduleAppointmentThunk } from '@/features/appointments/appointmentsSlice';
import BookingForm from '@/features/appointments/components/BookingForm';
import { SafeAreaView } from 'react-native-safe-area-context';
import { filterTherapistsByGender } from '@/features/appointments/helpers/rulesEngine';
import { selectEnforceGenderMatch } from '@/features/clinicConfig/configSlice';
import { APPOINTMENT_PARAM_KEYS } from '@/features/appointments/constants/paramKeys';
import RescheduleAppointmentModalUI from './RescheduleAppointmentModalUI';

export default function RescheduleAppointmentRouteWrapper(props: React.PropsWithChildren<{}>) {
    const dispatch = useAppDispatch();

    const handleRescheduleSubmit = async ({ original, updates }: { original: any, updates: any }) => {
        return await dispatch(rescheduleAppointmentThunk({ original, updates })).unwrap();
    };

    return <RescheduleAppointmentModalUI onSubmit={handleRescheduleSubmit} {...props} />;
}

export const options = {
    headerShown: false,
    presentation: 'modal',
}; 