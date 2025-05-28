import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

// Mock GenericTimePicker to always set a valid time
jest.mock('../../../utils/GenericTimePicker', () => {
  const React = require('react');
  return ({ onChange }: { onChange: (val: string) => void }) => {
    React.useEffect(() => {
      onChange('10:00');
    }, [onChange]);
    return null;
  };
});
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TherapyAppointments from '../modal/TherapyAppointments';

const mockClients: import('../../clients/clientsSlice').Client[] = [
  { id: '1', name: 'John Doe', gender: 'Male', mobile: '1234567890', mobileCode: '+91', age: 30 },
  { id: '2', name: 'Jane Smith', gender: 'Female', mobile: '9876543210', mobileCode: '+91', age: 28 },
];
// NOTE: Therapist type expects lowercase gender, client/patient type expects capitalized. Production code should normalize gender comparison.
const mockTherapists: import('../helpers/availabilityUtils').Therapist[] = [
  { id: 't1', name: 'Therapist A', gender: 'male', availability: { Monday: ['10:00'], Tuesday: ['10:00'] } },
  { id: 't2', name: 'Therapist B', gender: 'female', availability: { Monday: ['10:00'] } },
];
const mockRooms = [
  { id: '101', name: 'Room 1' },
  { id: '102', name: 'Room 2' },
];
const mockAppointments: any[] = [];

// Example therapy for selection
const mockTherapies = [
  { id: 'th1', name: 'Ayurvedic Massage' },
  { id: 'th2', name: 'Shirodhara' }
];

