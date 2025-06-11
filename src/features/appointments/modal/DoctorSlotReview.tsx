import React from 'react';
import { useRouter } from 'expo-router';
import SlotReviewScreen from '../components/SlotReviewScreen';
import { Platform, ToastAndroid } from 'react-native';

interface DoctorSlotReviewProps {
    doctor: any;
    client: any;
    slot: { time: string; date: string };
    onConfirm: () => Promise<void>;
}

const DoctorSlotReview: React.FC<DoctorSlotReviewProps> = ({ doctor, client, slot, onConfirm }) => {
    const router = useRouter();

    return (
        <SlotReviewScreen
            doctor={doctor}
            slot={slot}
            client={client}
            onConfirm={onConfirm}
            onCancel={() => router.back()}
        />
    );
};

export default DoctorSlotReview; 