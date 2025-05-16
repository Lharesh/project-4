import { StyleSheet } from 'react-native';

const VATA = '#6C8CBF';
const PITTA = '#E3A857';
const KAPHA = '#7CB342';
const BASE_BG = '#F6F7F9';
const TEXT_DARK = '#1a2233';
const TEXT_LIGHT = '#fff';
const ACCENT = VATA;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: BASE_BG,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 6,
    marginTop: 10,
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
    marginBottom: 8,
  },
  dropdownList: {
    borderRadius: 8,
    marginBottom: 8,
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
    marginBottom: 8,
  },
  therapistItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT,
    backgroundColor: TEXT_LIGHT,
    marginBottom: 8,
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
    marginBottom: 8,
    gap: 8,
  },
  durationBox: {
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
    marginBottom: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  roomBox: {
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
