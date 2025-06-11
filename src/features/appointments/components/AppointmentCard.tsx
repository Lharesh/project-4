import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Modal, Pressable, ActionSheetIOS, Platform } from 'react-native';
import Card from '@/components/ui/Card';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Appointment as AppointmentBase } from '@/features/appointments/appointmentsSlice';
import styles from './AppointmentCard.styles';
import { format } from 'date-fns';
import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';
import slotStyles from './IntelligentSlot.styles';
import { Stethoscope } from 'lucide-react-native';

type Appointment = AppointmentBase & { roomName?: string };

const CARD_COLORS = {
  vata: { 600: '#6C8CBF', 700: '#4d6b99', 100: '#e3f0fa' },
  kapha: { 100: '#e6f4ea', 700: '#388e3c' },
  pitta: { 100: '#ffe8d2', 700: '#e65100' },
  neutral: { 900: '#1a2233', 700: '#6c757d', 500: '#adb5bd', 400: '#ced4da' },
};

const ICON_SIZE = 16;
const ICON_COLOR = CARD_COLORS.vata[700];

function ordinalDay(n?: number) {
  if (!n) return '';
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Helper for cross-platform truncation
function renderTruncatedText(children: React.ReactNode, style: any = {}, key?: string) {
  if (Platform.OS === 'web') {
    return (
      <span
        key={key}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'inline-block',
          maxWidth: '100%',
          ...style,
        }}
        title={typeof children === 'string' ? children : undefined}
      >
        {children}
      </span>
    );
  }
  // Native: Only allow string or a single React element
  let content: React.ReactNode = children;
  if (Array.isArray(children)) {
    if (children.every(child => typeof child === 'string')) {
      content = children.join('');
    } else {
      content = children[0]; // Only render the first element to avoid error
    }
  }
  return (
    <Text style={style} numberOfLines={1} ellipsizeMode="tail" key={key}>
      {content}
    </Text>
  );
}

// Add shared getStatusBackgroundColor function at the top of the file:
const getStatusBackgroundColor = (status: string) => {
  if (status === 'completed') return '#E8F5ED'; // Green pastel
  if (status === 'cancelled') return '#FFF8E1'; // Yellow/orange pastel
  if (status === 'scheduled') return '#E6EDFF'; // Blue pastel
  return '#fff';
};

