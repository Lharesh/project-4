import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/theme/constants/theme';

interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[700],
    marginBottom: 12,
  },
  content: {
    gap: 12,
  },
});