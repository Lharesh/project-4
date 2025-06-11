import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking, Alert } from 'react-native';
import { Phone, User, BookOpen, CheckCircle, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SLOT_STATUS } from '../constants/status';
import { colors, spacing, typography } from '../../../theme';

// Define a shared SLOT_SIZE constant for both header and slot cells
const SLOT_SIZE = {
    minWidth: 140,
    maxWidth: 180,
    minHeight: 140,
    maxHeight: 180,
    borderRadius: 18,
    margin: 8,
};

// --- Add helper for avatar color (cycle through palette) ---
const avatarColors = [
    '#5AC8FA', // Vata blue
    '#FFB300', // Pitta yellow
    '#43A047', // Kapha green
    '#1976D2', // Info blue
    '#FF7043', // Accent orange
    '#AB47BC', // Violet
];
function getAvatarColor(idx: number) {
    return avatarColors[idx % avatarColors.length];
}

// --- Doctor Header Avatar ---
function DoctorAvatar({ name, idx }: { name: string, idx: number }) {
    // Remove 'Dr.' or similar prefix and get first two non-space letters
    let clean = name.replace(/^Dr\.?\s*/i, '').trim();
    let initials = clean.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
    if (initials.length < 2 && clean.length >= 2) initials = clean.slice(0, 2).toUpperCase();
    return (
        <View style={{
            width: 28, height: 28, borderRadius: 14, backgroundColor: getAvatarColor(idx),
            alignItems: 'center', justifyContent: 'center', marginBottom: 2, boxShadow: Platform.OS === 'web' ? '0 2px 8px #0002' : undefined
        }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>{initials}</Text>
        </View>
    );
}

function getSlotGradient(status: string): string[] {
    if (status === 'completed') return ['#E8F5ED', '#E8F5ED', '#E8F5ED'];
    if (status === 'cancelled') return ['#FFF8E1', '#FFF8E1', '#FFF8E1'];
    if (status === 'scheduled') return ['#E6EDFF', '#E6EDFF', '#E6EDFF'];
    if (status === 'past') return ['#f5f5f5', '#f5f5f5', '#f5f5f5'];
    if (status === 'unavailable') return ['#f5f5f5', '#f5f5f5', '#f5f5f5'];
    return ['#fff', '#fff', '#fff'];
}

interface DoctorSlotCellProps {
    slot: any;
    onBook: () => void;
    onCancel: () => void;
    onNoShow: () => void;
    onMarkComplete: () => void;
    onMenu?: () => void;
}

function DoctorSlotCell({ slot, onBook, onCancel, onNoShow, onMarkComplete, onMenu }: DoctorSlotCellProps) {
    const isAvailable = slot.status === 'available';
    const isScheduled = slot.status === 'scheduled';
    const isCompleted = slot.status === 'completed';
    const isCancelled = slot.status === 'cancelled';
    const isPast = slot.status === 'past';
    const isUnavailable = slot.status === 'unavailable';
    let statusText = '';
    if (isPast) statusText = 'Slot is in the past';
    else if (isUnavailable) statusText = 'Doctor Unavailable';
    else if (isCancelled) statusText = 'Cancelled';
    else if (isCompleted) statusText = 'Completed';
    function getSlotGradient(status: string): string[] {
        if (status === 'scheduled') return ['#E6EDFF', '#D1E8FF', '#F4F9FB'];
        if (status === 'available') return ['#E8F5ED', '#D1F2EB', '#F4F9FB'];
        if (status === 'cancelled') return ['#FFF8E1', '#FFE0B2', '#FFF9F0'];
        if (status === 'completed') return ['#E8F5ED', '#C8E6C9', '#F4F9FB'];
        if (status === 'past' || status === 'unavailable') return ['#F5F5F5', '#E0E0E0', '#F9F9FB'];
        return ['#FFFFFF', '#F9F9FB', '#F4F9FB'];
    }
    return (
        <LinearGradient
            colors={getSlotGradient(slot.status) as [string, string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.slot}
        >
            <View style={styles.centerContent}>
                {isAvailable && (
                    Platform.OS === 'web' ? (
                        <div title="Book Appointment" style={{ width: '100%' }}>
                            <TouchableOpacity
                                style={styles.bookBtn}
                                onPress={onBook}
                                accessibilityLabel="Book Appointment"
                                activeOpacity={0.85}
                            >
                                <BookOpen size={22} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.bookBtnText}>Book</Text>
                            </TouchableOpacity>
                        </div>
                    ) : (
                        <TouchableOpacity
                            style={styles.bookBtn}
                            onPress={onBook}
                            accessibilityLabel="Book Appointment"
                            activeOpacity={0.85}
                        >
                            <BookOpen size={22} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.bookBtnText}>Book</Text>
                        </TouchableOpacity>
                    )
                )}
                {isScheduled && (
                    <>
                        {/* Patient avatar and name */}
                        <View style={styles.avatarRow}>
                            <View style={[styles.patientAvatar, { backgroundColor: '#1976D2' }]}> {/* Blue for now */}
                                <Text style={styles.avatarText}>{slot.clientName?.[0]?.toUpperCase() || '?'}</Text>
                            </View>
                            <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{slot.clientName || '--'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            {Platform.OS === 'web' ? (
                                <div title="Call Patient">
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={() => slot.clientMobile && Linking.openURL(`tel:${slot.clientMobile}`)}
                                        accessibilityLabel="Call Patient"
                                    >
                                        <Phone size={16} color={colors.grayDark} style={{ marginRight: 4 }} />
                                    </TouchableOpacity>
                                </div>
                            ) : (
                                <TouchableOpacity
                                    style={styles.iconBtn}
                                    onPress={() => slot.clientMobile && Linking.openURL(`tel:${slot.clientMobile}`)}
                                    accessibilityLabel="Call Patient"
                                >
                                    <Phone size={16} color={colors.grayDark} style={{ marginRight: 4 }} />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.patientMobile} numberOfLines={1} ellipsizeMode="tail">{slot.clientMobile || '--'}</Text>
                        </View>
                        <View style={styles.actionRow}>
                            {Platform.OS === 'web' ? (
                                <>
                                    <div title="Mark as No-show">
                                        <TouchableOpacity
                                            style={styles.iconBtn}
                                            onPress={onNoShow}
                                            accessibilityLabel="Mark No-show"
                                        >
                                            <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>🚫</Text>
                                        </TouchableOpacity>
                                    </div>
                                    <div title="Cancel Appointment">
                                        <TouchableOpacity
                                            style={styles.iconBtn}
                                            onPress={onCancel}
                                            accessibilityLabel="Cancel Appointment"
                                        >
                                            <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>✖️</Text>
                                        </TouchableOpacity>
                                    </div>
                                    <div title="Mark as Complete">
                                        <TouchableOpacity
                                            style={styles.iconBtn}
                                            onPress={onMarkComplete}
                                            accessibilityLabel="Mark as Complete"
                                        >
                                            <CheckCircle size={20} color="#43A047" style={{ marginRight: 0 }} />
                                        </TouchableOpacity>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={onNoShow}
                                        accessibilityLabel="Mark No-show"
                                    >
                                        <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>🚫</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={onCancel}
                                        accessibilityLabel="Cancel Appointment"
                                    >
                                        <Text style={{ color: colors.error, fontWeight: 'bold', fontSize: 16 }}>✖️</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={onMarkComplete}
                                        accessibilityLabel="Mark as Complete"
                                    >
                                        <CheckCircle size={20} color="#43A047" style={{ marginRight: 0 }} />
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </>
                )}
                {isCompleted && (
                    <>
                        {/* Patient avatar and name */}
                        <View style={styles.avatarRow}>
                            <View style={[styles.patientAvatar, { backgroundColor: '#1976D2' }]}> {/* Blue for now */}
                                <Text style={styles.avatarText}>{slot.clientName?.[0]?.toUpperCase() || '?'}</Text>
                            </View>
                            <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{slot.clientName || '--'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            {Platform.OS === 'web' ? (
                                <div title="Call Patient">
                                    <TouchableOpacity
                                        style={styles.iconBtn}
                                        onPress={() => slot.clientMobile && Linking.openURL(`tel:${slot.clientMobile}`)}
                                        accessibilityLabel="Call Patient"
                                    >
                                        <Phone size={16} color={colors.grayDark} style={{ marginRight: 4 }} />
                                    </TouchableOpacity>
                                </div>
                            ) : (
                                <TouchableOpacity
                                    style={styles.iconBtn}
                                    onPress={() => slot.clientMobile && Linking.openURL(`tel:${slot.clientMobile}`)}
                                    accessibilityLabel="Call Patient"
                                >
                                    <Phone size={16} color={colors.grayDark} style={{ marginRight: 4 }} />
                                </TouchableOpacity>
                            )}
                            <Text style={styles.patientMobile} numberOfLines={1} ellipsizeMode="tail">{slot.clientMobile || '--'}</Text>
                        </View>
                        <View style={styles.actionRow}>
                            <View style={styles.completedBadge}>
                                <Text style={styles.completedBadgeText}>Completed</Text>
                            </View>
                        </View>
                    </>
                )}
                {(isPast || isUnavailable || isCancelled) && (
                    <Text style={[styles.statusText, isPast || isUnavailable ? styles.statusTextUnavailable : null]}>{statusText}</Text>
                )}
            </View>
        </LinearGradient>
    );
}

interface DoctorSlotGridProps {
    doctors: any[];
    appointments: any[];
    clinicTimings: any;
    slotTimes: string[];
    selectedDate: string;
    onSlotAction: (action: string, doctor: any, slot: any) => void;
}

const DoctorSlotGrid: React.FC<DoctorSlotGridProps> = ({ doctors, appointments, clinicTimings, slotTimes, selectedDate, onSlotAction }) => {
    const now = new Date();
    const gridRef = useRef<any>(null);

    // Build a 2D grid: rows = slotTimes, columns = doctors
    const grid = slotTimes.map((time) => {
        return doctors.map((doctor) => {
            // Only use appointments for the selected date
            const appt = appointments.find(
                (a: any) => a.doctorId === doctor.id && a.date === selectedDate && (a.time === time || a.slot === time)
            );
            // Check if slot is in the past
            const slotDateTime = new Date(selectedDate);
            const [h, m] = time.split(':').map(Number);
            slotDateTime.setHours(h, m, 0, 0);
            let status = 'available';
            let clientName = undefined;
            let clientMobile = undefined;
            let appointmentId = undefined;
            let clientId = undefined;
            let statusReason = undefined;
            if (appt) {
                if (appt.status === 'scheduled') status = 'scheduled';
                else if (appt.status === 'completed') status = 'completed';
                else if (appt.status === 'cancelled') status = 'cancelled';
                else if (appt.status === 'no-showup') status = 'no-showup';
                clientName = appt.clientName;
                clientMobile = appt.clientMobile;
                appointmentId = appt.id;
                clientId = appt.clientId;
                statusReason = appt.statusReason;
            }
            // Mark as unavailable if in the past
            if (slotDateTime < now && status === 'available') {
                status = 'past';
            }
            // TODO: Mark as unavailable if doctor is not available for this slot (future improvement)
            return {
                id: `${doctor.id}_${selectedDate}_${time}`,
                time,
                status,
                clientName,
                clientMobile,
                appointmentId,
                clientId,
                statusReason,
                doctor,
                appt,
            };
        });
    });

    // Find the first future slot index for auto-scroll
    const firstFutureRow = slotTimes.findIndex((time) => {
        const slotDateTime = new Date(selectedDate);
        const [h, m] = time.split(':').map(Number);
        slotDateTime.setHours(h, m, 0, 0);
        return slotDateTime > now;
    });

    // Auto-scroll to first future slot on mount
    useEffect(() => {
        if (gridRef.current && firstFutureRow > 0) {
            setTimeout(() => {
                try {
                    gridRef.current.scrollTo({ y: firstFutureRow * 156, animated: true });
                } catch { }
            }, 200);
        }
    }, [firstFutureRow, selectedDate]);

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.outerScroll}
            contentContainerStyle={{ minWidth: Math.max(600, 180 * (doctors.length + 1)) }}
        >
            <View>
                {/* Sticky Header Row: empty cell + doctor names */}
                <View style={[styles.row, styles.headerRow, styles.stickyHeader, styles.headerShadow]}>
                    <View style={[styles.timeCell, { width: 90, minHeight: SLOT_SIZE.minHeight, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fa' }]}>
                        <Clock size={28} color="#1976D2" />
                    </View>
                    {doctors.map((doctor, idx) => (
                        <View
                            key={doctor.id}
                            style={{
                                backgroundColor: '#fff',
                                borderRadius: SLOT_SIZE.borderRadius,
                                shadowColor: '#000',
                                shadowOpacity: 0.08,
                                shadowOffset: { width: 0, height: 2 },
                                shadowRadius: 6,
                                elevation: 2,
                                width: SLOT_SIZE.minWidth,
                                minWidth: SLOT_SIZE.minWidth,
                                maxWidth: SLOT_SIZE.maxWidth,
                                minHeight: SLOT_SIZE.minHeight,
                                maxHeight: SLOT_SIZE.maxHeight,
                                margin: SLOT_SIZE.margin,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                            }}
                        >
                            <View style={{
                                width: 28,
                                height: 28,
                                borderRadius: 14,
                                backgroundColor: getAvatarColor(idx),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 4,
                            }}>
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{(() => {
                                    let clean = doctor.name.replace(/^Dr\.?\s*/i, '').trim();
                                    let initials = clean.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                                    if (initials.length < 2 && clean.length >= 2) initials = clean.slice(0, 2).toUpperCase();
                                    return initials;
                                })()}</Text>
                            </View>
                            <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#1a2233', textAlign: 'center', marginBottom: 2 }} numberOfLines={1} ellipsizeMode="tail">{'Dr. ' + doctor.name.replace(/^Dr\.?\s*/i, '').trim()}</Text>
                            {doctor.specialization && (
                                <Text style={{ fontSize: 12, color: '#888', textAlign: 'center' }} numberOfLines={1} ellipsizeMode="tail">{doctor.specialization}</Text>
                            )}
                        </View>
                    ))}
                </View>
                <ScrollView
                    ref={gridRef}
                    showsVerticalScrollIndicator={false}
                    style={styles.innerScroll}
                    contentContainerStyle={{ minHeight: 400 }}
                >
                    {/* Grid Rows: time + slots */}
                    {grid.map((row, rowIdx) => (
                        <View key={slotTimes[rowIdx]} style={styles.row}>
                            {/* Time cell */}
                            <View style={[styles.timeCell, { width: 90, minHeight: SLOT_SIZE.minHeight }]}>
                                <Text style={styles.timeText}>{slotTimes[rowIdx]}</Text>
                            </View>
                            {/* Slot cells */}
                            {row.map((slot, colIdx) => (
                                <DoctorSlotCell
                                    key={slot.id}
                                    slot={slot}
                                    onBook={() => onSlotAction('select', slot.doctor, slot)}
                                    onCancel={() => {
                                        if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                                            if (window.confirm('Are you sure you want to cancel this slot?')) {
                                                onSlotAction('cancel', slot.doctor, slot);
                                            }
                                        } else {
                                            Alert.alert(
                                                'Cancel Appointment',
                                                'Are you sure you want to cancel this slot?',
                                                [
                                                    { text: 'No', style: 'cancel' },
                                                    { text: 'Yes', onPress: () => onSlotAction('cancel', slot.doctor, slot) },
                                                ]
                                            );
                                        }
                                    }}
                                    onNoShow={() => onSlotAction('no-showup', slot.doctor, slot)}
                                    onMarkComplete={() => onSlotAction('complete', slot.doctor, slot)}
                                    onMenu={() => { }}
                                />
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    outerScroll: {
        flex: 1,
        backgroundColor: '#f7fafd',
        padding: 12,
    },
    innerScroll: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: SLOT_SIZE.minHeight,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerRow: {
        backgroundColor: '#f5f7fa',
        borderBottomWidth: 2,
        borderBottomColor: '#e0e0e0',
        zIndex: 10,
    },
    stickyHeader: {
        position: 'sticky',
        top: 0,
    },
    headerShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
    },
    headerCell: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        backgroundColor: '#f5f7fa',
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#1a2233',
        fontFamily: typography.fontFamily,
    },
    headerSubText: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 2,
        fontFamily: typography.fontFamily,
    },
    timeCell: {
        backgroundColor: '#f5f7fa',
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#e0e0e0',
        paddingVertical: 8,
    },
    timeText: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#1a2233',
        fontFamily: typography.fontFamily,
    },
    slot: {
        alignItems: 'stretch',
        justifyContent: 'center',
        alignSelf: 'center',
        overflow: 'hidden',
        shadowColor: colors.grayDark,
        shadowOpacity: 0.10,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
        position: 'relative',
        margin: 8,
        minWidth: SLOT_SIZE.minWidth,
        maxWidth: SLOT_SIZE.maxWidth,
        minHeight: SLOT_SIZE.minHeight,
        maxHeight: SLOT_SIZE.maxHeight,
        borderRadius: SLOT_SIZE.borderRadius,
        padding: 0,
        backgroundColor: 'transparent',
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        zIndex: 1,
    },
    avatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    patientAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#1976D2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    avatarText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        fontFamily: typography.fontFamily,
    },
    patientName: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#1a2233',
        maxWidth: 90,
        fontFamily: typography.fontFamily,
    },
    patientMobile: {
        fontSize: 13,
        color: '#1976D2',
        fontFamily: typography.fontFamily,
    },
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        justifyContent: 'center',
        gap: 8,
        alignItems: 'center',
    },
    iconBtn: {
        backgroundColor: 'transparent',
        borderRadius: 6,
        padding: 6,
        marginHorizontal: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1976D2',
        borderRadius: 22,
        paddingVertical: 10,
        paddingHorizontal: 28,
        marginTop: 12,
        alignSelf: 'center',
        shadowColor: '#1976D2',
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
        minWidth: 90,
        minHeight: 38,
        ...Platform.select({ web: { transition: 'box-shadow 0.2s, background 0.2s', cursor: 'pointer' }, default: {} }),
    },
    bookBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        fontFamily: typography.fontFamily,
        textAlign: 'center',
    },
    statusText: {
        marginTop: 18,
        fontSize: 15,
        color: '#888',
        fontWeight: '500',
        textAlign: 'center',
        fontFamily: typography.fontFamily,
    },
    statusTextUnavailable: {
        color: '#b71c1c',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    completedBadge: {
        backgroundColor: '#43A047',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        minWidth: 80,
        marginTop: 4,
    },
    completedBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        fontFamily: typography.fontFamily,
        textAlign: 'center',
    },
});

const doctorGridSharedStyles = StyleSheet.create({
    row: styles.row,
    headerRow: styles.headerRow,
    stickyHeader: styles.stickyHeader,
    headerShadow: styles.headerShadow,
    timeCell: styles.timeCell,
    timeText: styles.timeText,
    slot: styles.slot,
    centerContent: styles.centerContent,
});

export { doctorGridSharedStyles };

export default DoctorSlotGrid; 