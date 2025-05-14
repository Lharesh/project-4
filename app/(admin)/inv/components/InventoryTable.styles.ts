import { StyleSheet, Platform, Dimensions } from 'react-native';

export const COLUMN_WIDTH = 120;
export const NUM_COLUMNS = 11; // Adjust as needed
export const TABLE_MIN_WIDTH = COLUMN_WIDTH * NUM_COLUMNS;

export const inventoryTableStyles = StyleSheet.create({
  tableContainer: {
    margin: 15,
    alignSelf: 'center',
    marginBottom: 30,
    display: 'flex', // Only 'flex' is valid in RN
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    // Remove overflow here, handle in web JSX
  },
  table: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 6,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    minWidth: TABLE_MIN_WIDTH,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomWidth: 1,
    borderColor: '#eee',
    minWidth: TABLE_MIN_WIDTH,
  },
  headerCell: {
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  dataCell: {
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH,
    padding: 5,
    alignItems: 'center', // Vertically center content
    justifyContent: 'center',
    borderRightWidth: 1,
    borderColor: '#eee',
  },
  cellTextLeft: {
    textAlign: 'left',
    paddingLeft: 6,
    width: '100%',
  },
  cellTextRight: {
    textAlign: 'right',
    paddingRight: 6,
    width: '100%',
  },
});
