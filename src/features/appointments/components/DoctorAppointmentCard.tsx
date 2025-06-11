import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import Card from '@/components/ui/Card';
import styles from './AppointmentCard.styles';
import { format } from 'date-fns';
import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '@/redux/hooks';
import { cancelAppointment } from '../appointmentsSlice';

const getStatusBackgroundColor = (status: string) => {
    if (status === 'completed') return '#E8F5ED';
    if (status === 'cancelled') return '#FFF8E1';
    if (status === 'scheduled') return '#E6EDFF';
    return '#fff';
};

export function DoctorAppointmentCard({ appointment, onBook, onMarkComplete, closeModal }: {
    appointment: any,
    onBook?: () => void,
    onMarkComplete?: (id: string) => void,
    closeModal?: () => void,
}) {
    const [menuVisible, setMenuVisible] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const router = useRouter();
    const dispatch = useAppDispatch();
    const slotTime = appointment.time
        ? format(new Date(`2000-01-01T${appointment.time}`), 'hh:mm a')
        : '--';

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2000);
    };

    const handleMenuAction = (action: string) => {
        setMenuVisible(false);
        if (action === 'cancel') {
            dispatch(cancelAppointment(appointment.id));
            showToast('Appointment cancelled');
        } else if (action === 'complete') {
            onMarkComplete && onMarkComplete(appointment.id);
            showToast('Appointment marked as completed');
        } else if (action === 'no-showup') {
            dispatch(cancelAppointment(appointment.id));
            showToast('Marked as no-showup');
        } else if (action === 'new') {
            if (closeModal) closeModal();
            setTimeout(() => {
                router.push({ pathname: '/appointments/new', params: { tab: 'Doctor' } });
            }, 10);
        }
    };

    // Menu: Cancel, Mark Complete, No-showup, New Appointment
    const renderMenu = () => {
        if (Platform.OS === 'web') {
            return menuVisible ? (
                <>
                    <div
                        style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999, background: 'transparent' }}
                        onClick={() => setMenuVisible(false)}
                    />
                    <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 1000, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0002', minWidth: 160 }}>
                        <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleMenuAction('new')}>New Appointment</button>
                        <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleMenuAction('cancel')}>Cancel</button>
                        <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleMenuAction('complete')}>Mark Complete</button>
                        <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => handleMenuAction('no-showup')}>No-showup</button>
                    </div>
                </>
            ) : null;
        }
        return (
            <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setMenuVisible(false)}>
                    <View style={{ position: 'absolute', right: 20, top: 60, backgroundColor: '#fff', borderRadius: 8, padding: 8, minWidth: 180, elevation: 8 }}>
                        <TouchableOpacity style={{ padding: 12 }} onPress={() => handleMenuAction('new')}><Text>New Appointment</Text></TouchableOpacity>
                        <TouchableOpacity style={{ padding: 12 }} onPress={() => handleMenuAction('cancel')}><Text>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity style={{ padding: 12 }} onPress={() => handleMenuAction('complete')}><Text>Mark Complete</Text></TouchableOpacity>
                        <TouchableOpacity style={{ padding: 12 }} onPress={() => handleMenuAction('no-showup')}><Text>No-showup</Text></TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        );
    };

    // Web and native rendering
    if (Platform.OS === 'web') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <div style={{ maxWidth: 800, width: '100%', background: getStatusBackgroundColor(appointment.status), borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 12, marginLeft: 15, marginRight: 15, marginBottom: 8, position: 'relative' }}>
                    {/* First row: Time */}
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 2 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}><span style={{ marginRight: 4 }}>⏰</span><span>{slotTime}</span></span>
                        </div>
                        <div style={{ flex: 1 }} />
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <span style={{ color: '#4d6b99', fontWeight: 700, fontSize: 16 }}>{appointment.duration ? `${appointment.duration} M` : '--'}</span>
                        </div>
                    </div>
                    {/* Second row: Doctor | Client */}
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 2 }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <span style={{ marginRight: 4 }}>🩺</span>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2233', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{appointment.doctorName || 'Unknown Doctor'}</span>
                            </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <span style={{ color: '#4d6b99', marginRight: 4 }}>👤</span>
                                <span style={{ fontSize: 14, color: '#1a2233' }}>{appointment.clientName || '--'}</span>
                            </span>
                        </div>
                        <div style={{ flex: 1 }} />
                    </div>
                    {/* Third row: Consultation | Phone */}
                    <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#4d6b99', marginRight: 4 }}>💬</span>
                            <span style={{ fontSize: 13, color: '#6c757d', fontWeight: 500 }}>Consultation</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ color: '#4d6b99', marginRight: 4 }}>📞</span>
                            <span style={{ fontSize: 14, color: '#1a2233' }}>{appointment.clientMobile || '--'}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            {appointment.status !== 'cancelled' && (
                                <button
                                    style={{ cursor: 'pointer', color: '#4d6b99', fontSize: 20, background: 'none', border: 'none', padding: 4, borderRadius: 20, marginLeft: 8 }}
                                    aria-label="More actions"
                                    onClick={e => { e.stopPropagation(); setMenuVisible(v => !v); }}
                                >
                                    ⋮
                                </button>
                            )}
                            {renderMenu()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    // Native (mobile/tablet)
    return (
        <View style={{ position: 'relative' }}>
            <Card style={[styles.card, { backgroundColor: getStatusBackgroundColor(appointment.status) }]}>
                <View>
                    {/* First row: Time */}
                    <View style={styles.cardRow}>
                        <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ marginRight: 4 }}>⏰</Text>
                                <Text style={{ color: '#4d6b99', fontWeight: 'bold', fontSize: 16 }}>{slotTime}</Text>
                            </View>
                        </View>
                        <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]} />
                        <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}>
                            <Text style={{ color: '#4d6b99', fontWeight: 'bold', fontSize: 16 }}>{appointment.duration ? `${appointment.duration} M` : '--'}</Text>
                        </View>
                    </View>
                    {/* Second row: Doctor | Client */}
                    <View style={styles.cardRow}>
                        <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#4d6b99', marginRight: 4 }}>🩺</Text>
                                <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#1a2233', marginRight: 4 }} numberOfLines={1} ellipsizeMode="tail">{appointment.doctorName || 'Unknown Doctor'}</Text>
                            </View>
                        </View>
                        <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#4d6b99', marginRight: 4 }}>👤</Text>
                                <Text style={{ fontSize: 14, color: '#1a2233' }}>{appointment.clientName || '--'}</Text>
                            </View>
                        </View>
                        <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]} />
                    </View>
                    {/* Third row: Consultation | Phone */}
                    <View style={styles.cardRow}>
                        <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#4d6b99', marginRight: 4 }}>💬</Text>
                                <Text style={{ fontSize: 13, color: '#6c757d', fontWeight: '500' }}>Consultation</Text>
                            </View>
                        </View>
                        <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: '#4d6b99', marginRight: 4 }}>📞</Text>
                                <Text style={{ fontSize: 14, color: '#1a2233' }}>{appointment.clientMobile || '--'}</Text>
                            </View>
                        </View>
                        <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}>
                            {appointment.status !== 'cancelled' && (
                                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton} accessibilityLabel="More actions">
                                    <Text style={{ fontSize: 20, marginLeft: 8 }}>⋮</Text>
                                </TouchableOpacity>
                            )}
                            {renderMenu()}
                        </View>
                    </View>
                </View>
            </Card>
            {renderMenu()}
            {/* Toast/Snackbar */}
            {toast && (
                <View style={{ position: 'absolute', top: 10, left: 0, right: 0, alignItems: 'center', zIndex: 2000 }}>
                    <Text style={{ backgroundColor: '#222', color: '#fff', padding: 10, borderRadius: 8 }}>{toast}</Text>
                </View>
            )}
        </View>
    );
}

export default DoctorAppointmentCard; 