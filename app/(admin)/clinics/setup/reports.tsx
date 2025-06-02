import DateRangePicker from '@/components/ui/DateRangePicker';
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchReports, clearFilters } from './reportsSlice';
import Card from '@/components/ui/Card';
import { Picker } from '@/components/ui/Picker';
import { ReportTable } from '@/components/ui/ReportTable';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/theme/constants/theme';
import { Download, FileText, RefreshCw } from 'lucide-react-native';
import Button from '@/components/ui/Button';
import { ReportType, TimeRangeOption } from '@/components/ui/types';

const REPORT_TYPES: ReportType[] = [
  { label: 'Appointments', value: 'appointments' },
  { label: 'Revenue', value: 'revenue' },
];

const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Current Quarter', value: 'current_quarter' },
  { label: 'Financial Year', value: 'financial_year' },
  { label: 'Custom Range', value: 'custom' },
];

const ReportsScreen = () => {
  // ...existing state and hooks...

  const handleStartChange = (date: Date | null) => {
    if (date) {
      setStartDate(date);
      setIsCalendarVisible(false);
    }
  };

  const handleEndChange = (date: Date | null) => {
    if (date) {
      setEndDate(date);
      setIsCalendarVisible(false);
    }
  };


  const dispatch = useAppDispatch();
  const { filters, appointments, revenue, loading, error } = useAppSelector((state) => state.reports);
  const [selectedReportType, setSelectedReportType] = useState(REPORT_TYPES[0].value);
  const [selectedTimeRange, setSelectedTimeRange] = useState(TIME_RANGE_OPTIONS[0].value);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchReports({
      type: selectedReportType,
      timeRange: selectedTimeRange,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }));
  }, [dispatch, selectedReportType, selectedTimeRange, startDate, endDate]);

  const handleRefresh = () => {
    dispatch(clearFilters());
    setSelectedTimeRange(TIME_RANGE_OPTIONS[0].value);
    setSelectedReportType(REPORT_TYPES[0].value);
    setStartDate(new Date());
    setEndDate(new Date());
  };

  const handleExportCSV = async () => {
    try {
      // Export CSV logic here
      setToastMessage('CSV export initiated');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to export CSV');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleExportPDF = async () => {
    try {
      // Export PDF logic here
      setToastMessage('PDF export initiated');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to export PDF');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
    if (value !== 'custom') {
      setStartDate(new Date());
      setEndDate(new Date());
    }
  };

  const handleReportTypeChange = (value: string) => {
    setSelectedReportType(value);
  };

  const selectedData = selectedReportType === 'appointments' ? appointments : revenue;
  const columns = selectedReportType === 'appointments'
    ? [
        { key: 'date', title: 'Date' },
        { key: 'clientName', title: 'Client Name' },
        { key: 'mobile', title: 'Mobile' },
        { key: 'reason', title: 'Reason' },
      ]
    : [
        { key: 'date', title: 'Date' },
        { key: 'clientName', title: 'Client Name' },
        { key: 'doctor', title: 'Doctor' },
        { key: 'amount', title: 'Amount' },
        { key: 'reason', title: 'Reason' },
      ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.filtersCard}>
        <View style={styles.filterContainer}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Report Type</Text>
            <Picker
              items={REPORT_TYPES}
              selectedValue={selectedReportType}
              onValueChange={handleReportTypeChange}
            />
          </View>

          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Time Range</Text>
            <Picker
              items={TIME_RANGE_OPTIONS}
              selectedValue={selectedTimeRange}
              onValueChange={handleTimeRangeChange}
            />
          </View>

          {selectedTimeRange === 'custom' && (
            <View style={styles.filterItem}>
              <Text style={styles.filterLabel}>Date Range</Text>
              <TouchableOpacity 
                style={styles.datePickerButton} 
                onPress={() => setIsCalendarVisible(true)}
              >
                <FileText size={20} color={COLORS.neutral[500]} />
                <Text style={styles.dateText}>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {isCalendarVisible && (
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartChange={handleStartChange}
                  onEndChange={handleEndChange}
                  isVisible={isCalendarVisible}
                  onClose={() => setIsCalendarVisible(false)}
                />
              )}
            </View>
          )}

          <Button
            title="Refresh"
            variant="primary"
            size="md"
            leftIcon={<RefreshCw size={16} />}
            onPress={handleRefresh}
            isLoading={loading}
          />
        </View>
      </Card>

      <Card style={styles.reportCard}>
        <View style={styles.exportIconsRow}>
          <TouchableOpacity onPress={handleExportCSV} disabled={loading} style={styles.iconButton}>
            <Download size={22} color={COLORS.vata[500]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExportPDF} disabled={loading} style={styles.iconButton}>
            <FileText size={22} color={COLORS.vata[500]} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.vata[500]} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : selectedData.length === 0 ? (
          <Text style={styles.emptyText}>No records found for the selected period</Text>
        ) : (
          <ReportTable columns={columns} data={selectedData} />
        )}
      </Card>

      <Toast
        visible={showToast}
        type={toastType}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  filtersCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  filterContainer: {
    padding: 16,
  },
  filterItem: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: COLORS.neutral[500],
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  dateText: {
    marginLeft: 8,
    color: COLORS.neutral[700],
    fontSize: 14,
  },
  reportCard: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingTop: 8,
  },
  exportIconsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  iconButton: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    color: COLORS.pitta[500],
    textAlign: 'center',
    padding: 16,
  },
  emptyText: {
    color: COLORS.neutral[500],
    textAlign: 'center',
    padding: 16,
  },
});

export default ReportsScreen;