import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

export const SLOT_SIZE = {
    minWidth: 140,
    maxWidth: 180,
    minHeight: 140,
    maxHeight: 180,
    borderRadius: 18,
    padding: 18,
};

const styles = StyleSheet.create({
    slot: {
        alignItems: 'stretch',
        justifyContent: 'space-between',
        alignSelf: 'center',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        minWidth: SLOT_SIZE.minWidth,
        maxWidth: SLOT_SIZE.maxWidth,
        minHeight: SLOT_SIZE.minHeight,
        maxHeight: SLOT_SIZE.maxHeight,
        borderRadius: SLOT_SIZE.borderRadius,
        padding: SLOT_SIZE.padding,
        backgroundColor: 'transparent', // gradient is applied in parent
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        zIndex: 1,
    },
    avatarsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: spacing.xs,
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
    timeText: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: spacing.xs,
        color: colors.grayDark,
        textAlign: 'center',
    },
    patientNameSingle: {
        fontWeight: 'bold',
        fontSize: typography.fontSizeSm,
        color: colors.grayDark,
        marginBottom: spacing.xs,
        textAlign: 'center',
        maxWidth: 120,
    },
    patientPhone: {
        fontSize: typography.fontSizeXs,
        color: colors.grayDark,
        marginBottom: spacing.xs,
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
    actionRow: {
        flexDirection: 'row',
        marginTop: spacing.sm,
        justifyContent: 'flex-end',
        gap: 8,
        alignItems: 'center',
    },
    iconBtn: {
        backgroundColor: 'transparent',
        borderRadius: 6,
        padding: 6,
        marginHorizontal: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.info,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 18,
        marginTop: 8,
        alignSelf: 'center',
        shadowColor: colors.grayDark,
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    bookBtnText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 15,
        marginLeft: 8,
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
    menuButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 10,
    },
});

export default styles; 