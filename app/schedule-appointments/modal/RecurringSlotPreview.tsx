import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { checkRecurringSlotAvailability } from '../../../utils/checkRecurringSlotAvailability';

interface RecurringSlotPreviewProps {
  startDate: string;
  days: number;
  roomNumber: string;
  slotTime: string;
  appointments: any[];
  skipNonWorkingDays?: boolean;
}

const RecurringSlotPreview: React.FC<RecurringSlotPreviewProps> = ({ startDate, days, roomNumber, slotTime, appointments, skipNonWorkingDays }) => {
  const results = useMemo(() => checkRecurringSlotAvailability({ startDate, days, roomNumber, slotTime, appointments, skipNonWorkingDays }), [startDate, days, roomNumber, slotTime, appointments, skipNonWorkingDays]);

  const allAvailable = results.every(r => r.available);

  return (
    <View style={{ marginVertical: 10, backgroundColor: '#f7f7fa', borderRadius: 8, padding: 12 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 6 }}>
        Recurring Slot Availability ({days} days @ {slotTime})
      </Text>
      <ScrollView style={{ maxHeight: 160 }}>
        {results.map(r => (
          <View key={r.date} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ width: 110 }}>{r.date}</Text>
            <Text style={{ color: r.available ? 'green' : 'red', fontWeight: 'bold', marginLeft: 10 }}>
              {r.available ? 'Available' : r.reason || 'Unavailable'}
            </Text>
          </View>
        ))}
      </ScrollView>
      <Text style={{ marginTop: 8, color: allAvailable ? 'green' : 'red', fontWeight: '600' }}>
        {allAvailable ? 'All slots available for recurring booking.' : 'Some slots are not available for recurring booking.'}
      </Text>
    </View>
  );
};

export default RecurringSlotPreview;
