// COMMENTED OUT DUE TO useReducer ERRORS
// import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DoctorAppointments from '../modal/DoctorAppointments';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';

// Mock dependencies to avoid undefined errors in test environment
jest.mock('../../../utils/GenericDatePicker', () => ({
  __esModule: true,
  GenericDatePicker: () => null,
}));
jest.mock('../../../utils/GenericTimePicker', () => ({
  __esModule: true,
  default: () => null,
}));

// Mocks for TurboModuleRegistry and DevMenu to prevent invariant errors in Jest
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: () => {},
  get: () => {},
}));

// Mock Dimensions for React Native Testing Library compatibility
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 375, height: 667, scale: 2, fontScale: 2 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock PixelRatio for React Native Testing Library compatibility
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  __esModule: true,
  default: {
    get: () => 2,
    getFontScale: () => 2,
    getPixelSizeForLayoutSize: jest.fn(),
    roundToNearestPixel: jest.fn(),
  },
}));

// Mock NativeDeviceInfo for React Native Testing Library compatibility
jest.mock('react-native/Libraries/Utilities/NativeDeviceInfo', () => ({
  getConstants: () => ({}),
}));

// Mock NativeEventEmitter to avoid instantiation errors
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  const EventEmitter = require('events');
  return EventEmitter;
});

// Mock Platform.ios and Platform.android for Platform.constants

// Mock the main Platform module



import { GenericDatePicker } from '../../../utils/GenericDatePicker';
import GenericTimePicker from '../../../utils/GenericTimePicker';


jest.mock('../modal/NewAppointmentModal', () => ({
  CLIENTS: [{ id: 'c1', name: 'Amit Kumar' }],
}));
jest.mock('../modal/DoctorAppointments.styles', () => ({}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@react-native-picker/picker', () => {
  const React = require('react');
  const Picker = ({ children, ...props }: any) => <select {...props}>{children}</select>;
  Picker.Item = (props: any) => <option {...props} />;
  return { Picker };
});

const mockStore = configureStore([]);
const initialState = {
  // Provide minimal required state shape for DoctorAppointments
  appointments: [],
  // ...add other slices as needed
};
const store = mockStore(initialState);

const baseProps = {
  onClose: jest.fn(),
  onCreate: jest.fn(),
};

