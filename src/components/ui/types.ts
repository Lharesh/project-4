import { ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';

// Button Types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// Card Types
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  headerStyle?: ViewStyle;
  bodyStyle?: ViewStyle;
  titleStyle?: ViewStyle;
  subtitleStyle?: ViewStyle;
  rightHeader?: React.ReactNode;
}

// DateRangePicker Types
export interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartChange: (date: Date) => void;
  onEndChange: (date: Date) => void;
}

// Report Types
export interface ReportType {
  label: string;
  value: string;
}

export interface TimeRangeOption {
  label: string;
  value: string;
}

export interface ExportButtonsProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  isLoading?: boolean;
}

// Redux State Types
export interface ReportFilters {
  type: string;
  timeRange: string;
  startDate?: string;
  endDate?: string;
}

export interface Report {
  id: string;
  date: string;
  clientName: string;
  mobile: string;
  reason: string;
  amount?: number;
  doctor?: string;
}

export interface ReportsState {
  filters: ReportFilters;
  appointments: Report[];
  revenue: Report[];
  loading: boolean;
  error: string | null;
}