import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '@/theme/constants/theme';

interface Column {
  key: string;
  title: string;
  width?: number;
}

interface ReportTableProps {
  columns: Column[];
  data: any[];
  footer?: {
    label: string;
    value: string | number;
  };
}

export const ReportTable: React.FC<ReportTableProps> = ({
  columns,
  data,
  footer,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <View>
          <View style={styles.header}>
            {columns.map((column) => (
              <View
                key={column.key}
                style={[styles.headerCell, column.width ? { width: column.width } : null]}
              >
                <Text style={styles.headerText}>{column.title}</Text>
              </View>
            ))}
          </View>

          <View style={styles.body}>
            {data.map((row, index) => (
              <View key={index} style={styles.row}>
                {columns.map((column) => (
                  <View
                    key={column.key}
                    style={[styles.cell, column.width ? { width: column.width } : null]}
                  >
                    <Text style={styles.cellText}>{row[column.key]}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          {footer && (
            <View style={styles.footer}>
              <Text style={styles.footerLabel}>{footer.label}</Text>
              <Text style={styles.footerValue}>{footer.value}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: COLORS.neutral[100],
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    padding: 12,
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral[200],
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  cell: {
    padding: 12,
    minWidth: 120,
    borderRightWidth: 1,
    borderRightColor: COLORS.neutral[200],
  },
  cellText: {
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: COLORS.neutral[50],
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.neutral[700],
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.vata[600],
  },
});