export function AppointmentCard({ appointment, dayInfo, onBook, onCancel, onReschedule, onMarkComplete }: {
  appointment: Appointment,
  dayInfo?: { dayIndex: number, totalDays: number },
  onBook?: () => void,
  onCancel?: () => void,
  onReschedule?: () => void,
  onMarkComplete?: (appointment: Appointment) => void,
}) {
  const [menuVisible, setMenuVisible] = useState(false);

  // Use dayInfo if provided, else fallback to appointment fields
  const dayIndex = dayInfo?.dayIndex ?? appointment.dayIndex ?? 1;
  const totalDays = dayInfo?.totalDays ?? appointment.totalDays ?? 1;

  // Format slot time (assume appointment.time is "HH:mm")
  const slotTime = appointment.time
    ? format(new Date(`2000-01-01T${appointment.time}`), 'hh:mm a')
    : '--';

  // Unified 3-dots menu for both web and native
  const renderMenu = () => {
    if (Platform.OS === 'web') {
      return menuVisible ? (
        <>
          {/* Backdrop for closing menu on outside click */}
          <div
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999, background: 'transparent' }}
            onClick={() => setMenuVisible(false)}
          />
          <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 1000, background: '#fff', border: '1px solid #eee', borderRadius: 8, boxShadow: '0 2px 8px #0002', minWidth: 160 }}>
            <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setMenuVisible(false); onBook && onBook(); }}>New Appointment</button>
            <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setMenuVisible(false); onCancel && onCancel(); }}>Cancel</button>
            <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setMenuVisible(false); onReschedule && onReschedule(); }}>Reschedule</button>
            <button style={{ width: '100%', padding: 12, border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setMenuVisible(false); if (onMarkComplete) { console.log('[AppointmentCard] Mark Complete fields:', appointment); onMarkComplete(appointment); } }}>Mark Complete</button>
          </div>
        </>
      ) : null;
    }
    // Native: use Modal for menu
    return (
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setMenuVisible(false)}>
          <View style={{ position: 'absolute', right: 20, top: 60, backgroundColor: '#fff', borderRadius: 8, padding: 8, minWidth: 180, elevation: 8 }}>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setMenuVisible(false); onBook && onBook(); }}><Text>New Appointment</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setMenuVisible(false); onCancel && onCancel(); }}><Text>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setMenuVisible(false); onReschedule && onReschedule(); }}><Text>Reschedule</Text></TouchableOpacity>
            <TouchableOpacity style={{ padding: 12 }} onPress={() => { setMenuVisible(false); if (onMarkComplete) { console.log('[AppointmentCard] Mark Complete fields:', appointment); onMarkComplete(appointment); } }}><Text>Mark Complete</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    );
  };

  if (Platform.OS === 'web') {
    // Web: Center card with 15px left/right margin, maxWidth 800
    return (
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div style={{ maxWidth: 800, width: '100%', background: getStatusBackgroundColor(appointment.status), borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 12, marginLeft: 15, marginRight: 15, marginBottom: 8, position: 'relative' }}>
          {/* Top row: Day-X | Time | Duration */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 2 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><span style={{ marginRight: 4 }}>📅</span><span>{`Day-${dayIndex} (${totalDays} Days)`}</span></span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}><span style={{ marginRight: 4 }}>⏰</span><span>{slotTime}</span></span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ color: '#4d6b99', fontWeight: 700, fontSize: 16 }}>{appointment.duration ? `${appointment.duration} M` : '--'}</span>
            </div>
          </div>
          {/* Middle row: Client | Phone | Menu */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 2 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ marginRight: 4 }}>👤</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2233', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{appointment.clientName}</span>
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ color: '#4d6b99', marginRight: 4 }}>📞</span>
                <span style={{ fontSize: 14, color: '#1a2233' }}>{(appointment as any)[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] || '--'}</span>
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
              {appointment.status !== 'cancelled' && (
                <button
                  style={{ cursor: 'pointer', color: '#4d6b99', fontSize: 20, background: 'none', border: 'none', padding: 4, borderRadius: 20 }}
                  aria-label="More actions"
                  onClick={e => { e.stopPropagation(); setMenuVisible(v => !v); }}
                >
                  ⋮
                </button>
              )}
              {renderMenu()}
            </div>
          </div>
          {/* Bottom row: Therapists | Therapy | Room */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ color: '#4d6b99', marginRight: 4 }}>{Array.isArray(appointment.therapistNames) && appointment.therapistNames.length > 1 ? '👥' : '👤'}</span>
                <span style={{ fontSize: 13, color: '#6c757d', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{(appointment.therapistNames || []).join(', ')}</span>
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ color: '#4d6b99', marginRight: 4 }}>🩺</span>
                <span style={{ fontSize: 13, color: '#6c757d', fontWeight: 500 }}>{(appointment as any)[APPOINTMENT_PARAM_KEYS.TREATMENT_NAME] || '--'}</span>
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#4d6b99' }}>{appointment.roomName || appointment.roomNumber || '--'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Native (mobile/tablet) rendering with emoji icons
  return (
    <View style={{ position: 'relative' }}>
      <Card style={[styles.card, { backgroundColor: getStatusBackgroundColor(appointment.status) }]}>
        <View>
          <View style={styles.cardRow}>
            <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}> {/* Left */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 4 }}>📅</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#1a2233' }}>{`Day-${dayIndex} (${totalDays} Days)`}</Text>
              </View>
            </View>
            <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}> {/* Center */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 4 }}>⏰</Text>
                <Text style={{ color: '#4d6b99', fontWeight: 'bold', fontSize: 16 }}>{slotTime}</Text>
              </View>
            </View>
            <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}> {/* Right */}
              <Text style={{ color: '#4d6b99', fontWeight: 'bold', fontSize: 16 }}>{appointment.duration ? `${appointment.duration} M` : '--'}</Text>
            </View>
          </View>
          {/* Middle row: Client | Phone | Menu */}
          <View style={styles.cardRow}>
            <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}> {/* Left */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ marginRight: 4 }}>👤</Text>
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#1a2233', marginRight: 4 }} numberOfLines={1} ellipsizeMode="tail">{appointment.clientName && appointment.clientName.length > 12 ? appointment.clientName.slice(0, 11) + '…' : appointment.clientName}</Text>
              </View>
            </View>
            <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}> {/* Center */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#4d6b99', marginRight: 4 }}>📞</Text>
                <Text style={{ fontSize: 14, color: '#1a2233' }}>{(appointment as any)[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] || '--'}</Text>
              </View>
            </View>
            <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}> {/* Right */}
              {appointment.status !== 'cancelled' && (
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton} accessibilityLabel="More actions">
                  <Text style={{ fontSize: 20 }}>⋮</Text>
                </TouchableOpacity>
              )}
              {renderMenu()}
            </View>
          </View>
          {/* Bottom row: Therapists | Therapy | Room */}
          <View style={styles.cardRow}>
            <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}> {/* Left */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#4d6b99', marginRight: 4 }}>{Array.isArray(appointment.therapistNames) && appointment.therapistNames.length > 1 ? '👥' : '👤'}</Text>
                <Text style={{ fontSize: 13, color: '#6c757d', marginTop: 2 }} numberOfLines={1} ellipsizeMode="tail">{(appointment.therapistNames || []).join(', ')}</Text>
              </View>
            </View>
            <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}> {/* Center */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#4d6b99', marginRight: 4 }}>🩺</Text>
                <Text style={{ fontSize: 13, color: '#6c757d', fontWeight: '500' }}>{(appointment as any)[APPOINTMENT_PARAM_KEYS.TREATMENT_NAME] || '--'}</Text>
              </View>
            </View>
            <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}> {/* Right */}
              <Text style={{ fontWeight: 'bold', fontSize: 13, color: '#4d6b99' }}>{appointment.roomName || appointment.roomNumber || '--'}</Text>
            </View>
          </View>
        </View>
      </Card>
      {renderMenu()}
    </View>
  );
}

export default AppointmentCard;
