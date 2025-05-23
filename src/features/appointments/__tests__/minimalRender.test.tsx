// COMMENTED OUT DUE TO Dimensions.get ERRORS
// import React from 'react';
import { render } from '@testing-library/react-native';
import TherapyAppointments from '../modal/TherapyAppointments';

it('renders minimal TherapyAppointments', () => {
  const { getByText } = render(
    <TherapyAppointments onClose={jest.fn()} onCreate={jest.fn()} />
  );
  expect(getByText('Therapy Appointments')).toBeTruthy();
});