import { StyleSheet } from 'react-native';

const VATA = '#6C8CBF';
const PITTA = '#E3A857';
const KAPHA = '#7CB342';
const BASE_BG = '#F6F7F9';
const TEXT_DARK = '#1a2233';
const TEXT_LIGHT = '#fff';
const ACCENT = VATA;

const styles = StyleSheet.create({
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    gap: 8,
  },
  codePickerWrapper: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    alignItems: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafbfc',
    marginBottom: 8,
  },
  picker: {
    height: 44,
    width: '100%',
    fontSize: 16,
    color: TEXT_DARK,
    backgroundColor: TEXT_LIGHT,
  },
  dropdownList: {
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#d6dbe6',
    backgroundColor: '#fff',
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  selectedInfo: {
    fontSize: 13,
    color: ACCENT,
    marginBottom: 6,
    marginLeft: 2,
  },
  checkbox: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT,
    backgroundColor: TEXT_LIGHT,
    marginRight: 8,
    marginBottom: 8,
  },
  checkboxActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
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
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'left',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  consultationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
});

export default styles;
