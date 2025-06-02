import React, { useEffect, useState } from 'react';
import type { User } from '../../../auth/authSlice';
import type { ClinicTimings } from './setupSlice';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { fetchTimings, saveTimings, setDraftTimings } from './setupSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Picker } from '@/components/ui/Picker';
import { COLORS } from '@/theme/constants/theme';
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
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth as { user: User | null });
  const { timings, draftTimings, isLoading } = useAppSelector((state) => state.setup as { timings: ClinicTimings; draftTimings?: ClinicTimings; isLoading: boolean });

  const [editedTimings, setEditedTimings] = useState<ClinicTimings>(
    draftTimings || timings || { weekdays: {} }
  );
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchTimings(user.clinicId));
    }
  }, [user?.clinicId]);

  useEffect(() => {
    const newTimings = draftTimings || timings || { weekdays: {} };
    setEditedTimings(newTimings);
    console.log('[Timings useEffect] Setting editedTimings to:', newTimings);
  }, [timings, draftTimings]);

  type TimingStatus = 'working' | 'half_day' | 'holiday' | 'weekly_off';

const handleStatusChange = (day: string, status: TimingStatus) => {
  setEditedTimings((prev: ClinicTimings) => {
    const updated = {
      weekdays: {
        ...prev.weekdays,
        [day]: {
          ...prev.weekdays[day],
          isOpen: status === 'working' || status === 'half_day',
          status,
        },
      },
    };
    dispatch(setDraftTimings(updated));
    return updated;
  });
};

const handleTimeChange = (day: string, field: string, value: string) => {
  setEditedTimings((prev: ClinicTimings) => {
    const updated = {
      weekdays: {
        ...prev.weekdays,
        [day]: {
          ...prev.weekdays[day],
          [field]: value,
        },
      },
    };
    dispatch(setDraftTimings(updated));
    return updated;
  });
};
  const validateTimings = () => {
    for (const [day, timing] of Object.entries(editedTimings.weekdays) as [string, ClinicTimings["weekdays"][string]][]) {
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
  console.log('[handleSave] Save button pressed. Current editedTimings:', editedTimings);
    if (!user?.clinicId) return;

    if (!validateTimings()) return;

    try {
      await dispatch(saveTimings({ clinicId: user.clinicId, timings: editedTimings })).unwrap();
      dispatch(setDraftTimings(undefined as any)); // Clear draft on successful save
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
  const [expandedDay, setExpandedDay] = useState(weekdays.length ? weekdays[0][0] : null);

  // Handler to apply timings from the first card to all others
  const handleApplyToAll = () => {
    if (weekdays.length === 0) return;
    const [firstDay, firstTiming] = weekdays[0];
    setEditedTimings((prev: ClinicTimings) => {
      const updated = {
        weekdays: Object.fromEntries(
          Object.entries(prev.weekdays).map(([day, timing]: [string, ClinicTimings["weekdays"][string]], idx: number) => {
            if (idx === 0) return [day, timing];
            return [day, { ...timing, ...firstTiming }];
          })
        )
      };
      dispatch(setDraftTimings(updated));
      return updated;
    });
  };

  // Safe back navigation handler
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      router.push('/appointments');
    }
  };

  // To use this handler, wire it to your custom back button:
  // <TouchableOpacity onPress={handleBack}><Icon name="arrow-left" /></TouchableOpacity>

  // Helper for summary
  const getSummary = (timing: ClinicTimings["weekdays"][string]) => {
    if (timing.status === 'working' || timing.status === 'half_day') {
      return `${timing.start || '--:--'} - ${timing.end || '--:--'}${timing.breakStart && timing.breakEnd ? ` (Break: ${timing.breakStart}-${timing.breakEnd})` : ''}`;
    }
    return timing.status.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        {weekdays.map(([day, timing], idx) => {
          const isExpanded = expandedDay === day;
          return (
            <Card key={day} style={styles.card}>
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.accordionHeader}
                onPress={() => setExpandedDay(isExpanded ? null : day)}
              >
                <Text style={styles.dayName}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.summary}>{getSummary(timing)}</Text>
              </TouchableOpacity>
              {isExpanded && (
                <View>
                  {/* Show 'Apply to All' button only on the first expanded card */}
                  {idx === 0 && (
                    <Button
                      title="Apply to All"
                      style={{ marginBottom: 12 }}
                      onPress={handleApplyToAll}
                    />
                  )}

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
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>
      {/* Sticky Footer for mobile actions */}
      <View style={styles.stickyFooter}>
        <Button
          title="Save Changes"
          style={{ marginBottom: 8 }}
          isLoading={isLoading}
          onPress={handleSave}
        />
      </View>
      <Toast
        visible={showToast}
        type={toastType}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </View>
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  summary: {
    fontSize: 14,
    color: COLORS.neutral[700],
    marginLeft: 8,
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
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.neutral[50],
    padding: 16,
    borderTopWidth: 1,
    borderColor: COLORS.neutral[200],
    zIndex: 100,
  },
});

// Don't forget to import TouchableOpacity at the top:
// import { TouchableOpacity } from 'react-native';

// --- Safe back navigation example ---
// Replace any navigation.goBack() usage with:
// if (navigation.canGoBack()) {
//   navigation.goBack();
// } else {
//   navigation.navigate('Home'); // or your root/main screen
// }
// --- End safe back navigation ---