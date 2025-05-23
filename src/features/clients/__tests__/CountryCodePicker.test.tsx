import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CountryCodePicker } from '../components/CountryCodePicker';

// Helper to wrap picker with required props
const renderPicker = (props = {}) => {
  const onChange = jest.fn();
  const utils = render(
    <CountryCodePicker value={props.value || '+91'} onChange={onChange} {...props} />
  );
  return { ...utils, onChange };
};

describe('CountryCodePicker', () => {
  it('renders the picker with the selected code', () => {
    const { getByText } = renderPicker({ value: '+44' });
    expect(getByText('+44')).toBeTruthy();
  });

  it('opens the modal when pressed', () => {
    const { getByText, queryByText } = renderPicker();
    expect(queryByText('India')).toBeNull();
    fireEvent.press(getByText('+91'));
    expect(getByText('India')).toBeTruthy();
  });

  it('calls onChange and closes modal when a country is selected', () => {
    const { getByText, onChange, queryByText } = renderPicker();
    fireEvent.press(getByText('+91'));
    fireEvent.press(getByText('+1'));
    expect(onChange).toHaveBeenCalledWith('+1');
    // Modal should close
    expect(queryByText('USA')).toBeNull();
  });

  it('closes the modal on backdrop press (onRequestClose)', () => {
    const { getByText, queryByText, getByTestId } = renderPicker();
    fireEvent.press(getByText('+91'));
    // Simulate onRequestClose
    fireEvent(getByTestId('Modal'), 'onRequestClose');
    expect(queryByText('India')).toBeNull();
  });

  it('renders all country codes in the list', () => {
    const { getByText } = renderPicker();
    fireEvent.press(getByText('+91'));
    expect(getByText('India')).toBeTruthy();
    expect(getByText('USA')).toBeTruthy();
    expect(getByText('UK')).toBeTruthy();
    expect(getByText('Australia')).toBeTruthy();
    expect(getByText('UAE')).toBeTruthy();
  });
});
