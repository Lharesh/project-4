import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Switch } from 'react-native-paper';
import { colors, spacing, typography } from '@/theme';

interface AppSwitchProps<T extends string> {
  value: T;
  options: [T, T];
  label?: string;
  onValueChange: (value: T) => void;
}

export default function AppSwitch<T extends string>({ value, options, label, onValueChange }: AppSwitchProps<T>) {
  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={[styles.optionText, value === options[0] && styles.selected]}>{options[0]}</Text>
      <Switch
        value={value === options[1]}
        onValueChange={v => onValueChange(v ? options[1] : options[0])}
        color={colors.vata.primary}
      />
      <Text style={[styles.optionText, value === options[1] && styles.selected]}>{options[1]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: 'bold',
    marginRight: spacing.sm,
    fontSize: typography.fontSizeMd,
    color: colors.vata.text,
  },
  optionText: {
    fontSize: typography.fontSizeMd,
    marginHorizontal: spacing.xs,
    color: colors.vata.text,
  },
  selected: {
    color: colors.vata.primary,
    fontWeight: 'bold',
  },
});
