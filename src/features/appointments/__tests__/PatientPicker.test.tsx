import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PatientPicker from '../components/PatientPicker';

describe('PatientPicker', () => {
  const PatientPickerTestWrapper = (props: any) => {
    const [patientSearch, setPatientSearch] = React.useState('');
    const [selectedPatient, setSelectedPatient] = React.useState<string | null>(null);
    const [patientInputFocused, setPatientInputFocused] = React.useState(true);
    const [touched, setTouched] = React.useState(false);
    const [patientGender, setPatientGender] = React.useState(null);
    return (
      <PatientPicker
        {...props}
        patientSearch={patientSearch}
        setPatientSearch={setPatientSearch}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        patientInputFocused={patientInputFocused}
        setPatientInputFocused={setPatientInputFocused}
        setPatientGender={setPatientGender}
        touched={touched}
        setTouched={setTouched}
      />
    );
  };
  const patients = [
    { id: 'p1', name: 'Amit Kumar', gender: 'male' },
    { id: 'p2', name: 'Sunita Singh', gender: 'female' },
  ];
  it('renders patient options', () => {
    const { getByText, getByPlaceholderText } = render(
      <PatientPickerTestWrapper patients={patients} />
    );
    // Simulate user focusing the input and entering a search string
    const input = getByPlaceholderText('Search or select patient...');
    fireEvent.changeText(input, 'Amit');
    expect(getByText('Amit Kumar')).toBeTruthy();
    fireEvent.changeText(input, 'Sunita');
    expect(getByText('Sunita Singh')).toBeTruthy();
  });
});
