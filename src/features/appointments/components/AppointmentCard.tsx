import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking, Modal, Pressable, ActionSheetIOS, Platform } from 'react-native';
import Card from '@/components/ui/Card';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Appointment as AppointmentBase } from '@/features/appointments/appointmentsSlice';
import styles from './AppointmentCard.styles';

type Appointment = AppointmentBase & { roomName?: string };


const CARD_COLORS = {
  vata: { 600: '#6C8CBF', 700: '#4d6b99', 100: '#e3f0fa' },
  kapha: { 100: '#e6f4ea', 700: '#388e3c' },
  pitta: { 100: '#ffe8d2', 700: '#e65100' },
  neutral: { 900: '#1a2233', 700: '#6c757d', 500: '#adb5bd', 400: '#ced4da' },
};

function ordinalDay(n?: number) {
  if (!n) return '';
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}


export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const [menuVisible, setMenuVisible] = useState(false);

  // ActionSheet for iOS, Modal for Android
  const openMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions({
        options: ['Cancel', 'Reschedule', 'Record Completion', 'Close'],
        cancelButtonIndex: 3,
        destructiveButtonIndex: 0,
      }, (buttonIndex) => {
        // TODO: Implement actions
      });
    } else {
      setMenuVisible(true);
    }
  };

  return (
    <>
      <Card style={styles.card}>
        <View style={styles.cardRow}>
          <View style={[styles.cardCol, { alignItems: 'flex-start' }]}> 
            {/* Row 1: Slot Start time */}
            <View style={styles.cardCell}>
              <View style={styles.rowCellContent}>
                <MaterialIcons name="schedule" size={18} color={CARD_COLORS.vata[600]} style={styles.timeIcon} />
                <Text style={styles.timeText}>{appointment.time}</Text>
              </View>
            </View>
            {/* Row 2: Treatment Duration */}
            <View style={styles.cardCell}>
              <View style={styles.rowCellContent}>
                <MaterialIcons name="healing" size={18} color={CARD_COLORS.vata[600]} style={styles.timeIcon} />
                <Text style={styles.timeText}>{appointment.totalDays ? `${appointment.totalDays} days` : '--'}</Text>
              </View>
            </View>
            {/* Row 3: Therapists (first half) */}
            <View style={styles.cardCell}>
              {Array.isArray(appointment.therapistNames) && appointment.therapistNames.length > 0 ? (
                <Text style={styles.therapists} numberOfLines={1} ellipsizeMode="tail">
                  {appointment.therapistNames.slice(0, Math.ceil(appointment.therapistNames.length / 2)).join(', ')}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.cardCol, { alignItems: 'flex-start' }]}> 
            {/* Row 1: Patient Name */}
            <View style={styles.cardCell}>
              <View style={styles.rowCellContent}>
                <MaterialIcons name="person" size={16} color={CARD_COLORS.vata[700]} style={styles.personIcon} />
                <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">{appointment.clientName}</Text>
              </View>
            </View>
            {/* Row 2: Phone */}
            <View style={styles.cardCell}>
              {appointment.clientMobile ? (
                <View style={styles.rowCellContent}>
                  <MaterialIcons name="phone" size={15} color={CARD_COLORS.neutral[900]} style={styles.phoneIcon} />
                  <Text style={styles.phoneText}>{appointment.clientMobile}</Text>
                </View>
              ) : null}
            </View>
            {/* Row 3: Therapists (second half) */}
            <View style={styles.cardCell}>
              {Array.isArray(appointment.therapistNames) && appointment.therapistNames.length > 1 ? (
                <Text style={styles.therapists} numberOfLines={1} ellipsizeMode="tail">
                  {appointment.therapistNames.slice(Math.ceil(appointment.therapistNames.length / 2)).join(', ')}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.cardCol, { alignItems: 'flex-end' }]}> 
            {/* Row 1: Duration */}
            <View style={styles.cardCell}>
              <View style={styles.rowCellContent}>
                <MaterialIcons name="timer" size={18} color={CARD_COLORS.vata[600]} style={styles.timeIcon} />
                <Text style={styles.timeText}>{appointment.duration} M</Text>
              </View>
            </View>
            {/* Row 2: 3-dots menu */}
            <View style={styles.cardCell}>
              <TouchableOpacity onPress={openMenu} style={styles.menuButton} accessibilityLabel="More actions">
                <MaterialIcons name="more-vert" size={22} color={CARD_COLORS.neutral[700]} />
              </TouchableOpacity>
            </View>
            {/* Row 3: Status badge */}
            <View style={styles.cardCell}>
              <View style={styles.rowCellContent}>
                <Text style={styles.statusBadge}>{appointment.status ? appointment.status.toUpperCase() : ''}</Text>
              </View>
            </View>
          </View>
        </View>
      </Card>
      {Platform.OS === 'android' && (
        <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={() => setMenuVisible(false)}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} onPress={() => setMenuVisible(false)}>
            <View style={{ position: 'absolute', right: 20, top: 40, backgroundColor: '#fff', borderRadius: 8, elevation: 4, minWidth: 160, paddingVertical: 6 }}>
              {['Cancel', 'Reschedule', 'Record Completion'].map((option, idx) => (
                <TouchableOpacity key={option} onPress={() => { setMenuVisible(false); /* TODO: Implement actions */ }} style={{ padding: 12 }}>
                  <Text style={{ fontSize: 15, color: '#222' }}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
}
      

export default AppointmentCard;
