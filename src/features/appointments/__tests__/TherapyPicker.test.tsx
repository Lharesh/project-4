import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TherapyPicker from '../components/TherapyPicker';

describe('TherapyPicker', () => {
  const TherapyPickerTestWrapper = (props: any) => {
    const [therapySearch, setTherapySearch] = React.useState('');
    const [selectedTherapy, setSelectedTherapy] = React.useState<string | null>(null);
    const [therapyInputFocused, setTherapyInputFocused] = React.useState(true);
    const [touched, setTouched] = React.useState(false);
    return (
      <TherapyPicker
        {...props}
        therapySearch={therapySearch}
        setTherapySearch={setTherapySearch}
        selectedTherapy={selectedTherapy}
        setSelectedTherapy={setSelectedTherapy}
        therapyInputFocused={therapyInputFocused}
        setTherapyInputFocused={setTherapyInputFocused}
        touched={touched}
        setTouched={setTouched}
      />
    );
  };
  const therapies = [
    { id: 'th1', name: 'Physiotherapy' },
    { id: 'th2', name: 'Speech Therapy' },
  ];
  it('renders therapy options', () => {
    const setSelectedTherapy = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <TherapyPickerTestWrapper therapies={therapies} />
    );
    // Simulate user focusing the input and entering a search string
    const input = getByPlaceholderText('Search or select therapy...');
    fireEvent.changeText(input, 'Physio');
    expect(getByText('Physiotherapy')).toBeTruthy();
    fireEvent.changeText(input, 'Speech');
    expect(getByText('Speech Therapy')).toBeTruthy();
  });
  it('calls setSelectedTherapy when a therapy is pressed', () => {
    const setSelectedTherapy = jest.fn();
    const { getByText, getByPlaceholderText } = render(
      <TherapyPickerTestWrapper therapies={therapies} />
    );
    // Simulate user searching so dropdown is visible
    const input = getByPlaceholderText('Search or select therapy...');
    fireEvent.changeText(input, 'Physio');
    fireEvent.press(getByText('Physiotherapy'));
    // After selection, the input value should be 'Physiotherapy'
    expect(getByPlaceholderText('Search or select therapy...').props.value).toBe('Physiotherapy');
  });
});