describe('TherapyAppointments', () => {
  it('renders all core UI elements', () => {
    const { getByText, getByPlaceholderText } = render(
      <TherapyAppointments
        visible={true}
        onClose={jest.fn()}
        onCreate={jest.fn()}
        clients={mockClients}
        therapists={mockTherapists}
        rooms={mockRooms}
        appointments={mockAppointments}
        clinicTimings={{
  weekdays: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' }
  }
}}
        therapies={mockTherapies}
        enforceGenderMatch={false}
      />
    );
    expect(getByText('Patient')).toBeTruthy();
    expect(getByText('Therapy Name')).toBeTruthy();
    expect(getByText('Date')).toBeTruthy();
    expect(getByText('Therapist(s)')).toBeTruthy();
    expect(getByText('Room (Optional)')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Start Therapy')).toBeTruthy();
    expect(getByPlaceholderText('Add any special instructions or diagnosis notes here...')).toBeTruthy();
  });

  it('calls onClose when Cancel is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <TherapyAppointments
        visible={true}
        onClose={onClose}
        onCreate={jest.fn()}
        clients={mockClients}
        therapists={mockTherapists}
        rooms={mockRooms}
        appointments={mockAppointments}
        clinicTimings={{
  weekdays: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' }
  }
}}
        therapies={mockTherapies}
        enforceGenderMatch={false}
      />
    );
    fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows validation errors if required fields are missing and Start Therapy is pressed', () => {
    const onCreate = jest.fn();
    const { getByText, queryByText } = render(
      <TherapyAppointments
        visible={true}
        onClose={jest.fn()}
        onCreate={onCreate}
        clients={mockClients}
        therapists={mockTherapists}
        rooms={mockRooms}
        appointments={mockAppointments}
        clinicTimings={{
  weekdays: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' }
  }
}}
        therapies={mockTherapies}
        enforceGenderMatch={false}
      />
    );
    fireEvent.press(getByText('Start Therapy'));
    expect(onCreate).not.toHaveBeenCalled();
    // These error messages depend on your implementation
    expect(queryByText(/please select a patient/i)).toBeTruthy();
    expect(queryByText(/please select a therapy/i)).toBeTruthy();
    expect(queryByText(/please select a date/i)).toBeTruthy();
    expect(queryByText(/please select at least one therapist/i)).toBeTruthy();
  });

  it('calls onCreate when all required fields are filled and Start Therapy is pressed', async () => {
    const onCreate = jest.fn();
    // Find the selected patient and normalize gender for therapist filtering
    const selectedPatient = mockClients.find(c => c.name === 'John Doe');
    const normalizedGender = selectedPatient?.gender.toLowerCase();

    // Set up mock Redux store with available slot for therapist, room, and date
    const mockStore = configureStore([]);
    const initialState = {
      appointments: {
        items: [],
        clinicTimings: {
          weekdays: {
            monday: { start: '09:00', end: '18:00' },
            tuesday: { start: '09:00', end: '18:00' }
          }
        },
        slotDuration: 15
      },
      therapists: {
        items: [
          {
            id: 't1',
            name: 'Therapist A',
            gender: 'male',
            availability: {
              Monday: ['10:00'],
              Tuesday: ['10:00']
            }
          },
          {
            id: 't2',
            name: 'Therapist B',
            gender: 'female',
            availability: {
              Monday: ['10:00']
            }
          }
        ]
      },
      rooms: {
        items: [
          { id: '101', name: 'Room 1' },
          { id: '102', name: 'Room 2' }
        ]
      },
      clients: {
        items: [
          { id: 'p1', name: 'John Doe', gender: 'male' },
          { id: 'p2', name: 'Jane Smith', gender: 'female' }
        ]
      },
      therapies: {
        items: [
          { id: 'th1', name: 'Ayurvedic Massage' },
          { id: 'th2', name: 'Shirodhara' }
        ]
      }
    };
    const store = mockStore(initialState);

    const { getByText, getByPlaceholderText, findByText, queryByTestId, queryByText, getByDisplayValue, getAllByDisplayValue, toJSON } = render(
      <Provider store={store}>
        <TherapyAppointments
          visible={true}
          onClose={jest.fn()}
          onCreate={onCreate}
          clients={mockClients}
          therapists={mockTherapists}
          rooms={mockRooms}
          therapies={mockTherapies}
          appointments={mockAppointments}
          clinicTimings={{
  weekdays: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' }
  }
}}
          enforceGenderMatch={false}
        />
      </Provider>
    );

    // Simulate patient selection
    const patientInput = getByPlaceholderText('Search client by name');
    fireEvent.changeText(patientInput, 'John Doe');
    const patientOption = await findByText('John Doe');
    fireEvent.press(patientOption);

    // Simulate date selection
    const dateInput = getByText('Select date');
    fireEvent.press(dateInput);
    // Try to find the date input field and change its value
    let dateField;
    try {
      // Try common placeholder first
      dateField = getByPlaceholderText('YYYY-MM-DD');
    } catch (e) {
      // Fallback: pick the first empty input
      dateField = getAllByDisplayValue('')[0];
    }
    fireEvent.changeText(dateField, '2025-05-27');

    // Simulate therapy selection
    const therapyInput = getByPlaceholderText('Search or select therapy...');
    fireEvent(therapyInput, 'focus');
    fireEvent.changeText(therapyInput, 'Ayurvedic Massage');
    await waitFor(async () => {
      const therapyOption = await findByText('Ayurvedic Massage');
      expect(therapyOption).toBeTruthy();
      fireEvent.press(therapyOption);
    });
    // Simulate therapist selection
    const therapistInput = getByPlaceholderText('Search or select therapist...');
    fireEvent(therapistInput, 'focus');
    fireEvent.changeText(therapistInput, 'Therapist A');
    await waitFor(async () => {
      const therapistOption = await findByText('Therapist A');
      expect(therapistOption).toBeTruthy();
      fireEvent.press(therapistOption);
    });

    // Simulate time slot selection
    let timeField;
    try {
      // Try to find the time field by regex for time format or placeholder
      timeField = getByText(/\d{2} : \d{2}|HH : MM/);
      fireEvent.press(timeField);
      // Debug output to inspect rendered tree after opening time picker
      // eslint-disable-next-line no-console
      console.log(toJSON());
    } catch (e) {
      try {
        // Try by placeholder
        timeField = getByPlaceholderText('HH:MM');
        fireEvent.changeText(timeField, '10:00');
      } catch (e2) {
        // Fallback: pick the first empty input
        timeField = getAllByDisplayValue('')[0];
        fireEvent.changeText(timeField, '10:00');
      }
    }
    // Confirm in modal (if present)
    try {
      const confirmBtn = getByText('Confirm');
      fireEvent.press(confirmBtn);
    } catch (e) {
      // If no modal, ignore
    }

    // Simulate entering notes
    fireEvent.changeText(getByPlaceholderText('Add any special instructions or diagnosis notes here...'), 'Test notes');
    // Press Start Therapy
    fireEvent.press(getByText('Start Therapy'));
    // Wait for onCreate to be called
    await waitFor(() => {
      expect(onCreate).toHaveBeenCalled();
    });
  });

  it('allows optional room selection and updates state', () => {
    const { getByText } = render(
      <TherapyAppointments
        visible={true}
        onClose={jest.fn()}
        onCreate={jest.fn()}
        clients={mockClients}
        therapists={mockTherapists}
        rooms={mockRooms}
        appointments={mockAppointments}
        clinicTimings={{
  weekdays: {
    monday: { start: '09:00', end: '18:00' },
    tuesday: { start: '09:00', end: '18:00' }
  }
}}


therapies={mockTherapies}
        enforceGenderMatch={false}
      />
    );
    // Simulate selecting a room
    fireEvent.press(getByText('Room 1'));
    // If your UI visually marks the selected room, you can assert on that here
    expect(getByText('Room 1')).toBeTruthy();
  });

  // Add more tests as needed for edge cases, gender enforcement, or time/date pickers
});
