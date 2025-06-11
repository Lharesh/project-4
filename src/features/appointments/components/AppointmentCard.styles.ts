import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 2,
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCol: {
    flex: 1,
    flexDirection: 'column',
  },
  cardCell: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 0,
  },
  rowCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  card: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingTop: 2,
    paddingBottom: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    minHeight: 90,
    width: '100%',
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1a2233',
    marginRight: 8,
  },
  personIcon: {
    marginRight: 4,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#1a2233',
    maxWidth: '100%',
  },
  phoneIcon: {
    marginRight: 4,
  },
  phoneText: {
    fontSize: 14,
    color: '#1a2233',
  },
  statusBadge: {
    backgroundColor: '#e3f0fa',
    color: '#4d6b99',
    fontWeight: 'bold',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'left',
    minWidth: 70,
  },
  menuButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignSelf: 'flex-end',
    marginBottom: 2,
  },
  therapists: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
    maxWidth: '100%',
  },
  daysText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1a2233',
  },
  therapyName: {
    fontSize: 13,
    color: '#6c757d',
    fontWeight: '500',
  },
  durationText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1a2233',
    textAlign: 'right',
  },
});

export default styles;
