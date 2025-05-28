import { StyleSheet } from 'react-native';

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
    marginBottom: 10, // reduced for compactness
  },
  sectionBottom: {
    marginBottom: 10, // reduced for compactness
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
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6ef',
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 48, // extra space for action buttons
    backgroundColor: BASE_BG,
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
    minHeight: 50,
    backgroundColor: '#f3f6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    marginTop: 2,
  },
  // Alternatives section at the bottom
  alternativesSection: {
    marginTop: 24,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#f7f8fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e6ef',
  },
  summaryBox: {
    minHeight: 40,
    backgroundColor: '#f3f6fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
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
});

export default styles;
