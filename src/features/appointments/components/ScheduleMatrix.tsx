import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import { RoomMatrix, MatrixCell } from '../modal/buildScheduleMatrix';

interface Therapist { id: string; name: string; gender: string; availability: Record<string, string[]>; }

interface SelectedSlot {
  roomNumber: string;
  slot: string;
}

interface ScheduleMatrixProps {
  matrix: RoomMatrix[];
  conflicts: { date: string; slot: string; therapistIds: string[]; }[];
  selectedDate: string;
  selectedTherapists: string[];
  selectedSlot?: SelectedSlot;
  recommendedSlots?: SelectedSlot[];
  onSlotSelect?: (roomNumber: string, slot: string, date: string) => void;
}
const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  matrix,
  conflicts,
  selectedDate,
  selectedTherapists,
  selectedSlot,
  recommendedSlots,
  onSlotSelect,
}) => {

  function handleCellTap(roomNumber: string, slot: string) {
    if (typeof onSlotSelect === 'function') {
      onSlotSelect(roomNumber, slot, selectedDate);
    }
  }
  // Helper to check if a cell is in conflict
  function isCellConflict(roomNumber: string, slot: string): boolean {
    return conflicts.some(c => c.date === selectedDate && c.slot === slot && c.therapistIds.some(id => selectedTherapists.includes(id)));
  }
  console.log("ScheduleMatrix matrix prop:", matrix);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Therapy Room Schedule</Text>
      <View style={styles.tableWrapper}>
        <View style={{ flexDirection: 'row' }}>
          {/* Fixed Time Slot Column */}
          <View>
            {/* Header */}
            <View style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>Time Slot</Text>
            </View>
            {/* Time Slot Cells */}
            <FlatList
              data={matrix[0]?.slots || []}
              keyExtractor={slotObj => slotObj.slot}
              renderItem={({ item: slotObj }) => (
                <View style={styles.tableCellSlot}>
                  <Text style={styles.slotText}>{slotObj.slot}</Text>
                </View>
              )}
              scrollEnabled={false}
            />
          </View>

          {/* Scrollable Room Columns (headers + cells) */}
          <View style={{ flex: 1 }}>
            <FlatList
              data={matrix}
              horizontal
              keyExtractor={room => room.roomNumber}
              showsHorizontalScrollIndicator={true}
              renderItem={({ item: room, index: roomIdx }) => (
                <View>
                  {/* Header */}
                  <View style={styles.tableHeaderCell}>
                    <Text style={styles.tableHeaderText}>{room.roomName}</Text>
                  </View>
                  {/* Cells */}
                  <FlatList
                    data={room.slots}
                    keyExtractor={slotObj => slotObj.slot}
                    renderItem={({ item: slotObj, index: slotIdx }) => {
                      const isAvailable = !slotObj.isBooked && !isCellConflict(room.roomNumber, slotObj.slot) && room.slots[slotIdx].isRoomAvailable;
                      return (
                        <TouchableOpacity
                          key={room.roomNumber + '-' + slotObj.slot}
                          style={[
                            styles.tableCell,
                            isAvailable ? styles.cellAvailable : (!room.slots[slotIdx].isRoomAvailable ? styles.cellNA : styles.cellUnavailable)
                          ]}
                          disabled={!isAvailable}
                          onPress={() => handleCellTap(room.roomNumber, slotObj.slot)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.cellContentCenter}>
                            {isCellConflict(room.roomNumber, slotObj.slot) && (
                              <Text style={styles.conflictText}>Conflict</Text>
                            )}
                            {!isCellConflict(room.roomNumber, slotObj.slot) && slotObj.isBooked && (
                              <View style={styles.badgeBooked}><Text style={styles.badgeBookedText}>Booked</Text></View>
                            )}
                            {!isCellConflict(room.roomNumber, slotObj.slot) && !slotObj.isBooked && room.slots[slotIdx].isRoomAvailable && (
                              <Text style={styles.availableText}>Available</Text>
                            )}
                            {!isCellConflict(room.roomNumber, slotObj.slot) && !slotObj.isBooked && !room.slots[slotIdx].isRoomAvailable && (
                              <Text style={styles.naText}>N/A</Text>
                            )}
                            {slotObj.booking && (
                              <View style={styles.avatarsRow}>
                                {slotObj.booking.patientName && (
                                  <View style={styles.avatarPatient}><Text style={styles.avatarText}>{slotObj.booking.patientName[0]}</Text></View>
                                )}
                                {slotObj.booking.therapistName && (
                                  <View style={styles.avatarTherapist}><Text style={styles.avatarText}>{slotObj.booking.therapistName[0]}</Text></View>
                                )}
                                {slotObj.booking.tab === 'Therapy' && slotObj.booking.duration && (
                                  <Text style={styles.therapyDuration}>({slotObj.booking.duration} days)</Text>
                                )}
                                {slotObj.booking.tab !== 'Therapy' && slotObj.booking.duration && (
                                  <Text style={styles.therapyDuration}>({slotObj.booking.duration} minutes)</Text>
                                )}
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    scrollEnabled={false}
                  />
                </View>
              )}
              style={{ flexGrow: 0 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
  },
  tableWrapper: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 10,
    padding: 8,
    backgroundColor: '#F0F8FF',
  },
  tableHeaderRowSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 2,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 3 },
    }),
  },
  tableHeaderCell: {
    width: 110,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d3d3d3',
    padding: 0,
  },
  tableHeaderText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableCellSlot: {
    width: 110,
    height: 48,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    backgroundColor: '#f6f8fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  slotText: {
    color: '#333',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableCell: {
    width: 110,
    height: 48,
    borderWidth: 1,
    borderColor: '#d3d3d3',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 0,
  },
  cellContentCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  cellAvailable: {
    backgroundColor: '#e6f7ea',
  },
  cellUnavailable: {
    backgroundColor: '#fff',
  },
  cellNA: {
    backgroundColor: '#ffd6d6',
  },
  cellText: {
    color: '#333',
    fontSize: 14,
    textAlign: 'center',
  },
  availableTherapists: {
    color: '#1976d2',
    fontWeight: '600',
    fontSize: 12,
    marginTop: 2,
  },
  recommendedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ffe082',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  recommendedBadgeText: {
    color: '#795548',
    fontWeight: 'bold',
    fontSize: 10,
  },
  conflictText: {
    color: 'red',
    fontSize: 12,
    fontWeight: '700',
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
  availableText: {
    color: '#228B22',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  naText: {
    color: '#c00',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  avatarsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
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
  therapyName: {
    color: '#795548',
    fontWeight: '600',
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
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
