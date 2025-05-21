import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { COLORS } from '@/theme/constants/theme';

export interface BreadcrumbItem {
  label: string;
  onPress?: () => void;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items }) => {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight size={16} color={COLORS.neutral[400]} style={styles.separator} />
          )}
          {item.onPress ? (
            <TouchableOpacity onPress={item.onPress}>
              <Text style={[styles.text, styles.link]}>{item.label}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.text, styles.current]}>{item.label}</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 14,
  },
  link: {
    color: COLORS.vata[600],
  },
  current: {
    color: COLORS.neutral[900],
    fontWeight: '600',
  },
  separator: {
    marginHorizontal: 8,
  },
});