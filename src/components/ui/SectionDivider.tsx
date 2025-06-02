import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '@/theme/constants/theme';

interface SectionDividerProps {
  title?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  lineStyle?: StyleProp<ViewStyle>;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
  title,
  style,
  titleStyle,
  lineStyle,
}) => {
  if (!title) {
    return <View style={[styles.simpleDivider, lineStyle, style]} />;
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>
      <View style={[styles.line, lineStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginBottom: 8,
  },
  line: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
  },
  simpleDivider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginVertical: 16,
  },
});