import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, Alert, Pressable } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { router } from 'expo-router';
import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';
import { SlotStatus, SLOT_STATUS } from '../constants/status';
import { ROUTE_CLIENTS } from '../../../constants/routes';
import { X, RefreshCw, CheckCircle, BookOpen } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import styles from './IntelligentSlot.styles';
import { useDispatch } from 'react-redux';

const getStatusBackgroundColor = (status: string) => {
  if (status === 'completed') return ['#E8F5ED', '#E8F5ED', '#E8F5ED']; // Green pastel
  if (status === 'cancelled') return ['#FFF8E1', '#FFF8E1', '#FFF8E1']; // Yellow/orange pastel
  if (status === 'scheduled') return ['#E6EDFF', '#E6EDFF', '#E6EDFF']; // Blue pastel
  return ['#fff', '#fff', '#fff'];
};

export type IntelligentSlotStatus = SlotStatus;

interface IntelligentSlotProps {
  clientId?: string & { length: number }; // Patient ID for avatar
  startTime: string;
  endTime: string;
  duration: number;
  patientName?: string;
  patientPhone?: string;
  therapyName?: string;
  treatmentDay?: number;
  totalTreatmentDays?: number;
  availableTherapists?: { name: string; avatarUrl?: string }[];
  status: IntelligentSlotStatus;
  onBook?: () => void;
  onReschedule?: () => void;
  onCancel?: () => void;
  onConfirmVisit?: () => void;
  onOverlayPress?: () => void;
  onCreate?: ((slotInfo: {
    startTime: string;
    endTime: string;
    duration: number;
    roomId?: string;
    date?: string;
  }) => void) | (() => void);
  roomId?: string;
  date?: string;
  onCloseModal?: () => void; // Optional: close parent modal before navigation
  onMarkComplete?: () => void;
}

const SLOT_SIZE = {
  minWidth: 140,
  maxWidth: 180,
  minHeight: 140,
  maxHeight: 180,
  borderRadius: 18,
  padding: 18,
};

