import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DurationPicker from '../components/DurationPicker';

describe('DurationPicker', () => {
  it('renders duration options', () => {
    let duration = 30;
    let touched = false;
    const setDuration = (d: number) => { duration = d; };
    const setTouched = (t: boolean) => { touched = t; };
    const { getByText } = render(
      <DurationPicker
        duration={duration}
        setDuration={setDuration}
        durationOptions={[15, 30, 45]}
        touched={touched}
        setTouched={setTouched}
      />
    );
    expect(getByText('15')).toBeTruthy();
    expect(getByText('30')).toBeTruthy();
    expect(getByText('45')).toBeTruthy();
  });
  it('calls onSelect when a duration is pressed', () => {
    let duration = 30;
    let touched = false;
    const setDuration = jest.fn();
    const setTouched = jest.fn();
    const { getByText } = render(
      <DurationPicker
        duration={duration}
        setDuration={setDuration}
        durationOptions={[15, 30, 45]}
        touched={touched}
        setTouched={setTouched}
      />
    );
    fireEvent.press(getByText('45'));
    expect(setDuration).toHaveBeenCalledWith(45);
    expect(setTouched).toHaveBeenCalledWith(true);
  });
});
