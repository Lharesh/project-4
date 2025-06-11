import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
// import Card from '@/components/ui/Card'; // Uncomment if using shared Card
import DoctorSlotBar from './DoctorSlotBar';

export interface DoctorRowCardProps {
    doctor: {
        id: string;
        name: string;
        photoUrl?: string;
        specialization?: string;
        phone?: string;
        department?: string;
    };
    slots: any[]; // Array of slot objects for this doctor
    appointments: any[]; // Appointments for this doctor
    onSlotPress: (slot: any) => void;
}

const DoctorRowCard: React.FC<DoctorRowCardProps> = ({ doctor, slots, appointments, onSlotPress }) => {
    return (
        <View style={styles.card}>
            <View style={styles.doctorInfoRow}>
                {doctor.photoUrl ? (
                    <Image source={{ uri: doctor.photoUrl }} style={styles.photo} />
                ) : (
                    <View style={styles.photoPlaceholder} />
                )}
                <View style={styles.infoCol}>
                    <Text style={styles.name}>{doctor.name}</Text>
                    {doctor.specialization && <Text style={styles.specialization}>{doctor.specialization}</Text>}
                    {/* Optionally show phone/department */}
                </View>
            </View>
            <DoctorSlotBar slots={slots} appointments={appointments} onSlotPress={onSlotPress} />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 2,
    },
    doctorInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    photo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
        marginRight: 14,
    },
    photoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e0e0',
        marginRight: 14,
    },
    infoCol: {
        flex: 1,
    },
    name: {
        fontWeight: 'bold',
        fontSize: 17,
        color: '#1a2233',
    },
    specialization: {
        fontSize: 14,
        color: '#6c757d',
        marginTop: 2,
    },
});

export default DoctorRowCard; 