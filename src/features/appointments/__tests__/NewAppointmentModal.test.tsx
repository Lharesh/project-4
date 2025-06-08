import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NewAppointmentModal from '../modal/NewAppointmentModal';

jest.mock('../modal/DoctorAppointments', () => () => <></>);
jest.mock('../modal/TherapyAppointments', () => () => <></>);

// Basic props for modal
const baseProps = {
  visible: true,
  onClose: jest.fn(),
  onCreate: jest.fn(),
};

describe('NewAppointmentModal', () => {
  it('renders doctor and therapy tabs', () => {
    const { getByText } = render(<NewAppointmentModal clients={[]} therapists={[]} rooms={[]} clinicTimings={undefined} appointments={[]} enforceGenderMatch={false} {...baseProps} />);
    expect(getByText('Doctor')).toBeTruthy();
    expect(getByText('Therapy')).toBeTruthy();
  });

  it('does not render content when not visible', () => {
    const { queryByText } = render(<NewAppointmentModal clients={[]} therapists={[]} rooms={[]} clinicTimings={undefined} appointments={[]} enforceGenderMatch={false} {...baseProps} visible={false} />);
    expect(queryByText('Doctor')).toBeNull();
    expect(queryByText('Therapy')).toBeNull();
  });

  it('switches tabs correctly', () => {
    const { getByText } = render(<NewAppointmentModal clients={[]} therapists={[]} rooms={[]} clinicTimings={undefined} appointments={[]} enforceGenderMatch={false} {...baseProps} />);
    const doctorTab = getByText('Doctor');
    const therapyTab = getByText('Therapy');
    fireEvent.press(therapyTab);
    expect(getByText('Therapy')).toBeTruthy();
    fireEvent.press(doctorTab);
    expect(getByText('Doctor')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = render(
      <NewAppointmentModal clients={[]} therapists={[]} rooms={[]} clinicTimings={undefined} appointments={[]} enforceGenderMatch={false} {...baseProps} onClose={onClose} />
    );
    const closeButton = getByLabelText('close-modal');
    fireEvent.press(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

});
