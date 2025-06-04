import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import { router } from 'expo-router';
import { APPOINTMENT_PARAM_KEYS } from '../constants/paramKeys';

export type IntelligentSlotStatus = 'available' | 'booked' | 'break' | 'therapistUnavailable' | 'notAvailable';

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
}

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
}) => {
  // Always use the correct slot style for the outermost View
  let slotStyle = styles.available;
  if (status === 'booked') slotStyle = styles.booked;
  else if (status === 'break') slotStyle = styles.break;
  else if ([
    'unavailable',
    'therapistUnavailable',
    'notAvailable'
  ].includes(status)) {
    slotStyle = styles.unavailable;
  }

  // Dosha color cycle for avatars
  const doshaColors = [colors.vata.primary, colors.pitta.primary, colors.kapha.primary];

  // --- Action menu state ---
  const [menuVisible, setMenuVisible] = React.useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Overlay icon (top right)
  const overlayIcon = (
    <TouchableOpacity style={styles.overlayIcon} onPress={openMenu} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
      <Text style={{ fontSize: 18, color: colors.grayDark }}>⋮</Text>
    </TouchableOpacity>
  );

  // --- Action menu for slot ---
  const showCancel = typeof onCancel === 'function';
  const showReschedule = typeof onReschedule === 'function';
  const showComplete = typeof onConfirmVisit === 'function';
  const showCreate = typeof onCreate === 'function';

  const ActionMenu = () => (
    <Modal
      visible={menuVisible}
      transparent
      animationType="fade"
      onRequestClose={closeMenu}
    >
      <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu}>
        <View style={styles.menuContainer}>
          {showCreate && (
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              closeMenu();
              if (typeof onCloseModal === 'function') {
                onCloseModal();
              }
              setTimeout(() => {
                console.log('Create action slot params:', { startTime, endTime, roomId, date });
                router.push({
                  pathname: '/(app)/clients',
                  params: {
                    [APPOINTMENT_PARAM_KEYS.SLOT_START]: startTime,
                    [APPOINTMENT_PARAM_KEYS.SLOT_END]: endTime,
                    [APPOINTMENT_PARAM_KEYS.ROOM_ID]: roomId,
                    slotRoom: roomId,
                    [APPOINTMENT_PARAM_KEYS.DATE]: date,
                    select: 1, // keep as string for compatibility
                    new: 1, // signals to open drawer and clear previous client/appointment data
                    t: Date.now(), // force navigation to be unique
                  }
                });
// 'new: 1' param signals downstream components to open the drawer and reset all client/appointment fields
              }, 50);
            }}>
              <Text style={styles.menuItemText}>Create</Text>
            </TouchableOpacity>
          )}
          {showCancel && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); onCancel && onCancel(); }}>
              <Text style={styles.menuItemText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {showReschedule && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); onReschedule && onReschedule(); }}>
              <Text style={styles.menuItemText}>Reschedule</Text>
            </TouchableOpacity>
          )}
          {showComplete && (
            <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); onConfirmVisit && onConfirmVisit(); }}>
              <Text style={styles.menuItemText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.menuItem, { borderTopWidth: 1, borderColor: '#eee' }]} onPress={closeMenu}>
            <Text style={[styles.menuItemText, { color: '#888' }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  let mainContent = null;
  let actions = null;
  let statusLabel = '';

  if (status === 'break') {
    mainContent = <Text style={styles.breakText}>Break</Text>;
    statusLabel = 'Break';
  } else if (status === 'booked') {
    mainContent = (
      <>
        {/* Time always at the top */}
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        {/* Patient Avatar with ID */}
        {clientId ? (
          <View style={styles.avatarPatient}>
            <Text style={styles.avatarText}>{clientId.length > 2 ? clientId.slice(-2) : clientId}</Text>
          </View>
        ) : null}
        {/* Patient Name and Phone always visible, directly below avatar */}
        <View style={{ alignItems: 'center', marginBottom: 2 }}>
          <Text style={styles.patientNameSingle} numberOfLines={1} ellipsizeMode="tail">{patientName || 'Unknown Patient'}</Text>
          <Text style={styles.patientPhone}>{patientPhone || 'No phone'}</Text>
        </View>
        {/* Therapy name and therapist avatars in a row */}
        <View style={styles.therapyRow}>
          <Text style={styles.therapyTextRow} numberOfLines={1} ellipsizeMode="tail">{therapyName}</Text>
          <View style={styles.avatarsRowRight}>
            {availableTherapists && availableTherapists.length > 0 && availableTherapists.map((t, idx) => (
              <View
                key={t.name + idx}
                style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}
              >
                <Text style={styles.avatarText}>{t.name[0]}</Text>
              </View>
            ))}
          </View>
        </View>
        {typeof treatmentDay === 'number' && totalTreatmentDays && totalTreatmentDays > 1 && (
          <Text style={styles.dayText}>Day {treatmentDay} of {totalTreatmentDays}</Text>
        )}
      </>
    );
    statusLabel = 'Booked';
    actions = null; // No action buttons for booked slots
  } else if (status === 'available') {
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <View style={styles.avatarsRow}>
          {availableTherapists && availableTherapists.length > 0 ? (
            availableTherapists.map((t, idx) => (
              <View
                key={t.name + idx}
                style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}
              >
                <Text style={styles.avatarText}>{t.name[0]}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noTherapistText}>Therapists Unavailable</Text>
          )}
        </View>
      </>
    );
    statusLabel = availableTherapists && availableTherapists.length > 0 ? 'Available' : '';
    actions = availableTherapists && availableTherapists.length > 0 && onBook ? (
      <TouchableOpacity style={styles.actionBtn} onPress={onBook}>
        <Text style={styles.actionBtnText}>Book</Text>
      </TouchableOpacity>
    ) : null;
  } else if (status === 'therapistUnavailable') {
    slotStyle = styles.unavailable;
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <Text style={styles.unavailableText}>Therapists are busy</Text>
      </>
    );
    statusLabel = 'Unavailable';
  } else if (status === 'notAvailable') {
    slotStyle = styles.unavailable;
    mainContent = (
      <>
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        <Text style={styles.unavailableText}>Not Available</Text>
      </>
    );
    statusLabel = 'Not Available';
  }

  return (
    <View style={[styles.slot, slotStyle]}>
      {/* Overlay icon (menu) */}
      {overlayIcon}
      <ActionMenu />
      <View style={styles.centerContent}>
        {/* Always show time at the top */}
        <Text style={styles.timeText}>{startTime} - {endTime}</Text>
        {/* Avatars for therapists (booked and available) */}
        {availableTherapists && availableTherapists.length > 0 && (
          <View style={[styles.avatarsRow, { flexWrap: 'wrap' }]}>
            {availableTherapists.map((t, idx) => (
              <View
                key={t.name + idx}
                style={[styles.avatar, { backgroundColor: doshaColors[idx % doshaColors.length] }]}
              >
                <Text style={styles.avatarText}>{t.name[0]}</Text>
              </View>
            ))}
          </View>
        )}
        {/* Booked slot info: patient name, phone, therapy */}
        {status === 'booked' && (
          <>
            {patientName ? <Text style={styles.patientNameSingle}>{patientName}</Text> : null}
            {patientPhone ? <Text style={styles.patientPhone}>{patientPhone}</Text> : null}
            {therapyName ? <Text style={styles.therapyText}>{therapyName}</Text> : null}
            {typeof treatmentDay === 'number' && totalTreatmentDays && totalTreatmentDays > 1 && (
              <Text style={styles.dayText}>Day {treatmentDay} of {totalTreatmentDays}</Text>
            )}
          </>
        )}
        {/* Available slot info */}
        {status === 'available' && (
          availableTherapists && availableTherapists.length === 0 ? (
            <Text style={styles.noTherapistText}>Therapists Unavailable</Text>
          ) : null
        )}
        {/* Unavailable/break info */}
        {status === 'break' && <Text style={styles.breakText}>Break</Text>}
        {status === 'therapistUnavailable' && <Text style={styles.unavailableText}>Therapists are busy</Text>}
        {status === 'notAvailable' && <Text style={styles.unavailableText}>Not Available</Text>}
        {/* Status label at the bottom */}
        {statusLabel ? <Text style={styles.statusText}>{statusLabel}</Text> : null}
        {actions}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarPatient: {
    backgroundColor: colors.info,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    alignSelf: 'center',
  },
  slot: {
    width: '94%',
    maxWidth: 320,
    minWidth: 120,
    minHeight: 120,
    paddingVertical: spacing.md,
    borderRadius: spacing.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.xs,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    alignSelf: 'center',
    overflow: 'hidden',
    shadowColor: colors.grayDark,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  overlayIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    padding: 4,
  },
  avatarsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  therapyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  therapyTextRow: {
    flex: 1,
    fontSize: typography.fontSizeXs,
    color: colors.grayDark,
    textAlign: 'left',
    marginRight: spacing.sm,
  },
  avatarsRowRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.info,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  avatarText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noTherapistText: {
    color: colors.gray,
    fontSize: typography.fontSizeXs,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  statusText: {
    marginTop: 2,
    fontSize: typography.fontSizeSm,
    color: colors.grayDark,
    fontWeight: '500',
  },
  patientPhone: {
    fontSize: typography.fontSizeXs,
    color: colors.grayDark,
    marginBottom: spacing.xs,
  },
  // ...keep the rest of your existing styles

  // Consistent slot sizing
  available: {
    backgroundColor: colors.success,
    borderColor: '#1976d2', // debug blue border
    borderWidth: 2,
    minHeight: 120,
    minWidth: 120,
    maxWidth: 160,
    maxHeight: 140,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexShrink: 0,
    flexGrow: 0,
    overflow: 'hidden',
  },
  booked: {
    backgroundColor: colors.info,
    borderColor: '#ff9800', // debug orange border
    borderWidth: 2,
    minHeight: 120,
    minWidth: 120,
    maxWidth: 160,
    maxHeight: 140,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexShrink: 0,
    flexGrow: 0,
    overflow: 'hidden',
  },
  break: {
    backgroundColor: colors.error,
    borderColor: '#d32f2f', // debug red border
    borderWidth: 2,
    minHeight: 120,
    minWidth: 120,
    maxWidth: 160,
    maxHeight: 140,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexShrink: 0,
    flexGrow: 0,
    overflow: 'hidden',
  },
  unavailable: {
    backgroundColor: colors.grayLight,
    borderColor: '#888', // debug gray border
    borderWidth: 2,
    minHeight: 120,
    minWidth: 120,
    maxWidth: 160,
    maxHeight: 140,
    alignItems: 'stretch',
    justifyContent: 'space-between',
    flexShrink: 0,
    flexGrow: 0,
    overflow: 'hidden',
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: typography.fontSizeMd,
    marginBottom: spacing.xs,
    color: colors.grayDark,
  },
  patientText: {
    fontWeight: '500',
    fontSize: typography.fontSizeSm,
    color: colors.info,
    marginBottom: spacing.xs,
  },
  patientNameSingle: {
    fontWeight: 'bold',
    fontSize: typography.fontSizeSm, // Reduced font size
    color: colors.grayDark,
    marginBottom: spacing.xs,
    textAlign: 'center',
    maxWidth: 120,
  },
  therapyText: {
    fontSize: typography.fontSizeXs,
    color: colors.grayDark,
    marginBottom: spacing.xs,
  },
  dayText: {
    fontSize: typography.fontSizeXs,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  breakText: {
    fontWeight: 'bold',
    color: colors.error,
    fontSize: typography.fontSizeMd,
  },
  unavailableText: {
    color: colors.gray,
    fontSize: typography.fontSizeSm,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    justifyContent: 'center',
  },
  actionBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  actionBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: typography.fontSizeXs,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 200,
    paddingVertical: 6,
    paddingHorizontal: 0,
    alignItems: 'stretch',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.17,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'flex-start',
  },
  menuItemText: {
    fontSize: 16,
    color: '#1a2233',
    fontWeight: '600',
  },
});

export default IntelligentSlot;
