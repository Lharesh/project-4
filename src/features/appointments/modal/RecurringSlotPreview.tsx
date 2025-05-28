import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface RecurringSlotPreviewProps {
  startDate: string;
  days: number;
  roomNumber: string;
  slotTime: string;
  appointments: any[];
  skipNonWorkingDays?: boolean;
  recurringSlotInfo: Record<string, { available: boolean; reason: string | null; alternatives: Array<{slot: string; roomNumber: string}> }>;
  replacementSlots: Record<string, string>;
  onSlotChange: (date: string, slot: string) => void;
}

const RecurringSlotPreview: React.FC<RecurringSlotPreviewProps> = ({
  startDate,
  days,
  roomNumber,
  slotTime,
  appointments,
  skipNonWorkingDays,
  recurringSlotInfo,
  replacementSlots,
  onSlotChange
}) => {
  // Assume dates are derived from recurringSlotInfo keys
  const dates = Object.keys(recurringSlotInfo);
  console.log('recurringSlotInfo:', recurringSlotInfo);
dates.forEach(date => console.log('Alternatives in preview for', date, ':', recurringSlotInfo[date]?.alternatives));
const allAvailable = dates.every(date => recurringSlotInfo[date]?.available);

  return (
    <View style={{ marginVertical: 10, backgroundColor: '#f7f7fa', borderRadius: 8, padding: 12 }}>
      <Text
        style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}
        accessibilityLabel="Recurring Slot Availability"
      >
        Recurring Slot Availability ({days} days @ {slotTime})
      </Text>
      <ScrollView style={{ maxHeight: 160 }} testID="recurring-slot-preview-scroll">
        {dates.map(date => {
          const info = recurringSlotInfo[date] || { available: false, reason: '', alternatives: [] };
          const alternatives = Array.isArray(info.alternatives) ? info.alternatives : [];
          const reason = typeof info.reason === 'string' ? info.reason : '';
          return (
            <View key={date} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Text style={{ width: 110 }}>{date}</Text>
              {info.available ? (
                <Text style={{ color: 'green', fontWeight: 'bold', marginLeft: 10 }}>Available</Text>
              ) : (
                <>
                  {/* Always show reason for unavailability */}
                  <Text style={{ color: 'red', fontWeight: 'bold', marginLeft: 10, marginRight: 10, maxWidth: 180 }} numberOfLines={2}>
  {reason
    ? reason
    : (alternatives.length === 0
        ? 'No alternatives available for this slot'
        : 'Not available')}
</Text>
                  {/* Show alternatives dropdown if available */}
                  {alternatives.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator style={{ flexGrow: 0, marginLeft: 0, minWidth: 180, maxWidth: 320 }}>
                      {/*
  Dropdown values use the format 'slot-room', matching backend output. The display splits on the first dash only.
*/}
<Picker
  selectedValue={replacementSlots[date] || ''}
  style={{ height: 30, width: 180 }}
  onValueChange={(itemValue: string) => {
    onSlotChange(date, itemValue);
  }}
  accessibilityLabel={`Recurring Slot Alternative Picker for ${date}`}
>
  <Picker.Item label="Select slot/room" value="" />
  {info.alternatives.map(({ slot, roomNumber }: { slot: string; roomNumber: string }) => (
    <Picker.Item key={slot + '-' + roomNumber} label={`${slot} - ${roomNumber}`} value={`${slot}-${roomNumber}`} />
  ))}
</Picker>
{/* Show selected value if any */}
{replacementSlots[date] && (
  <Text style={{ marginLeft: 8, color: '#333', fontSize: 13 }}>
    Selected: {(() => {
      const val = replacementSlots[date];
      const dashIdx = val.indexOf('-');
      if (dashIdx === -1) return val;
      return val.slice(0, dashIdx) + ' - ' + val.slice(dashIdx + 1);
    })()}
  </Text>
)}
                    </ScrollView>
                  )}
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
      <Text style={{ marginTop: 8, color: allAvailable ? 'green' : 'red', fontWeight: '600' }}>
        {allAvailable ? 'All slots available for recurring booking.' : 'Some slots are not available for recurring booking.'}
      </Text>
    </View>
  );
};

export default RecurringSlotPreview;