const IntelligentSlot: React.FC<IntelligentSlotProps> = ({
  startTime,
  endTime,
  duration,
  clientId,
  patientName,
  patientPhone,
  therapyName,
  treatmentDay,
  totalTreatmentDays,
  availableTherapists,
  status,
  onBook,
  onReschedule,
  onCancel,
  onConfirmVisit,
  onOverlayPress,
  onCreate,
  roomId,
  date,
  onCloseModal,
  onMarkComplete,
}) => {
  let mainContent = null;
  let actions = null;
  let statusLabel = '';

  const dispatch = useDispatch();

  const [menuVisible, setMenuVisible] = React.useState(false);

  // Dosha color cycle for avatars
  const doshaColors = [
    '#5AC8FA', // Vata blue
    '#FFB300', // Pitta yellow
    '#43A047', // Kapha green
    '#1976D2', // Info blue (fallback)
  ];

  if (status === SLOT_STATUS.BREAK) {
    mainContent = <Text style={styles.breakText}>Break</Text>;
    statusLabel = 'Break';
  } else if (status === SLOT_STATUS.SCHEDULED) {
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <View style={styles.avatarsRow}>
          {availableTherapists && availableTherapists.length > 0 && availableTherapists.map((t, idx) => (
            Platform.OS === 'web' ? (
              <div key={t.name + idx} title={t.name} style={{ display: 'inline-block' }}>
                <View style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}>
                  <Text style={styles.avatarText}>{t.name[0]}</Text>
                </View>
              </div>
            ) : (
              <TouchableOpacity
                key={t.name + idx}
                onPress={() => Alert.alert('Therapist', t.name)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}>
                  <Text style={styles.avatarText}>{t.name[0]}</Text>
                </View>
              </TouchableOpacity>
            )
          ))}
        </View>
        <View style={{ alignItems: 'center', marginBottom: 2 }}>
          <Text style={styles.patientNameSingle} numberOfLines={1} ellipsizeMode="tail">{patientName || 'Unknown Patient'}</Text>
        </View>
        <Text style={styles.therapyText} numberOfLines={1} ellipsizeMode="tail">{therapyName}</Text>
        {typeof treatmentDay === 'number' && totalTreatmentDays && totalTreatmentDays > 1 && (
          <Text style={styles.dayText}>Day {treatmentDay} of {totalTreatmentDays}</Text>
        )}
      </>
    );
    statusLabel = 'Scheduled';
    actions = (
      <View style={[styles.actionRow, { justifyContent: 'space-between', width: '100%', marginTop: 8 }]}>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => {
            console.log('Cancel pressed', patientName, startTime, onCancel);
            if (onCancel) {
              onCancel();
            }
          }} accessibilityLabel="Cancel Appointment">
            <X size={22} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={onReschedule} accessibilityLabel="Reschedule Appointment">
            <RefreshCw size={22} color="#222" />
          </TouchableOpacity>
        </View>
        <View style={{ alignItems: 'center', flex: 1 }}>
          <TouchableOpacity style={styles.iconBtn} onPress={onConfirmVisit} accessibilityLabel="Mark as Completed">
            <CheckCircle size={22} color="#222" />
          </TouchableOpacity>
        </View>
      </View>
    );
  } else if (status === SLOT_STATUS.CANCELLED_AVAILABLE) {
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <Text style={styles.unavailableText}>Cancelled & Available</Text>
      </>
    );
    statusLabel = 'Cancelled & Available';
    actions = onCreate ? (
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => {
          router.replace({
            pathname: ROUTE_CLIENTS,
            params: {
              [APPOINTMENT_PARAM_KEYS.SLOT_START]: startTime,
              [APPOINTMENT_PARAM_KEYS.SLOT_END]: endTime,
              [APPOINTMENT_PARAM_KEYS.DURATION]: duration,
              [APPOINTMENT_PARAM_KEYS.ROOM_ID]: roomId,
              [APPOINTMENT_PARAM_KEYS.DATE]: date,
              select: 1,
            },
          });
        }}
        accessibilityLabel="Book"
      >
        <BookOpen size={22} color="#fff" />
        <Text style={styles.bookBtnText}>Book</Text>
      </TouchableOpacity>
    ) : null;
  } else if (status === SLOT_STATUS.AVAILABLE) {
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <View style={styles.avatarsRow}>
          {availableTherapists && availableTherapists.length > 0 ? (
            availableTherapists.map((t, idx) => (
              Platform.OS === 'web' ? (
                <div key={t.name + idx} title={t.name} style={{ display: 'inline-block' }}>
                  <View style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}>
                    <Text style={styles.avatarText}>{t.name[0]}</Text>
                  </View>
                </div>
              ) : (
                <TouchableOpacity
                  key={t.name + idx}
                  onPress={() => Alert.alert('Therapist', t.name)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}>
                    <Text style={styles.avatarText}>{t.name[0]}</Text>
                  </View>
                </TouchableOpacity>
              )
            ))
          ) : (
            <Text style={styles.noTherapistText}>Therapists Unavailable</Text>
          )}
        </View>
      </>
    );
    statusLabel = availableTherapists && availableTherapists.length > 0 ? 'Available' : '';
    actions = (availableTherapists && availableTherapists.length > 0 && onCreate) ? (
      <TouchableOpacity
        style={styles.bookBtn}
        onPress={() => {
          router.replace({
            pathname: ROUTE_CLIENTS,
            params: {
              [APPOINTMENT_PARAM_KEYS.SLOT_START]: startTime,
              [APPOINTMENT_PARAM_KEYS.SLOT_END]: endTime,
              [APPOINTMENT_PARAM_KEYS.DURATION]: duration,
              [APPOINTMENT_PARAM_KEYS.ROOM_ID]: roomId,
              [APPOINTMENT_PARAM_KEYS.DATE]: date,
              select: 1,
            },
          });
        }}
        accessibilityLabel="Book"
      >
        <BookOpen size={22} color="#fff" />
        <Text style={styles.bookBtnText}>Book</Text>
      </TouchableOpacity>
    ) : null;
  } else if (status === SLOT_STATUS.THERAPIST_UNAVAILABLE) {
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <Text style={styles.unavailableText}>Therapists are busy</Text>
      </>
    );
    statusLabel = 'Unavailable';
  } else if (status === SLOT_STATUS.NOT_AVAILABLE) {
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <Text style={styles.unavailableText}>Not Available</Text>
      </>
    );
    statusLabel = 'Not Available';
  }

  const getSlotBackground = (status: IntelligentSlotStatus): [string, string, string] => {
    if (status === SLOT_STATUS.SCHEDULED) {
      return [
        '#E6EDFF', // Vata pastel blue
        '#D1E8FF',
        '#F4F9FB',
      ];
    } else if (status === SLOT_STATUS.AVAILABLE) {
      return [
        '#E8F5ED', // Kapha pastel green
        '#D1F2EB',
        '#F4F9FB',
      ];
    } else if (status === SLOT_STATUS.CANCELLED_AVAILABLE) {
      return [
        '#FFF8E1', // Pitta pastel yellow
        '#FFE0B2',
        '#FFF9F0',
      ];
    } else if (status === SLOT_STATUS.BREAK) {
      return [
        '#FFE0B2', '#FFD180', '#FFF9F0']; // Pitta accent orange
    } else if ([SLOT_STATUS.NOT_AVAILABLE, SLOT_STATUS.THERAPIST_UNAVAILABLE].includes(status)) {
      return ['#F5F5F5', '#E0E0E0', '#F9F9FB']; // Neutral gray
    }
    return ['#FFFFFF', '#F9F9FB', '#F4F9FB']; // Default fallback
  };

  return (
    <LinearGradient
      colors={getStatusBackgroundColor(status) as [string, string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.slot,
        {
          minWidth: SLOT_SIZE.minWidth,
          maxWidth: SLOT_SIZE.maxWidth,
          minHeight: SLOT_SIZE.minHeight,
          maxHeight: SLOT_SIZE.maxHeight,
          borderRadius: SLOT_SIZE.borderRadius,
          padding: SLOT_SIZE.padding,
        },
      ]}
    >
      <View style={styles.centerContent}>
        {/* Always show time at the top */}
        {mainContent}
        {actions}
      </View>
    </LinearGradient>
  );
};

export default IntelligentSlot;
