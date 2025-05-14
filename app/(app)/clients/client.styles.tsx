import { StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

export const clientStyles = StyleSheet.create({
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
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    color: COLORS.neutral[900],
    backgroundColor: '#fafbfc',
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
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 12,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    backgroundColor: COLORS.vata[500],
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
