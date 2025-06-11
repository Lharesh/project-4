import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import DoctorRowCard from './DoctorRowCard';
import { getDoctorSlotsForDay } from '../helpers/doctorSlotHelpers';
import { getSlotsForDay } from '../helpers/dateHelpers';
import DoctorSlotGrid from './DoctorSlotGrid';

export interface DoctorAppointmentsTabProps {
    doctors: any[];
    appointments: any[];
    clinicTimings: any;
    onSlotAction: (action: string, doctor: any, slot: any) => void;
    selectedDate: string;
}

const DoctorAppointmentsTab: React.FC<DoctorAppointmentsTabProps> = ({ doctors, appointments, clinicTimings, onSlotAction, selectedDate }) => {
    // Generate all slot times for the selected date
    const slotTimes = getSlotsForDay(selectedDate, clinicTimings, 15);
    return (
        <DoctorSlotGrid
            doctors={doctors}
            appointments={appointments}
            clinicTimings={clinicTimings}
            slotTimes={slotTimes}
            selectedDate={selectedDate}
            onSlotAction={onSlotAction}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7fafd',
        padding: 12,
    },
});

export default DoctorAppointmentsTab; 