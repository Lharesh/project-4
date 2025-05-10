import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTimings, saveTimings } from '@/redux/slices/setupSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Picker } from '@/components/ui/Picker';
import { COLORS } from '@/constants/theme';
import { Toast } from '@/components/ui/Toast';

const STATUS_OPTIONS = [
  { label: 'Working', value: 'working' },
  { label: 'Half Day', value: 'half_day' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Weekly Off', value: 'weekly_off' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
  return { label: time, value: time };
});

export default function ClinicTimingsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { timings, isLoading } = useAppSelector((state) => state.setup);
  
  const [editedTimings, setEditedTimings] = useState(timings);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchTimings(user.clinicId));
    }
  }, [user?.clinicId]);

  useEffect(() => {
    setEditedTimings(timings);
  }, [timings]);

  type TimingStatus = 'working' | 'half_day' | 'holiday' | 'weekly_off';

const handleStatusChange = (day: string, status: TimingStatus) => {
  setEditedTimings(prev => ({
    weekdays: {
      ...prev.weekdays,
      [day]: {
        ...prev.weekdays[day],
        isOpen: status === 'working' || status === 'half_day',
        status,
      },
    },
  }));
};

const handleTimeChange = (day: string, field: string, value: string) => {
  setEditedTimings(prev => ({
    weekdays: {
      ...prev.weekdays,
      [day]: {
        ...prev.weekdays[day],
        [field]: value,
      },
    },
  }));
};
  const validateTimings = () => {
    for (const [day, timing] of Object.entries(editedTimings.weekdays)) {
      if (timing.isOpen) {
        if (!timing.start || !timing.end) {
          setToastMessage(`Please set both start and end time for ${day}`);
          setToastType('error');
          setShowToast(true);
          return false;
        }
        
        const start = timing.start.split(':').map(Number);
        const end = timing.end.split(':').map(Number);
        const startMinutes = start[0] * 60 + start[1];
        const endMinutes = end[0] * 60 + end[1];
        
        if (endMinutes <= startMinutes) {
          setToastMessage(`End time must be after start time for ${day}`);
          setToastType('error');
          setShowToast(true);
          return false;
        }

        if (timing.breakStart && timing.breakEnd) {
          const breakStart = timing.breakStart.split(':').map(Number);
          const breakEnd = timing.breakEnd.split(':').map(Number);
          const breakStartMinutes = breakStart[0] * 60 + breakStart[1];
          const breakEndMinutes = breakEnd[0] * 60 + breakEnd[1];

          if (breakStartMinutes >= breakEndMinutes) {
            setToastMessage(`Break end time must be after break start time for ${day}`);
            setToastType('error');
            setShowToast(true);
            return false;
          }

          if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
            setToastMessage(`Break time must be within working hours for ${day}`);
            setToastType('error');
            setShowToast(true);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!user?.clinicId) return;

    if (!validateTimings()) return;

    try {
      await dispatch(saveTimings({ clinicId: user.clinicId, timings: editedTimings })).unwrap();
      setToastMessage('Clinic timings updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to update clinic timings');
      setToastType('error');
      setShowToast(true);
    }
  };

  const weekdays = Object.entries(editedTimings.weekdays);

  return (
    <ScrollView style={styles.container}>
      {weekdays.map(([day, timing]) => (
        <Card key={day} style={styles.card}>
          <Text style={styles.dayName}>
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </Text>

          <Picker
            label="Status"
            items={STATUS_OPTIONS}
            selectedValue={timing.status}
            onValueChange={(value) => handleStatusChange(day, value as TimingStatus)}
            containerStyle={styles.picker}
          />

          {(timing.status === 'working' || timing.status === 'half_day') && (
            <>
              <View style={styles.timeRow}>
                <Picker
                  label="Opening Time"
                  items={TIME_OPTIONS}
                  selectedValue={timing.start}
                  onValueChange={(value) => handleTimeChange(day, 'start', value)}
                  containerStyle={styles.timePicker}
                />
                <Picker
                  label="Closing Time"
                  items={TIME_OPTIONS}
                  selectedValue={timing.end}
                  onValueChange={(value) => handleTimeChange(day, 'end', value)}
                  containerStyle={styles.timePicker}
                />
              </View>

              <View style={styles.timeRow}>
                <Picker
                  label="Break Start"
                  items={TIME_OPTIONS}
                  selectedValue={timing.breakStart}
                  onValueChange={(value) => handleTimeChange(day, 'breakStart', value)}
                  containerStyle={styles.timePicker}
                />
                <Picker
                  label="Break End"
                  items={TIME_OPTIONS}
                  selectedValue={timing.breakEnd}
                  onValueChange={(value) => handleTimeChange(day, 'breakEnd', value)}
                  containerStyle={styles.timePicker}
                />
              </View>
            </>
          )}
        </Card>
      ))}

      <Button
        title="Save Changes"
        style={styles.button}
        isLoading={isLoading}
        onPress={handleSave}
      />

      <Toast
        visible={showToast}
        type={toastType}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.neutral[50],
  },
  card: {
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: 12,
  },
  picker: {
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  timePicker: {
    flex: 1,
  },
  button: {
    marginTop: 24,
    marginBottom: 40,
  },
});