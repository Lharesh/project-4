import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginBottom: 10,
  },
  placeholder: {
    color: 'gray',
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10,
    color: '#444',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 5, // Added for spacing when error text appears
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
  },
  multiSelectWrapper: {
    // borderWidth: 1,
    // borderColor: '#ccc',
    // borderRadius: 5,
  },
  multiSelectDropdown: {
    // Styles for the dropdown part of multiselect
    backgroundColor: '#fff',
  },
  dateNavButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  dateNavButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  matrixDateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#333',
  },
  alternativesContainer: {
    marginTop: 15,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#e9f5ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cce0ff',
  },
  alternativesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#00529B',
  },
  alternativeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 4,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  matrixContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  bookButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Add any other styles inferred from JSX or needed by components
  containerFocus: { // From the old minimal return, might be useful for drawer focus
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Example for a backdrop
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default styles;
