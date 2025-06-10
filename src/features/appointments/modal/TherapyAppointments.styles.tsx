import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { StyleSheet } from 'react-native';
import { COLORS } from '@/theme/constants/theme';

const VATA = '#6C8CBF';
const PITTA = '#E3A857';
const KAPHA = '#7CB342';
const BASE_BG = '#F6F7F9';
const TEXT_DARK = '#1a2233';
const TEXT_LIGHT = '#fff';
const ACCENT = VATA;

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    position: 'relative',
  },
  inputFlex: {
    flex: 1,
    paddingRight: 36,
  },
  inputClearIcon: {
    position: 'absolute',
    right: 8,
    top: 0,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  appointmentsListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    paddingLeft: 5,
  },
  noAppointmentsText: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 10,
    paddingLeft: 5,
  },
  card: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f9f9f9',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 4,
    color: TEXT_DARK,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'left',
    fontWeight: '500',
  },
  durationScrollContent: {
    alignItems: 'center',
    gap: 8,
  },
  durationText: {
    color: '#222',
    fontSize: 15,
  },
  durationTextActive: {
    color: TEXT_LIGHT,
    fontWeight: '700',
  },
  durationInput: {
    width: 70,
    marginLeft: 8,
  },
  // Section spacing helpers
  section: {
    marginBottom: 4, // much more compact
  },
  sectionBottom: {
    marginBottom: 4, // much more compact
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 0,
    marginTop: 0,
    marginBottom: 0,
    gap: 8,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  sectionDivider: {
    marginVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e6e6ef',
  },

  container: {
   // flex: 1, removed to allow ScrollView to size correctly
    paddingHorizontal: 0,
    paddingTop: 6,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 16,
    marginTop: 10,
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#6C8CBF', // matches COLORS.vata[500]
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 4,
    backgroundColor: '#fff',
    color: TEXT_DARK,
    width: '100%',
    minHeight: 44,
  },
  dropdownList: {
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 260,
    borderWidth: 1,
    borderColor: '#d6dbe6',
    backgroundColor: '#fff',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    backgroundColor: '#FFFBEA', // light yellow for visibility
    marginBottom: 0,
  },
  dropdownItemActive: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    borderColor: ACCENT,
    borderWidth: 1,
  },
  selectedInfo: {
    fontSize: 13,
    color: ACCENT,
    marginBottom: 6,
    marginLeft: 2,
  },
  quickPicksRow: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  quickPickBox: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT,
    backgroundColor: TEXT_LIGHT,
    marginRight: 8,
    marginBottom: 8,
  },
  quickPickBoxActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  therapistList: {
    flexDirection: 'column',
    gap: 6,
    marginBottom: 16,
  },
  therapistItem: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT,
    backgroundColor: TEXT_LIGHT,
    marginBottom: 16,
    marginRight: 8,
  },
  therapistItemActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  therapistAvailability: {
    fontSize: 12,
    color: '#888',
    marginTop: 3,
  },
  genderFilterToggle: {
    color: PITTA,
    fontWeight: '600',
    marginLeft: 12,
    fontSize: 13,
  },
  durationRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  durationScroll: {
    marginBottom: 16,
    minHeight: 48,
    paddingVertical: 2,
  },
  durationBox: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: KAPHA,
    backgroundColor: TEXT_LIGHT,
    marginRight: 8,
  },
  durationBoxActive: {
    backgroundColor: KAPHA,
    borderColor: KAPHA,
  },
  roomList: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  roomAvatarRow: {
    minHeight: 78,
    marginBottom: 16,
    paddingBottom: 6,
  },
  roomAvatarTouchable: {
    alignItems: 'center',
    marginRight: 10,
    minWidth: 60,
    maxWidth: 80,
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: 'transparent',
  },
  roomAvatarSelected: {
    backgroundColor: PITTA + '33', // light highlight
  },
  roomAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e3e7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  roomAvatarCircleSelected: {
    backgroundColor: PITTA,
    borderColor: PITTA,
  },
  roomAvatarText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 18,
  },
  roomAvatarTextSelected: {
    color: '#fff',
  },
  roomAvatarName: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    maxWidth: 70,
  },
  roomBox: {
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PITTA,
    backgroundColor: TEXT_LIGHT,
    marginRight: 8,
    marginBottom: 8,
  },
  roomBoxActive: {
    backgroundColor: PITTA,
    borderColor: PITTA,
  },
  schedulePreview: {
    minHeight: 36,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 6,
    marginBottom: 6,
    marginTop: 2,
  },
  // Alternatives section at the bottom
  alternativesSection: {
    marginTop: 8,
    marginBottom: 8,
    padding: 6,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  summaryBox: {
    minHeight: 40,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 6,
    marginBottom: 8,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e3e7ed',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 6,
  },
  cancelBtnText: {
    color: ACCENT,
    fontWeight: '700',
    fontSize: 16,
  },
  startBtn: {
    flex: 2,
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 6,
  },
  startBtnText: {
    color: TEXT_LIGHT,
    fontWeight: '700',
    fontSize: 16,
  },
  // --- Schedule Matrix Collapsible ---
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: '#f3f6fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  collapsibleHeaderText: {
    fontWeight: '700',
    fontSize: 17,
    color: '#222',
  },
  // --- Therapists Quick Pick ---
  therapistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  therapistChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#e3eafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#c8d6f7',
  },
  therapistChipSelected: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  therapistChipText: {
    color: '#1a73e8',
    fontWeight: '500',
    fontSize: 15,
  },
  therapistChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  therapistShowAllBtn: {
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f3f6fa',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#c8d6f7',
  },
  therapistShowAllBtnActive: {
    backgroundColor: '#1a73e8',
    borderColor: '#1a73e8',
  },
  therapistShowAllBtnText: {
    color: '#1a73e8',
    fontWeight: '600',
    fontSize: 15,
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
  drawerKeyboardAvoid: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    zIndex: 100,
    width: '100%',
    alignSelf: 'center',
    maxWidth: 420,
    overflow: 'hidden',
  },
  drawerContainer: {
    backgroundColor: COLORS.neutral[50],
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    minHeight: 340,
    width: '100%',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: COLORS.neutral[900],
    letterSpacing: 0.5,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  phoneText: {
    fontSize: 15,
    color: '#555',
  },
  dsection: {
    marginBottom: 16,
  },
  dlabel: {
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.neutral[700],
  },
  therapyInputWrap: {
    position: 'relative',
  },
  therapyInput: {
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: COLORS.neutral[50],
  },
  therapyDropdown: {
    position: 'absolute',
    top: 44,
    left: 0,
    width: 260,
    backgroundColor: COLORS.neutral[100],
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 10,
    maxHeight: 120,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingVertical: 4,
    zIndex: 200,
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  dateTimeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  ddurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  durationBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
  },
  durationBtnActive: {
    backgroundColor: '#0097a7',
  },
  durationBtnInactive: {
    backgroundColor: '#eee',
  },
  durationBtnText: {
    fontWeight: '600',
  },
  durationBtnTextActive: {
    color: '#fff',
  },
  durationBtnTextInactive: {
    color: '#222',
  },
  durationCustomInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 6,
    width: 60,
    fontSize: 15,
    marginLeft: 8,
  },
  therapistsRow: {
    marginBottom: 16,
    maxHeight: 40,
  },
  therapistBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 6,
  },
  therapistBtnActive: {
    backgroundColor: '#0097a7',
  },
  therapistBtnInactive: {
    backgroundColor: '#eee',
  },
  therapistBtnText: {
    fontWeight: '600',
  },
  therapistBtnTextActive: {
    color: '#fff',
  },
  therapistBtnTextInactive: {
    color: '#222',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    backgroundColor: '#fafbfc',
    minHeight: 48,
    textAlignVertical: 'top',
  },
  dactionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  closeBtn: {
    padding: 12,
    marginRight: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 16,
  },
  createBtn: {
    padding: 12,
    backgroundColor: '#0097a7',
    borderRadius: 8,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default styles;
