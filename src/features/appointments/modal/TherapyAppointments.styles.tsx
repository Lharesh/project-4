import { StyleSheet } from 'react-native';

const VATA = '#6C8CBF';
const PITTA = '#E3A857';
const KAPHA = '#7CB342';
const BASE_BG = '#F6F7F9';
const TEXT_DARK = '#1a2233';
const TEXT_LIGHT = '#fff';
const ACCENT = VATA;

const styles = StyleSheet.create({
  // Section spacing helpers
  section: {
    marginBottom: 16,
  },
  sectionBottom: {
    marginBottom: 24,
  },
  sectionDivider: {
    marginVertical: 18,
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
    height: 44,
    paddingHorizontal: 10,
    fontSize: 16,
    color: TEXT_DARK,
    backgroundColor: TEXT_LIGHT,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6dbe6',
    marginBottom: 16,
    width: '100%',
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
    fontSize: 17,
  },
});

export default styles;
