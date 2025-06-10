import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Modal, Pressable, ActionSheetIOS, Platform } from 'react-native';
import Card from '@/components/ui/Card';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Appointment as AppointmentBase } from '@/features/appointments/appointmentsSlice';
import styles from './AppointmentCard.styles';
import { format } from 'date-fns';
import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';

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

export function AppointmentCard({ appointment, dayInfo, onCancel }: { appointment: Appointment, dayInfo?: { dayIndex: number, totalDays: number }, onCancel?: () => void }) {
  const [menuVisible, setMenuVisible] = useState(false);

  // Use dayInfo if provided, else fallback to appointment fields
  const dayIndex = dayInfo?.dayIndex ?? appointment.dayIndex ?? 1;
  const totalDays = dayInfo?.totalDays ?? appointment.totalDays ?? 1;

  // Format slot time (assume appointment.time is "HH:mm")
  const slotTime = appointment.time
    ? format(new Date(`2000-01-01T${appointment.time}`), 'hh:mm a')
    : '--';

  // ActionSheet for iOS, Modal for Android
  const openMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Reschedule', 'Record Completion', 'Close'],
        cancelButtonIndex: 3,
        destructiveButtonIndex: 0,
      }, (buttonIndex) => {
        if (buttonIndex === 0 && typeof onCancel === 'function') onCancel();
        // TODO: Implement other actions
      });
    } else {
      setMenuVisible(true);
    }
  };

  if (Platform.OS === 'web') {
    // Web: Center card with 15px left/right margin, maxWidth 800
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: 800, width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #0001', padding: 12, marginLeft: 15, marginRight: 15, marginBottom: 8 }}>
          {/* Row 1 */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 2 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>📅</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2233', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{`Day-${dayIndex} (${totalDays} Days)`}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>⏰</span>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#1a2233', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{appointment.time ? format(new Date(`2000-01-01T${appointment.time}`), 'hh:mm a') : '--'}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>⏱️</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1a2233', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{appointment.duration ? `${appointment.duration} M` : '--'}</span>
            </div>
          </div>
          {/* Row 2 */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: 2 }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>👤</span>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2233', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{appointment.clientName}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>📞</span>
              <span style={{ fontSize: 14, color: '#1a2233', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{(appointment as any)[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] || '--'}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ cursor: 'pointer', color: '#4d6b99', fontSize: 20 }}>⋮</span>
            </div>
          </div>
          {/* Row 3 */}
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>{Array.isArray(appointment.therapistNames) && appointment.therapistNames.length > 1 ? '👥' : '👤'}</span>
              <span style={{ fontSize: 13, color: '#6c757d', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{(appointment.therapistNames || []).join(', ')}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4d6b99', marginRight: 4 }}>💊</span>
              <span style={{ fontSize: 13, color: '#6c757d', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', maxWidth: '100%' }}>{(appointment as any)[APPOINTMENT_PARAM_KEYS.TREATMENT_NAME] || '--'}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ background: '#e3f0fa', color: '#4d6b99', fontWeight: 700, fontSize: 13, padding: '3px 10px', borderRadius: 12, minWidth: 70, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{appointment.status ? appointment.status.toUpperCase() : ''}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Native (mobile/tablet) rendering with emoji icons
  return (
    <Card style={styles.card}> {/* No margin for mobile */}
      {/* Row 1 */}
      <View style={styles.cardRow}>
        <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}> {/* Left */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>��</Text>
            <Text>{renderTruncatedText(`Day-${dayIndex} (${totalDays} Days)`)} </Text>
          </View>
        </View>
        <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}> {/* Center */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>⏰</Text>
            <Text>{renderTruncatedText((appointment as any).slotStart || (appointment as any).startTime || appointment.time || '--')}</Text>
          </View>
        </View>
        <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}> {/* Right */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>⏱️</Text>
            <Text>{renderTruncatedText(appointment.duration ? `${appointment.duration} M` : '--')}</Text>
          </View>
        </View>
      </View>
      {/* Row 2 */}
      <View style={styles.cardRow}>
        <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}> {/* Left */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>👤</Text>
            <Text>{renderTruncatedText(appointment.clientName)}</Text>
          </View>
        </View>
        <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}> {/* Center */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>📞</Text>
            {Platform.select({
              web: <Text>{renderTruncatedText(appointment.clientMobile || (appointment as any)[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] || '--', styles.phoneText)}</Text>,
              default: (
                <TouchableOpacity
                  onPress={() => {
                    const phone = appointment.clientMobile || (appointment as any)[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE];
                    if (phone) Linking.openURL(`tel:${phone}`);
                  }}
                  activeOpacity={0.7}
                >
                  <Text>{appointment.clientMobile || (appointment as any)[APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE] || '--'}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>
        <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}> {/* Right */}
          <TouchableOpacity onPress={openMenu} style={styles.menuButton} accessibilityLabel="More actions">
            <Text style={{ fontSize: 20 }}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Row 3 */}
      <View style={styles.cardRow}>
        <View style={[styles.cardCell, { alignItems: 'flex-start', minWidth: 0 }]}> {/* Left */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>{Array.isArray(appointment.therapistNames) && appointment.therapistNames.length > 1 ? '👥' : '👤'}</Text>
            <Text>{renderTruncatedText((appointment.therapistNames || []).join(', '))}</Text>
          </View>
        </View>
        <View style={[styles.cardCell, { alignItems: 'center', minWidth: 0 }]}> {/* Center */}
          <View style={styles.rowCellContent}>
            <Text style={{ marginRight: 4 }}>💊</Text>
            <Text>{renderTruncatedText((appointment as any).therapyName || appointment.treatmentName || (appointment as any)[APPOINTMENT_PARAM_KEYS.TREATMENT_NAME] || '--')}</Text>
          </View>
        </View>
        <View style={[styles.cardCell, { alignItems: 'flex-end', minWidth: 0 }]}> {/* Right */}
          <Text>{renderTruncatedText(appointment.status ? appointment.status.toUpperCase() : '', styles.statusBadge)}</Text>
        </View>
      </View>
    </Card>
  );
}


export default AppointmentCard;
