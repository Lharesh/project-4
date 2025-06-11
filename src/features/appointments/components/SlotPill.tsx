import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Modal, Platform, Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';

export interface SlotPillProps {
    slot: {
        id: string;
        time: string;
        status: 'available' | 'scheduled' | 'completed' | 'cancelled' | 'no-showup';
        clientName?: string;
        statusReason?: string;
    };
    onPress: (action?: string) => void;
}

function getStatusColor(status: string) {
    switch (status) {
        case 'available': return '#E8F5ED'; // light green
        case 'scheduled': return '#E6EDFF'; // blue
        case 'completed': return '#FFF8E1'; // yellow/gold
        case 'cancelled': return '#FFE0E0'; // red
        case 'no-showup': return '#E1D7FF'; // violet
        default: return '#f5f5f5';
    }
}

const SlotPill: React.FC<SlotPillProps> = ({ slot, onPress }) => {
    const bgColor = getStatusColor(slot.status);
    const [menuVisible, setMenuVisible] = useState(false);
    const isBooked = slot.status !== 'available';

    // Show menu on long press (mobile) or right-click (web)
    const handleLongPress = (e?: any) => {
        if (isBooked) {
            if (Platform.OS === 'web' && e) {
                e.preventDefault();
            }
            setMenuVisible(true);
        }
    };

    // Actions (to be wired up by parent via onPress or a new prop)
    const actions = [
        { label: 'Cancel', action: 'cancel' },
        { label: 'Mark Complete', action: 'complete' },
        { label: 'No-showup', action: 'no-showup' },
    ];

    return (
        <>
            <TouchableOpacity
                style={[styles.pill, { backgroundColor: bgColor }]}
                onPress={() => onPress()}
                onLongPress={handleLongPress}
                {...(Platform.OS === 'web' ? { onContextMenu: handleLongPress } : {})}
                activeOpacity={0.85}
            >
                <View style={styles.row}>
                    <Text style={styles.time}>{slot.time}</Text>
                    <Plus size={16} color="#222" style={{ marginLeft: 2 }} />
                </View>
                {slot.clientName && (
                    <Text style={styles.clientName} numberOfLines={1} ellipsizeMode="tail">
                        {slot.clientName.length > 10 ? slot.clientName.slice(0, 9) + '…' : slot.clientName}
                    </Text>
                )}
                {slot.statusReason && (
                    <Text style={{ fontSize: 11, color: '#b71c1c', marginTop: 2 }}>{slot.statusReason}</Text>
                )}
            </TouchableOpacity>
            {/* Minimal cross-platform menu/overlay */}
            {menuVisible && (
                Platform.OS === 'web' ? (
                    <div style={{ position: 'fixed', zIndex: 1000, left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.08)' }} onClick={() => setMenuVisible(false)}>
                        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: 10, boxShadow: '0 2px 16px #0002', padding: 16, minWidth: 180 }} onClick={e => e.stopPropagation()}>
                            {actions.map(a => (
                                <button key={a.action} style={{ display: 'block', width: '100%', padding: 10, background: 'none', border: 'none', textAlign: 'left', fontSize: 15, color: '#1976d2', marginBottom: 4, cursor: 'pointer' }} onClick={() => { setMenuVisible(false); onPress && onPress(a.action); }}>{a.label}</button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.08)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setMenuVisible(false)}>
                            <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 16, minWidth: 180 }}>
                                {actions.map(a => (
                                    <TouchableOpacity key={a.action} style={{ paddingVertical: 10 }} onPress={() => { setMenuVisible(false); onPress && onPress(a.action); }}>
                                        <Text style={{ fontSize: 15, color: '#1976d2' }}>{a.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Pressable>
                    </Modal>
                )
            )}
        </>
    );
};

const styles = StyleSheet.create({
    pill: {
        minWidth: 90,
        maxWidth: 90,
        borderRadius: 24,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    time: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#222',
    },
    clientName: {
        fontSize: 13,
        color: '#1976d2',
        fontWeight: '500',
        maxWidth: 70,
    },
});

export default SlotPill; 