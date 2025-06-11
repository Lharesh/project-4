import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import SlotPill from './SlotPill';

export interface DoctorSlotBarProps {
    slots: any[]; // Array of slot objects for this doctor
    appointments: any[];
    onSlotPress: (slot: any) => void;
}

const DoctorSlotBar: React.FC<DoctorSlotBarProps> = ({ slots, appointments, onSlotPress }) => {
    // TODO: Auto-scroll to current time slot on mount
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.slotBar}>
            {slots.map(slot => (
                <SlotPill key={slot.id} slot={slot} onPress={() => onSlotPress(slot)} />
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    slotBar: {
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 2,
        marginBottom: 4,
    },
});

export default DoctorSlotBar; 