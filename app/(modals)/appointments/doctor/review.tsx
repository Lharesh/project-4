import DoctorSlotReview from '@/features/appointments/modal/DoctorSlotReview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { RootState } from '@/redux/store';
import { addAppointmentThunk } from '@/features/appointments/appointmentsSlice';
import { Platform, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { selectDoctors } from '@/features/appointments/selectors';

export default function DoctorReviewModal() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const doctors = useAppSelector(selectDoctors);
    const clients = useAppSelector((state: RootState) => state.clients.clients || []);
    const doctor = doctors.find((d: any) => String(d.id) === String(params.doctorId)) || { id: params.doctorId, name: params.doctorName };
    const client = clients.find(c => String(c.id) === String(params.clientId));
    const slot = {
        time: Array.isArray(params.slotTime) ? params.slotTime[0] : params.slotTime,
        date: Array.isArray(params.date) ? params.date[0] : params.date,
    };

    const handleConfirm = async () => {
        console.log('handleConfirm called');
        const appointment = {
            id: `${client?.id || ''}_${doctor?.id || ''}_${slot.date || ''}_${slot.time || ''}`,
            clientId: client?.id || '',
            clientName: client?.name || '',
            clientMobile: client?.mobile || '',
            doctorId: doctor?.id || '',
            doctorName: doctor?.name || params.doctorName || '',
            date: typeof slot.date === 'string' ? slot.date : Array.isArray(slot.date) ? slot.date[0] : '',
            time: typeof slot.time === 'string' ? slot.time : Array.isArray(slot.time) ? slot.time[0] : '',
            status: 'scheduled' as 'scheduled',
            tab: 'Doctor' as 'Doctor',
            duration: 15,
        };
        await dispatch(addAppointmentThunk({ appointment }) as any);
        if (Platform.OS === 'android') {
            ToastAndroid.show('Appointment booked!', ToastAndroid.SHORT);
        } else {
            alert('Appointment booked!');
        }
        if (router.canDismiss && router.canDismiss()) {
            router.dismiss();
        } else if (router.back) {
            router.back();
        } else {
            router.replace('/appointments');
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom', 'left', 'right']}>
            <DoctorSlotReview doctor={doctor} client={client} slot={slot} onConfirm={handleConfirm} />
        </SafeAreaView>
    );
}

export const options = {
    headerShown: false,
    presentation: 'modal',
}; 