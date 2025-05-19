import React, { useState } from 'react';
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
  console.log("ScheduleMatrix conflicts prop:", conflicts);
  console.log("ScheduleMatrix selectedDate prop:", selectedDate);
  console.log("ScheduleMatrix selectedTherapists prop:", selectedTherapists);
  console.log("ScheduleMatrix selectedSlot prop:", selectedSlot);
  console.log("ScheduleMatrix recommendedSlots prop:", recommendedSlots);
  console.log("ScheduleMatrix onSlotSelect prop:", onSlotSelect);
  return (
    <div style={{ fontFamily: 'Sans-serif', padding: 20 }}>
      <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 18 }}>Therapy Room Schedule</div>
      <div style={{ overflowX: 'auto', marginBottom: 10, border: '1px solid #D3D3D3', borderRadius: 10, padding: 8 }}>
        {/* Vertical orientation: Rooms as columns, Slots as rows */}
        <div style={{ overflowX: 'auto', width: '100%', minWidth: Math.max(700, 140 * Math.max(matrix.length, 7)) }}>
          <table style={{ borderCollapse: 'collapse', minWidth: Math.max(700, 140 * Math.max(matrix.length, 7)), width: '100%' }} className="schedule-matrix-table">
            <thead>
              <tr>
                <th style={{ width: 120, textAlign: 'left', background: '#F0F8FF', border: '1px solid #D3D3D3', fontWeight: 'bold', fontSize: 14 }}>Time Slot</th>
                {matrix.map(room => (
                  <th key={room.roomNumber} style={{ width: 140, textAlign: 'center', background: '#F0F8FF', border: '1px solid #D3D3D3', fontWeight: 'bold', fontSize: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600 }}>{room.roomName}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Render each slot as a row, each room as a column */}
              {matrix[0]?.slots.map((slotObj: MatrixCell, slotIdx: number) => (
                <tr key={slotObj.slot}>
                  <td style={{ border: '1px solid #D3D3D3', background: '#f9f9fc', fontWeight: 600, fontSize: 15, padding: 8, minHeight: 60 }}>{slotObj.slot}</td>
                  {matrix.map((room) => {
                    const cell = room.slots[slotIdx];
                    const isConflict = isCellConflict(room.roomNumber, cell.slot);
                    const isSelected = selectedSlot && selectedSlot.roomNumber === room.roomNumber && selectedSlot.slot === cell.slot;
                    const isRecommended = recommendedSlots && recommendedSlots.some((s: any) => s.roomNumber === room.roomNumber && s.slot === cell.slot);
                    const selectable = !cell.isBooked && !isConflict && cell.isRoomAvailable;
                    let background = '#f0f0f0';
                    if (isSelected) background = '#e3f2fd';
                    else if (isConflict) background = '#ffe6e6';
                    else if (cell.isBooked) background = '#8B0000';
                    else if (cell.isRoomAvailable) background = '#90EE90';
                    else if (cell.booking && cell.booking.reserved) background = '#87CEEB';
                    if (isRecommended) background = '#fff9c4';

                    return (
                      <td
                        key={room.roomNumber + '-' + cell.slot}
                        style={{
                          border: '1px solid #D3D3D3',
                          borderRadius: 6,
                          textAlign: 'center',
                          verticalAlign: 'middle',
                          background,
                          minWidth: 120,
                          minHeight: 60,
                          cursor: selectable && onSlotSelect ? 'pointer' : 'default',
                          position: 'relative',
                          padding: 8,
                          transition: 'background 0.2s',
                          boxSizing: 'border-box',
                          wordBreak: 'break-word',
                        }}
                        onClick={() => {
                          if (selectable && onSlotSelect) onSlotSelect(room.roomNumber, cell.slot, selectedDate);
                          if (selectable) handleCellTap(room.roomNumber, cell.slot);
                        }}
                        title={
                          isConflict
                            ? `Therapist conflict at ${cell.slot}. Therapists: ${conflicts
                              .filter(c => c.date === selectedDate && c.slot === cell.slot)
                              .flatMap(c => c.therapistIds.filter(id => selectedTherapists.includes(id)))
                              .join(', ')}`
                            : ''
                        }
                      >
                        {/* Avatars and status */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          {/* Status/Label */}
                          {isConflict && (
                            <span style={{ color: 'red', fontSize: 12, fontWeight: 700 }}>Conflict</span>
                          )}
                          {!isConflict && cell.isBooked && (
                            <span style={{ color: '#fff', background: '#8B0000', borderRadius: 4, padding: '0 6px', fontSize: 12 }}>Booked</span>
                          )}
                          {!isConflict && !cell.isBooked && cell.isRoomAvailable && (
                            <span style={{ color: '#228B22', fontWeight: 600, fontSize: 12 }}>Available</span>
                          )}
                          {!isConflict && !cell.isBooked && !cell.isRoomAvailable && (
                            <span style={{ color: '#aaa', fontSize: 12 }}>N/A</span>
                          )}
                          {/* Patient/Therapist avatars */}
                          {cell.booking && (
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: 3 }}>
                              {cell.booking.patientName && (
                                <span style={{ background: '#1976d2', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                                  {cell.booking.patientName[0]}
                                </span>
                              )}
                              {cell.booking.therapistName && (
                                <span style={{ background: '#87CEEB', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                                  {cell.booking.therapistName[0]}
                                </span>
                              )}
                            </div>
                          )}
                          {/* Therapy name */}
                          {cell.booking && cell.booking.therapyName && (
                            <div>
                              {cell.booking.tab === 'Therapy' && (
                                <span style={{ color: '#795548', fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                  Day {cell.booking.dayIndex} of {cell.booking.totalDays}: {cell.booking.therapyName}
                                </span>
                              )}
                              {cell.booking.tab !== 'Therapy' && (
                                <span style={{ color: '#795548', fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                  {cell.booking.therapyName}
                                </span>
                              )}
                              {cell.booking.tab === 'Therapy' && cell.booking.duration && (
                                <span style={{ color: '#795548', fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                  ({cell.booking.duration} days)
                                </span>
                              )}
                              {cell.booking.tab !== 'Therapy' && cell.booking.duration && (
                                <span style={{ color: '#795548', fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                                  ({cell.booking.duration} minutes)
                                </span>
                              )}
                            </div>
                          )}
                          {/* Available therapists */}
                          {!cell.isBooked && cell.availableTherapists && cell.availableTherapists.length > 0 && (
                            <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12, marginTop: 2 }}>
                              {cell.availableTherapists.map((t, idx, arr) => `${t.name}${idx < arr.length - 1 ? ', ' : ''}`)}
                            </span>
                          )}
                          {/* Recommended badge */}
                          {isRecommended && (
                            <span style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              background: '#ffe082',
                              color: '#795548',
                              fontWeight: 'bold',
                              fontSize: 10,
                              borderRadius: 4,
                              padding: '2px 6px',
                            }}>Recommended</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface ScheduleMatrixProps {
  matrix: RoomMatrix[];
  conflicts: { date: string; slot: string; therapistIds: string[]; }[];
  selectedDate: string;
  selectedTherapists: string[];
  onSlotSelect?: (roomNumber: string, slot: string, date: string) => void;
}

// ...rest of your component code...

export default ScheduleMatrix;
