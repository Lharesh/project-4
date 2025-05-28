import React, { useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { TextInput, useTheme, HelperText, IconButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';

interface GenericDatePickerProps {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  minDate?: Date;
  maxDate?: Date;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  style?: any;
  testID?: string;
  placeholder?: string;
}

export const GenericDatePicker: React.FC<GenericDatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error = false,
  helperText,
  disabled = false,
  style,
  testID,
  placeholder = '',
}) => {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  // Format date as dd/mm/yyyy
  const formatDate = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const handleChange = (_: any, selectedDate?: Date) => {
    setShow(false);
    if (selectedDate) {
      onChange(selectedDate.toISOString());
    }
  };

  return (
    <View style={style} testID={testID}>
      <TextInput
        label={label}
        value={formatDate(value) || ''}
        onFocus={() => setShow(true)}
        right={<TextInput.Icon icon="calendar" onPress={() => setShow(true)} />}
        editable={false}
        error={error}
        disabled={disabled}
        mode="outlined"
        placeholder={placeholder}
        theme={theme}
        style={[{ backgroundColor: theme.colors.background }, style]}
      />
      {helperText ? (
        <HelperText type={error ? 'error' : 'info'} visible={!!helperText}>
          {helperText}
        </HelperText>
      ) : null}
      {show && Platform.OS !== 'web' && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display="default"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default GenericDatePicker;
