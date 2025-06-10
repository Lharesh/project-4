import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TherapistPicker from '../components/TherapistPicker';

describe('TherapistPicker', () => {
  const TherapistPickerTestWrapper = (props: any) => {
    const [therapistSearch, setTherapistSearch] = React.useState('');
    const [selectedTherapists, setSelectedTherapists] = React.useState<any[]>([]);
    const [therapistInputFocused, setTherapistInputFocused] = React.useState(true);
    const [showAllTherapists, setShowAllTherapists] = React.useState(true);
    const [touched, setTouched] = React.useState(false);
    return (
      <TherapistPicker
        {...props}
        therapistSearch={therapistSearch}
        setTherapistSearch={setTherapistSearch}
        selectedTherapists={selectedTherapists}
        setSelectedTherapists={setSelectedTherapists}
        therapistInputFocused={therapistInputFocused}
        setTherapistInputFocused={setTherapistInputFocused}
        showAllTherapists={showAllTherapists}
        setShowAllTherapists={setShowAllTherapists}
        touched={touched}
        setTouched={setTouched}
      />
    );
  };
  const therapists = [
    { id: 't1', name: 'Dr. Sharma', gender: 'male', availability: { '2025-06-01': ['09:00 AM'] } },
    { id: 't2', name: 'Dr. Reddy', gender: 'female', availability: { '2025-06-01': ['09:30 AM'] } },
  ];
  it('renders therapist options', () => {
    const { getByText, getByPlaceholderText } = render(
      <TherapistPickerTestWrapper therapists={therapists} patientGender={null} />
    );
    // Simulate user focusing the input and entering a search string
    const input = getByPlaceholderText('Search or select therapist...');
    fireEvent.changeText(input, 'Sharma');
    expect(getByText('Dr. Sharma')).toBeTruthy();
    fireEvent.changeText(input, 'Reddy');
    expect(getByText('Dr. Reddy')).toBeTruthy();
  });
});
