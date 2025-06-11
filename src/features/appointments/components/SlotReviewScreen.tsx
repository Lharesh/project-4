import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface SlotReviewScreenProps {
    doctor: any;
    slot: any;
    client: any;
    onConfirm: () => void;
    onCancel: () => void;
    statusReason?: string;
}

/**
 * SlotReviewScreen: Route-driven review/confirmation screen after client selection.
 * Use as a page or overlay, not a modal-in-modal.
 */
const SlotReviewScreen: React.FC<SlotReviewScreenProps> = ({ doctor, slot, client, onConfirm, onCancel, statusReason }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Review Appointment</Text>
            <View style={styles.section}>
                <Text style={styles.label}>Doctor:</Text>
                <Text>{doctor?.name || 'Unknown Doctor'}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Client:</Text>
                <Text>{client?.name || 'Unknown Client'}</Text>
            </View>
            <View style={styles.section}>
                <Text style={styles.label}>Slot:</Text>
                <Text>{slot.time}</Text>
            </View>
            {statusReason && (
                <View style={styles.section}>
                    <Text style={{ color: '#b71c1c', fontSize: 13 }}>{statusReason}</Text>
                </View>
            )}
            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}><Text>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={() => { console.log('Confirm button pressed'); onConfirm(); }}><Text>Confirm</Text></TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 24,
        justifyContent: 'center',
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 18,
        textAlign: 'center',
    },
    section: {
        marginBottom: 14,
    },
    label: {
        fontWeight: '600',
        color: '#888',
        marginBottom: 2,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
    },
    cancelBtn: {
        backgroundColor: '#eee',
        borderRadius: 6,
        paddingVertical: 12,
        flex: 1,
        marginRight: 8,
        alignItems: 'center',
    },
    confirmBtn: {
        backgroundColor: '#1976d2',
        borderRadius: 6,
        paddingVertical: 12,
        flex: 1,
        marginLeft: 8,
        alignItems: 'center',
    },
});

export default SlotReviewScreen; 