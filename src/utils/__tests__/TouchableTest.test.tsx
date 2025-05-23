import React from 'react';
import { render } from '@testing-library/react-native';
import { TouchableOpacity, Text } from 'react-native';

describe('TouchableOpacity basic render', () => {
  it('renders a TouchableOpacity', () => {
    const { getByTestId } = render(
      <TouchableOpacity testID="touchable">
        <Text>Press me</Text>
      </TouchableOpacity>
    );
    expect(getByTestId('touchable')).toBeTruthy();
  });
});
