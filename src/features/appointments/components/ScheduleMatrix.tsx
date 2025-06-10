import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
// DO NOT use Redux selectors or dispatch in this file.
// All data and callbacks must be passed as props from the parent (TherapyAppointments).
// This is a strict project rule for appointments.
import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import IntelligentSlot from './IntelligentSlot';
import { safeFormatDate } from '../helpers/dateHelpers';
import { SLOT_STATUS } from '../constants/status';

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
}) => {

  function handleCellTap(roomNumber: string, slot: string) {
    if (typeof onSlotSelect === 'function') {
      onSlotSelect(roomNumber, slot, selectedDate);
    }
  };
  console.log('[ScheduleMatrix] matrix prop:', matrix);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Therapy Room Schedule</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roomsScrollContainer}
      >
        {matrix.map((room) => (
          <View key={room.id} style={styles.roomColumn}>
            <Text style={styles.roomHeader}>{room.roomName}</Text>
            <View style={styles.slotCardCol}>
              {room.slots.map((slotObj, idx) => {
                const status = slotObj.status;
                const isHighlighted = highlightedSlot && room.id === highlightedSlot.slotRoom && slotObj.start === highlightedSlot.slotStart;
                const formattedDate = safeFormatDate(selectedDate, '', 'yyyy-MM-dd');
                let therapistsToShow = slotObj.availableTherapists;
                if (status === SLOT_STATUS.SCHEDULED && slotObj.booking) {
                  // Show only assigned therapists for scheduled slots
                  if (Array.isArray(slotObj.booking.therapists) && slotObj.booking.therapists.length > 0) {
                    therapistsToShow = slotObj.booking.therapists;
                  } else if (Array.isArray(slotObj.booking.therapistIds)) {
                    therapistsToShow = slotObj.booking.therapistIds.map(
                      (id: string) => therapists.find((t: any) => t.id === id)
                    ).filter(Boolean);
                  }
                }
                return (
                  <View key={room.id + '-' + slotObj.start} style={isHighlighted ? { borderColor: '#1976d2', borderWidth: 2, backgroundColor: '#e3f0fa', borderRadius: 12 } : undefined}>
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
                      status={status}
                      onBook={status === SLOT_STATUS.AVAILABLE || status === SLOT_STATUS.CANCELLED_AVAILABLE ? () => handleCellTap(room.id, slotObj.start) : undefined}
                      onReschedule={status === SLOT_STATUS.SCHEDULED && slotObj.booking && onRescheduleAppointment
                        ? () => onRescheduleAppointment(slotObj.booking)
                        : undefined}
                      onCancel={onCancelAppointment && slotObj.booking ? () => {
                        console.log('[SCHEDULE_MATRIX] onCancel wrapper called for:', slotObj.booking.id);
                        onCancelAppointment(slotObj.booking.id);
                      } : undefined}
                      onConfirmVisit={status === SLOT_STATUS.SCHEDULED && slotObj.booking && onCompleteAppointment
                        ? () => onCompleteAppointment(slotObj.booking)
                        : undefined}
                      onCreate={status === SLOT_STATUS.AVAILABLE || status === SLOT_STATUS.CANCELLED_AVAILABLE ? () => onCreateSlot && onCreateSlot({
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
          </View>
        )
        )}
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
    padding: 10,
    backgroundColor: '#fff',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
  },
  roomsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 10,
  },
  roomColumn: {
    minWidth: isMobile ? 180 : 220,
    maxWidth: isMobile ? 220 : 300,
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
  slotCard: {
    width: isMobile ? 140 : 180,
    minHeight: isMobile ? 52 : 72,
    borderRadius: 12,
    paddingVertical: isMobile ? 10 : 16,
    paddingHorizontal: isMobile ? 6 : 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 10,
  },
  cardAvailable: {
    backgroundColor: '#e6f7ea',
    borderColor: '#3ad29f',
    borderWidth: 1,
  },
  cardUnavailable: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardBreak: {
    backgroundColor: '#ffd6d6',
    borderColor: '#ff8888',
    borderWidth: 1,
  },
  cardBooked: {
    backgroundColor: '#ffeeba',
    borderColor: '#ffc107',
    borderWidth: 1,
  },
  slotCardTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardBreakText: {
    color: '#c00',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  cardUnavailableText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  badgeBooked: {
    backgroundColor: '#8B0000',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginVertical: 2,
  },
  badgeBookedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatarPatient: {
    backgroundColor: '#1976d2',
    color: '#fff',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  avatarTherapist: {
    backgroundColor: '#87CEEB',
    color: '#fff',
    borderRadius: 14,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  therapyDuration: {
    color: '#795548',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
});

export default ScheduleMatrix;
