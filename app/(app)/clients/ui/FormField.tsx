import React from 'react';
import { View, Text, TextInput, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { clientStyles } from '../client.styles';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  required?: boolean;
  editable?: boolean; // <-- Added
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  style,
  inputStyle,
  multiline,
  keyboardType = 'default',
  required,
  editable,
}) => (
  <View style={[clientStyles.formField, style]}>
    <Text style={clientStyles.label}>
      {label} {required && <Text style={{ color: 'red' }}>*</Text>}
    </Text>
    <TextInput
      style={[
        clientStyles.input,
        inputStyle,
        error && clientStyles.inputError,
        multiline && { minHeight: 70, textAlignVertical: 'top' },
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize="none"
      editable={editable !== false}
    />
    {!!error && <Text style={clientStyles.errorText}>{error}</Text>}
  </View>
);
