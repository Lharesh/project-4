import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { spacing, colors } from '@/theme';

const FormContainer: React.FC<ViewProps> = ({ children, style, ...props }) => (
  <View style={[styles.container, style]} {...props}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: colors.white,
    maxWidth: 480,
    alignSelf: 'center',
    elevation: 2,
    width: '100%',
  },
});

export default FormContainer;
