import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { spacing } from '@/theme';

const FormFieldRow: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.row, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // consistent vertical spacing between rows
    width: '100%',
  },
});

export default FormFieldRow;
