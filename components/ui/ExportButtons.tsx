import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from './Button';
import { FileText, FileSpreadsheet } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface ExportButtonsProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportCSV,
  onExportPDF,
  isLoading,
}) => {
  return (
    <View style={styles.container}>
      <Button
        title="Export CSV"
        variant="outline"
        leftIcon={<FileSpreadsheet size={18} color={COLORS.vata[500]} />}
        onPress={onExportCSV}
        isLoading={isLoading}
        style={styles.button}
      />
      <Button
        title="Export PDF"
        variant="outline"
        leftIcon={<FileText size={18} color={COLORS.vata[500]} />}
        onPress={onExportPDF}
        isLoading={isLoading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
  },
});