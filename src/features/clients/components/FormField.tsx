import React from 'react';
import { View, Text, TextInput, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { clientStyles } from '../../../../app/(app)/clients/client.styles';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  error?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
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
  containerStyle,
  multiline = false,
  keyboardType = 'default',
  required = false,
  editable = true,
}) => (
  <View style={[clientStyles.formField, containerStyle]}>
    <Text style={clientStyles.label}>
      {label}
      {required && <Text style={{ color: 'red' }}> *</Text>}
    </Text>
    <TextInput
      style={[clientStyles.input, inputStyle]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      multiline={multiline}
      keyboardType={keyboardType}
      editable={editable}
    />
    {error ? <Text style={clientStyles.errorText}>{error}</Text> : null}
  </View>
);
