import React from 'react';
import UIDatePicker, { DateType } from 'react-native-ui-datepicker';
import { View, StyleSheet, Modal, Platform } from 'react-native';
import { COLORS } from '@/theme/constants/theme';
import dayjs from 'dayjs';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartChange: (date: Date | null) => void;
  onEndChange: (date: Date | null) => void;
  isVisible: boolean;
  onClose: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  isVisible,
  onClose,
}) => {

const handleValueChange = ({ startDate, endDate }: { startDate?: DateType; endDate?: DateType }) => {
  // Convert Dayjs objects to Date, otherwise pass null
  const convert = (d: DateType) => {
    if (!d) return null;
    if (typeof d === 'string' || typeof d === 'number' || d instanceof Date) return new Date(d);
    if (typeof d === 'object' && 'toDate' in d && typeof d.toDate === 'function') return d.toDate(); // Dayjs
    return null;
  };
  onStartChange(convert(startDate));
  onEndChange(convert(endDate));
};


  const content = (
    <View style={styles.container}>
      <UIDatePicker
  mode="range"
  startDate={startDate}
  endDate={endDate}
  onChange={handleValueChange}
  // selectedItemColor={COLORS.vata[500]} // Uncomment if supported by UIDatePicker
  // calendarTextStyle={{ color: COLORS.neutral[900] }} // Uncomment if supported
  // headerTextStyle={{ color: COLORS.neutral[900] }} // Uncomment if supported
/>
 
    </View>
  );

  if (Platform.OS === 'web') {
    return isVisible ? content : null;
  }

  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {content}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
  },
});

export default DateRangePicker;