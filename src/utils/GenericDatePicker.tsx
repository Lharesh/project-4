import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper to format date as YYYY-MM-DD
export function formatDate(date?: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export interface GenericDatePickerProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  minDate?: Date;
  maxDate?: Date;
  style?: any;
  inputStyle?: any;
  testID?: string;
}

export const GenericDatePicker: React.FC<GenericDatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  style,
  inputStyle,
  testID,
}) => {
  const [show, setShow] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<string | undefined>(value);
  const formattedValue = formatDate(value);

  React.useEffect(() => {
    if (show) setTempDate(value);
  }, [show, value]);

  return (
    <View style={style}>
      <Text style={{ fontWeight: '600' }}>{label}</Text>
      {Platform.OS === 'web' ? (
        <input
          type="date"
          value={formattedValue}
          onChange={e => onChange(e.target.value)}
          min={minDate ? formatDate(minDate) : undefined}
          max={maxDate ? formatDate(maxDate) : undefined}
          style={{
            padding: 8,
            borderRadius: 8,
            border: '1px solid #ccc',
            fontSize: 15,
            background: '#fafbfc',
            ...inputStyle,
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            testID={testID}
            onPress={() => setShow(true)}
            style={[
              { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
              inputStyle,
            ]}
          >
            <View style={[
              { height: 44, borderRadius: 8, borderColor: '#d6dbe6', borderWidth: 1, backgroundColor: '#fff', flex: 1, justifyContent: 'center', paddingHorizontal: 10 },
              inputStyle,
            ]}>
              <Text style={{ fontSize: 16, color: '#1a2233' }}>
                {formattedValue || 'Select date'}
              </Text>
            </View>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              value={tempDate ? new Date(tempDate) : value ? new Date(value) : new Date()}
              mode="date"
              display="default"
              minimumDate={minDate}
              maximumDate={maxDate}
              onChange={(event, selectedDate?: Date) => {
                if (Platform.OS === 'android' || Platform.OS === 'ios') {
                  if (event.type === 'set' && selectedDate) {
                    setShow(false);
                    onChange(formatDate(selectedDate));
                  } else if (event.type === 'dismissed') {
                    setShow(false);
                  }
                } else {
                  // Fallback for web or other platforms
                  if (selectedDate) {
                    setShow(false);
                    onChange(formatDate(selectedDate));
                  } else {
                    setShow(false);
                  }
                }
              }}
            />
          )}
        </>
      )}
    </View>
  );
};
export default GenericDatePicker;