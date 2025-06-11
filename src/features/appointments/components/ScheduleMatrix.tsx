import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (TherapyAppointments).
// This is a strict project rule for appointments.
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import IntelligentSlot from './IntelligentSlot';
import { safeFormatDate } from '../helpers/dateHelpers';
import { SLOT_STATUS } from '../constants/status';
// Import DoctorSlotGrid styles for shared grid look
import { doctorGridSharedStyles } from './DoctorSlotGrid';

interface SelectedSlot {
  id: string;
  slot: string;
}

interface RoomSlot {
  start: string;
  end: string;
  isBreak: boolean;
  therapistAvailable: boolean;
  availableTherapists: any[];
  booking: any;
  status: string;
}
interface MatrixRoom {
  id: string;
  roomName: string;
  name?: string;
  slots: RoomSlot[];
}
interface ScheduleMatrixProps {
  matrix: MatrixRoom[];
  conflicts: { date: string; slot: string; therapistIds: string[]; }[];
  selectedDate: string;
  selectedTherapists: string[];
  selectedSlot?: SelectedSlot;
  recommendedSlots?: SelectedSlot[];
  onSlotSelect?: (roomId: string, slot: string, date: string) => void;
  therapists: any[];
  onCreateSlot?: (slotInfo: { roomId: string; date: string; startTime: string; endTime: string; duration: number }) => void;
  highlightedSlot?: { slotStart: string; slotRoom: string };
  onCloseModal?: () => void;
  onCancelAppointment?: (appointmentId: string) => void;
  onRescheduleAppointment?: (booking: any) => void;
  onCompleteAppointment?: (booking: any) => void;
  onBook?: (slot: RoomSlot, room: MatrixRoom) => void;
  onCancel?: (appointmentId: string) => void;
  onReschedule?: (booking: any) => void;
  onComplete?: (booking: any) => void;
}
const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  matrix,
  conflicts,
  selectedDate,
  selectedTherapists,
  selectedSlot,
  recommendedSlots,
  onSlotSelect,
  therapists,
  onCreateSlot,
  highlightedSlot,
  onCloseModal,
  onCancelAppointment,
  onRescheduleAppointment,
  onCompleteAppointment,
  onBook,
  onCancel,
  onReschedule,
  onComplete,
}) => {

  function handleCellTap(roomNumber: string, slot: string) {
    if (typeof onSlotSelect === 'function') {
      onSlotSelect(roomNumber, slot, selectedDate);
    }
  };
  console.log('[ScheduleMatrix] matrix prop:', matrix);
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ width: '100%' }}
        contentContainerStyle={{ minWidth: matrix.length * 160 }}
      >
        <View style={{ flex: 1, minWidth: matrix.length * 160 }}>
          {/* Sticky Header Row: only room names, no time/clock column */}
          <View style={[
            styles.row,
            styles.headerRow,
            styles.headerShadow,
            {
              minWidth: matrix.length * 160 + matrix.length * 20,
              height: undefined,
              minHeight: 80,
              marginTop: 8,
              marginBottom: 24,
              paddingTop: 0,
              paddingBottom: 0,
              position: 'relative',
              zIndex: 100,
              overflow: 'visible',
            },
          ]}>
            {matrix.map((room, idx) => {
              // Dosha color cycle
              const doshaColors = ['#6C8CBF', '#E3A857', '#7CB342']; // Vata, Pitta, Kapha
              const iconBg = doshaColors[idx % doshaColors.length];
              return (
                <View
                  key={room.id}
                  style={{
                    flex: 1,
                    minWidth: 125,
                    maxWidth: 155,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    backgroundColor: 'transparent',
                    borderRadius: 0,
                    margin: 0,
                    padding: 0,
                    minHeight: 80,
                    paddingTop: 24,
                    paddingBottom: 24,
                    marginTop: 0,
                    marginBottom: 0,
                    display: 'flex',
                    overflow: 'visible',
                  }}
                >
                  <View style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: iconBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 6,
                    zIndex: 1,
                    display: 'flex',
                  }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>🏠</Text>
                  </View>
                  <Text style={{ fontWeight: '900', fontSize: 16, color: '#1a2233', textAlign: 'center', alignSelf: 'center', marginBottom: 0 }} numberOfLines={1} ellipsizeMode="tail">{room.roomName || room.name || room.id || 'Room'}</Text>
                </View>
              );
            })}
          </View>
          {/* Slot grid: rows = time slots, columns = rooms (no time column) */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ width: '100%' }}
            contentContainerStyle={{ flexGrow: 1, minWidth: matrix.length * 160 }}
          >
            {matrix.length > 0 && matrix[0].slots.map((slot, rowIdx) => (
              <View key={slot.start} style={[styles.row, { minWidth: matrix.length * 160 }]}>
                {/* Slot cells for each room */}
                {matrix.map((room, colIdx) => {
                  const slotObj = room.slots[rowIdx];
                  const formattedDate = safeFormatDate(selectedDate, '', 'yyyy-MM-dd');
                  let therapistsToShow = slotObj.availableTherapists;
                  if (slotObj.status === SLOT_STATUS.SCHEDULED && slotObj.booking) {
                    if (Array.isArray(slotObj.booking.therapists) && slotObj.booking.therapists.length > 0) {
                      therapistsToShow = slotObj.booking.therapists;
                    } else if (Array.isArray(slotObj.booking.therapistIds)) {
                      therapistsToShow = slotObj.booking.therapistIds.map(
                        (id: string) => therapists.find((t: any) => t.id === id)
                      ).filter(Boolean);
                    }
                  }
                  return (
                    <View
                      key={room.id + '-' + slotObj.start}
                      style={{
                        minWidth: 125,
                        maxWidth: 155,
                        margin: 0,
                        borderRadius: 0,
                        padding: 0,
                        overflow: 'visible',
                      }}
                    >
                      <IntelligentSlot
                        startTime={slotObj.start}
                        endTime={slotObj.end}
                        duration={slotObj.booking?.duration || 60}
                        clientId={slotObj.booking?.patientId || ''}
                        patientName={slotObj.booking?.patientName || ''}
                        patientPhone={slotObj.booking?.patientPhone || ''}
                        therapyName={slotObj.booking?.therapyName || ''}
                        treatmentDay={slotObj.booking?.treatmentDay}
                        availableTherapists={therapistsToShow}
                        status={slotObj.status}
                        onBook={slotObj.status === SLOT_STATUS.AVAILABLE || slotObj.status === SLOT_STATUS.CANCELLED_AVAILABLE ? () => onBook && onBook(slotObj, room) : undefined}
                        onReschedule={slotObj.status === SLOT_STATUS.SCHEDULED && slotObj.booking && onRescheduleAppointment
                          ? () => onRescheduleAppointment(slotObj.booking)
                          : undefined}
                        onCancel={onCancelAppointment && slotObj.booking ? () => onCancelAppointment(slotObj.booking.id) : undefined}
                        onMarkComplete={slotObj.status === SLOT_STATUS.SCHEDULED && slotObj.booking && onCompleteAppointment
                          ? () => onCompleteAppointment(slotObj.booking)
                          : undefined}
                        onCreate={slotObj.status === SLOT_STATUS.AVAILABLE || slotObj.status === SLOT_STATUS.CANCELLED_AVAILABLE ? () => onCreateSlot && onCreateSlot({
                          roomId: room.id,
                          date: formattedDate,
                          startTime: slotObj.start,
                          endTime: slotObj.end,
                          duration: slotObj.booking?.duration || 60
                        }) : undefined}
                        roomId={room.id}
                        date={formattedDate}
                        onCloseModal={onCloseModal}
                      />
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const { width, height } = require('react-native').Dimensions.get('window');
const isPortrait = height >= width;
const isMobile = width < 600;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    margin: 0,
    backgroundColor: '#fff',
    width: '100%',
    alignSelf: 'stretch',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
  },
  roomsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 0,
    margin: 0,
    width: '100%',
  },
  roomColumn: {
    minWidth: 180,
    maxWidth: 220,
    marginRight: 18,
    paddingBottom: 10,
  },
  roomHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 6,
    color: '#333',
    textAlign: 'center',
  },
  slotCardCol: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  // Shared grid/header/row/slot/timeCell styles from DoctorSlotGrid
  row: {
    ...doctorGridSharedStyles.row,
    margin: 0,
    padding: 0,
    width: '100%',
    minWidth: 0,
    flex: 1,
  },
  headerRow: {
    ...doctorGridSharedStyles.headerRow,
    margin: 0,
    padding: 0,
    width: '100%',
    minWidth: 0,
    flex: 1,
  },
  headerShadow: doctorGridSharedStyles.headerShadow,
  timeCell: doctorGridSharedStyles.timeCell,
  timeText: doctorGridSharedStyles.timeText,
  slot: {
    ...doctorGridSharedStyles.slot,
    margin: 0,
    padding: 0,
    minWidth: 0,
    maxWidth: '100%',
    flex: 1,
  },
  centerContent: doctorGridSharedStyles.centerContent,
});

export default ScheduleMatrix;
