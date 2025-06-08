import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

interface CancelAppointmentDialogProps {
    visible: boolean;
    onClose: () => void;
    onCancel: () => void;
    onPush: () => void;
    onCancelAll: () => void;
    appointmentInfo?: { clientName?: string; date?: string; time?: string };
}

const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
    visible,
    onClose,
    onCancel,
    onPush,
    onCancelAll,
    appointmentInfo,
}) => {
    if (!visible) return null;

    // Web implementation using a div overlay
    if (Platform.OS === 'web') {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                background: 'rgba(0,0,0,0.35)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{
                    background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px #0002',
                    padding: 24, minWidth: 320, maxWidth: 400, textAlign: 'center'
                }}>
                    <h3>Cancel Appointment</h3>
                    {appointmentInfo && (
                        <p>
                            {appointmentInfo.clientName} <br />
                            {appointmentInfo.date} {appointmentInfo.time}
                        </p>
                    )}
                    <div style={{ marginTop: 16 }}>
                        <button onClick={onClose} style={{ margin: 4 }}>Close</button>
                        <button onClick={onCancel} style={{ margin: 4, background: '#e3f0fa' }}>Cancel</button>
                        <button onClick={onPush} style={{ margin: 4, background: '#ffe8d2' }}>Cancel & Push</button>
                        <button onClick={onCancelAll} style={{ margin: 4, background: '#ffe0e0' }}>Cancel All</button>
                    </div>
                </div>
            </div>
        );
    }

    // Mobile (React Native) implementation
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={{
                flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center'
            }}>
                <View style={{
                    backgroundColor: '#fff', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 400, alignItems: 'center'
                }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Cancel Appointment</Text>
                    {appointmentInfo && (
                        <Text style={{ marginBottom: 12, textAlign: 'center' }}>
                            {appointmentInfo.clientName}{"\n"}
                            {appointmentInfo.date} {appointmentInfo.time}
                        </Text>
                    )}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <TouchableOpacity onPress={onClose} style={{ margin: 4, padding: 10 }}>
                            <Text>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onCancel} style={{ margin: 4, padding: 10, backgroundColor: '#e3f0fa', borderRadius: 6 }}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onPush} style={{ margin: 4, padding: 10, backgroundColor: '#ffe8d2', borderRadius: 6 }}>
                            <Text>Cancel & Push</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onCancelAll} style={{ margin: 4, padding: 10, backgroundColor: '#ffe0e0', borderRadius: 6 }}>
                            <Text>Cancel All</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CancelAppointmentDialog; 