import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  color?: keyof typeof COLORS;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  onPress,
  style,
  color = 'vata',
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[
        styles.container,
        {
          backgroundColor: COLORS[color][50],
          borderColor: COLORS[color][200],
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color: COLORS[color][700] }]}>{value}</Text>
      </View>
      {icon && (
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: COLORS[color][100],
            },
          ]}
        >
          {icon}
        </View>
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
});