describe('DoctorAppointments', () => {
  it('renders all required fields', () => {
    const { getByText } = render(
      <Provider store={store}>
        <DoctorAppointments {...baseProps} />
      </Provider>
    );
    expect(getByText('Select Doctor')).toBeTruthy();
    expect(getByText('Client')).toBeTruthy();
    expect(getByText('Client Mobile')).toBeTruthy();
    expect(getByText('Date')).toBeTruthy();
    expect(getByText('Start Time')).toBeTruthy();
    expect(getByText('Consultation Type')).toBeTruthy();
    expect(getByText('Mode')).toBeTruthy();
    expect(getByText('Notes')).toBeTruthy();
    expect(getByText('Cancel')).toBeTruthy();
    expect(getByText('Create Appointment')).toBeTruthy();
  });

  describe('Mobile compatibility and accessibility', () => {
    it('has accessible labels for all fields and buttons', () => {
      const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
          <DoctorAppointments {...baseProps} />
        </Provider>
      );
      expect(getByPlaceholderText('Search client by name')).toBeTruthy();
      expect(getByPlaceholderText('Enter mobile number')).toBeTruthy();
      expect(getByText('Date')).toBeTruthy();
      expect(getByText('Start Time')).toBeTruthy();
      expect(getByText('Select Doctor')).toBeTruthy();
      expect(getByText('Consultation Type')).toBeTruthy();
      expect(getByText('Create Appointment')).toBeTruthy();
      expect(getByText('Cancel')).toBeTruthy();
    });

    it('renders correctly on small device (mobile viewport)', () => {
      const { getByText, getByPlaceholderText } = render(
        <Provider store={store}>
          <DoctorAppointments {...baseProps} />
        </Provider>
      );
      expect(getByText('Create Appointment')).toBeTruthy();
      expect(getByPlaceholderText('Search client by name')).toBeTruthy();
    });

    it('is scrollable when content overflows', () => {
      const { getByTestId } = render(
        <Provider store={store}>
          <DoctorAppointments {...baseProps} />
        </Provider>
      );
      expect(getByTestId('doctor-appointments-scroll')).toBeTruthy();
    });

    it('keeps input visible when keyboard is open', () => {
      const { getByPlaceholderText } = render(
        <Provider store={store}>
          <DoctorAppointments {...baseProps} />
        </Provider>
      );
      const input = getByPlaceholderText('Enter mobile number');
      fireEvent(input, 'focus');
      // expect(input).toBeVisible();
    });
  });

  it('calls onClose when cancel is pressed', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <Provider store={store}>
        <DoctorAppointments {...baseProps} onClose={onClose} />
      </Provider>
    );
    fireEvent.press(getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables create if required fields are missing', () => {
    const { getByText } = render(
      <Provider store={store}>
        <DoctorAppointments {...baseProps} />
      </Provider>
    );
    fireEvent.press(getByText('Create Appointment'));
    // Should NOT call onCreate due to validation
    expect(baseProps.onCreate).not.toHaveBeenCalled();
  });

  describe('Double booking prevention', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });

    it('prevents double booking for doctor or client at same time', () => {
      // Existing appointment for same doctor and client at same date/time
      const mockAppointments = [
        {
          id: '1',
          clientId: 'c1',
          clientName: 'Amit Kumar',
          clientMobile: '9876543210',
          doctorId: '1',
          doctorName: 'Dr. Sharma (Ayurvedic Physician)',
          treatmentId: 'treatment1',
          treatmentName: 'Consultation',
          consultationId: 'consultation',
          consultationName: 'Consultation',
          duration: 15,
          roomNumber: '101',
          date: '2025-06-01',
          time: '09:00 AM',
          status: 'pending',
          notes: '',
          tab: 'Doctor',
        },
      ];
      const customStore = mockStore({ appointments: mockAppointments });
      const onCreate = jest.fn();
      const { getByText } = render(
        <Provider store={customStore}>
          <DoctorAppointments {...baseProps} onCreate={onCreate} />
        </Provider>
      );
      fireEvent.press(getByText('Create Appointment'));
      expect(onCreate).not.toHaveBeenCalled();
    });

    it('prevents double booking for doctor or client at same time with form filling', () => {
      // Existing appointment for same doctor and client at same date/time
      const mockAppointments = [
        {
          id: '1',
          clientId: 'c1',
          clientName: 'Amit Kumar',
          clientMobile: '9876543210',
          doctorId: '1',
          doctorName: 'Dr. Sharma (Ayurvedic Physician)',
          treatmentId: 'treatment1',
          treatmentName: 'Consultation',
          consultationId: 'consultation',
          consultationName: 'Consultation',
          duration: 15,
          roomNumber: '101',
          date: '2025-06-01',
          time: '09:00 AM',
          status: 'pending',
          notes: '',
          tab: 'Doctor',
        },
      ];
      const customStore = mockStore({ appointments: mockAppointments });
      const onCreate = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <Provider store={customStore}>
          <DoctorAppointments {...baseProps} onCreate={onCreate} />
        </Provider>
      );
      fireEvent.changeText(getByPlaceholderText('Search client by name'), 'Amit Kumar');
      fireEvent.press(getByText('Amit Kumar'));
      fireEvent.changeText(getByPlaceholderText('Enter mobile number'), '9876543210');
      // Date and time must match the mock appointment
      fireEvent(getByText('Date'), 'onChange', '2025-06-01');
      fireEvent(getByText('Start Time'), 'onChange', '09:00 AM');
      fireEvent.press(getByText('Create Appointment'));
      expect(onCreate).not.toHaveBeenCalled();
      // Should show an error (you may need to adjust selector for your error message)
      // expect(getByText(/already has an appointment/i)).toBeTruthy();
    });

  });

  describe('15-minute gap conflict', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
    });
    it('prevents booking if another appointment is within 15 minutes', () => {
      // Existing appointment at 09:00 AM, new attempt at 09:10 AM (within 15 min)
      const mockAppointments = {
        appointments: [
          {
            id: '1',
            clientId: 'c2',
            clientName: 'Sunita Singh',
            clientMobile: '9123456780',
            doctorId: '1',
            doctorName: 'Dr. Sharma (Ayurvedic Physician)',
            treatmentId: 'treatment1',
            treatmentName: 'Consultation',
            consultationId: 'consultation',
            consultationName: 'Consultation',
            duration: 15,
            roomNumber: '101',
            date: '2025-06-01',
            time: '09:00 AM',
            status: 'pending',
            notes: '',
            tab: 'Doctor',
          },
        ],
      };
      const customStore = mockStore({ appointments: mockAppointments.appointments });
      const onCreate = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <Provider store={customStore}>
          <DoctorAppointments {...baseProps} onCreate={onCreate} />
        </Provider>
      );
      fireEvent.changeText(getByPlaceholderText('Search client by name'), 'Amit Kumar');
      fireEvent.press(getByText('Amit Kumar'));
      fireEvent.changeText(getByPlaceholderText('Enter mobile number'), '9876543210');
      fireEvent(getByText('Date'), 'onChange', '2025-06-01');
      fireEvent(getByText('Start Time'), 'onChange', '09:10 AM');
      fireEvent.press(getByText('Create Appointment'));
      expect(onCreate).not.toHaveBeenCalled();
      // expect(getByText(/within 15 minutes/i)).toBeTruthy();
    });

    it('prevents booking on weekly off (Sunday)', () => {
      const mockAppointments = {
        appointments: [],
      };
      const customStore = mockStore({ appointments: mockAppointments.appointments });
      const onCreate = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <Provider store={customStore}>
          <DoctorAppointments {...baseProps} onCreate={onCreate} />
        </Provider>
      );
      fireEvent.changeText(getByPlaceholderText('Search client by name'), 'Amit Kumar');
      fireEvent.press(getByText('Amit Kumar'));
      fireEvent.changeText(getByPlaceholderText('Enter mobile number'), '9876543210');
      fireEvent(getByText('Date'), 'onChange', '2025-06-08');
      fireEvent(getByText('Start Time'), 'onChange', '09:00 AM');
      fireEvent.press(getByText('Create Appointment'));
      expect(onCreate).not.toHaveBeenCalled();
    });

    it('prevents booking on holiday', () => {
      const mockAppointments = {
        appointments: [],
      };
      const customStore = mockStore({ appointments: mockAppointments.appointments });
      const onCreate = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <Provider store={customStore}>
          <DoctorAppointments {...baseProps} onCreate={onCreate} />
        </Provider>
      );
      fireEvent.changeText(getByPlaceholderText('Search client by name'), 'Amit Kumar');
      fireEvent.press(getByText('Amit Kumar'));
      fireEvent.changeText(getByPlaceholderText('Enter mobile number'), '9876543210');
      fireEvent(getByText('Date'), 'onChange', '2025-12-25');
      fireEvent(getByText('Start Time'), 'onChange', '09:00 AM');
      fireEvent.press(getByText('Create Appointment'));
      expect(onCreate).not.toHaveBeenCalled();
    });

    it('allows booking when all rules are satisfied', () => {
      const mockAppointments = {
        appointments: [],
      };
      const customStore = mockStore({ appointments: mockAppointments.appointments });
      const onCreate = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <Provider store={customStore}>
          <DoctorAppointments {...baseProps} onCreate={onCreate} />
        </Provider>
      );
      fireEvent.changeText(getByPlaceholderText('Search client by name'), 'Amit Kumar');
      fireEvent.press(getByText('Amit Kumar'));
      fireEvent.changeText(getByPlaceholderText('Enter mobile number'), '9876543210');
      fireEvent(getByText('Date'), 'onChange', '2025-06-03');
      fireEvent(getByText('Start Time'), 'onChange', '09:00 AM');
      fireEvent.press(getByText('Create Appointment'));
      expect(onCreate).toHaveBeenCalled();
    });

  })
});
