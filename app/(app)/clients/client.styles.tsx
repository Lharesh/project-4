import { StyleSheet, Dimensions, Platform } from 'react-native';
import { COLORS } from '@/theme/constants/theme';

export const clientStyles = StyleSheet.create({
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  clientId: {
    fontSize: 12,
    color: '#888',
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    // Responsive padding for web
    ...(Platform.OS === 'web'
      ? { padding: 32 }
      : { padding: 10 }),
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    boxSizing: 'border-box',
    alignSelf: 'center',
    // Responsive shadow
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 5,
        }),
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.neutral[500],
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    position: 'absolute',
    right: 24,
    bottom: 32,
    zIndex: 10,
    backgroundColor: COLORS.vata[500],
    borderRadius: 28,
    padding: 16,
    elevation: 4,
    shadowColor: COLORS.vata[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  formField: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: 4,
    fontFamily: 'System',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.vata[500],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
    backgroundColor: '#fff',
    flex: 1,
    minWidth: 0,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.vata[500],
    marginTop: 16,
    marginBottom: 8,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codePickerWrapper: {
    flex: 0,
    marginRight: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  modalFieldLeft: {
    marginLeft: 15,
  },
  modalFieldRight: {
    marginRight: 15,
  },
  modalButton: {
    minWidth: 110,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.vata[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.vata[500],
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: COLORS.vata[500],
    fontWeight: '600',
    fontSize: 15,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
