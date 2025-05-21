import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Card from '@/components/ui/Card';
import { Clock, Phone } from 'lucide-react-native';
import { Appointment } from '@/features/appointments/appointmentsSlice';
import type { ViewStyle } from 'react-native';
let styles: any = {};
try {
  styles = require('./index').default || require('./index');
} catch (e) {
  styles = {
    card: {borderRadius: 12, backgroundColor: '#fff', marginBottom: 8, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2},
    timeText: {fontSize: 15, marginLeft: 8, fontWeight: 'bold'},
    doctorName: {fontSize: 14, fontWeight: '600', color: '#4d6b99'},
    statusLabel: {borderRadius: 8, fontWeight: 'bold'},
    therapistNames: {fontSize: 13, color: '#4d6b99'},
  };
}
const COLORS = {
  vata: { 600: '#6C8CBF', 700: '#4d6b99', 100: '#e3f0fa' },
  kapha: { 100: '#e6f4ea', 700: '#388e3c' },
  pitta: { 100: '#ffe8d2', 700: '#e65100' },
  neutral: { 900: '#1a2233', 700: '#6c757d', 500: '#adb5bd', 400: '#ced4da' },
};

export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Card style={[(styles.card || {borderRadius: 12, backgroundColor: '#fff', marginBottom: 8, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2}), { paddingVertical: 8, paddingHorizontal: 10, marginBottom: 8 }]}> 
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
        {/* Left column: Time, Patient, Contact, Treatment, Room, Duration, Notes */}
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Clock size={16} color={COLORS.vata[600]} />
            <Text style={[(styles.timeText || {fontSize: 15, marginLeft: 8, fontWeight: 'bold'}), { color: COLORS.vata[600], fontWeight: 'bold' }]}>{appointment.time}</Text>
          </View>
          <Text style={{ fontWeight: 'bold', fontSize: 15, color: COLORS.neutral[900], marginTop: 2, marginBottom: 0 }}>
            {appointment.clientName} {appointment.clientId ? <Text style={{ color: COLORS.neutral[500], fontSize: 13 }}>({appointment.clientId})</Text> : null}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 0, marginBottom: 0 }}>
            {appointment.clientMobile ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${appointment.clientMobile}`)}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Phone size={13} color={COLORS.neutral[500]} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 13, color: COLORS.neutral[700], marginRight: 10 }}>{appointment.clientMobile}</Text>
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
          {appointment.tab === 'Therapy' && appointment.dayIndex && appointment.totalDays && appointment.treatmentName ? (
  <>
    {appointment.roomNumber ? (
      <Text style={{ fontSize: 12, color: COLORS.neutral[500], marginTop: 0, marginBottom: 0 }}>Room: {appointment.roomNumber}</Text>
    ) : null}
    <Text style={{ fontSize: 12, color: COLORS.neutral[500], marginTop: 0, marginBottom: 0 }}>
      Duration: {appointment.totalDays} {appointment.totalDays === 1 ? 'day' : 'days'}
    </Text>
    <Text style={{ fontSize: 13, color: COLORS.vata[700], fontWeight: '600', marginTop: 0, marginBottom: 0 }}>
      Day {appointment.dayIndex} of {appointment.totalDays}: {appointment.treatmentName}
    </Text>
  </>
) : (
  <>
    <Text style={{ color: COLORS.vata[600], fontWeight: 'normal', fontSize: 13, marginTop: 0, marginBottom: 0 }}>{appointment.treatmentName}</Text>
    {appointment.roomNumber ? (
      <Text style={{ fontSize: 12, color: COLORS.neutral[500], marginTop: 0, marginBottom: 0 }}>Room: {appointment.roomNumber}</Text>
    ) : null}
    <Text style={{ fontSize: 12, color: COLORS.neutral[500], marginTop: 0, marginBottom: 0 }}>
      Duration: {appointment.duration || 15} min
    </Text>
  </>
)}
          {appointment.notes ? <Text style={{ fontSize: 12, color: COLORS.neutral[400], marginTop: 0, marginBottom: 0 }}>Notes: {appointment.notes}</Text> : null}
        </View>
        {/* Right column: Doctor, Status, Therapist Names */}
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: 70 }}>
          {appointment.doctorName ? (
            <Text style={[(styles.doctorName || {fontSize: 14, fontWeight: '600', color: COLORS.vata[700]}), { textAlign: 'right', width: '100%', marginBottom: 6 }]}>{appointment.doctorName}</Text>
          ) : null}
          <Text style={[(styles.statusLabel || {borderRadius: 8, fontWeight: 'bold'}), {
            backgroundColor:
              appointment.status === 'completed' ? COLORS.kapha[100] :
              appointment.status === 'cancelled' ? COLORS.pitta[100] : COLORS.vata[100],
            color:
              appointment.status === 'completed' ? COLORS.kapha[700] :
              appointment.status === 'cancelled' ? COLORS.pitta[700] : COLORS.vata[700],
            alignSelf: 'flex-end',
            fontSize: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
            marginBottom: 6,
          }]}> {appointment.status.toUpperCase()} </Text>
          {appointment.therapistNames && appointment.therapistNames.length > 0 ? (
            <Text style={[(styles.therapistNames || {fontSize: 13, color: COLORS.vata[700]}), { textAlign: 'right', width: '100%', marginBottom: 6 }]}>{appointment.therapistNames.join(', ')}</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
}

export default AppointmentCard;
