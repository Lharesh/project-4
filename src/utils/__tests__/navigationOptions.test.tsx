import React from 'react';
import { getHeaderWithBack } from '../navigationOptions';
import { TouchableOpacity } from 'react-native';
import * as ExpoRouter from 'expo-router';

jest.mock('expo-router', () => ({
  router: {
    canGoBack: undefined,
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const { router } = require('expo-router');

describe('getHeaderWithBack', () => {
  it('returns correct title and headerLeft with back', () => {
    const options = getHeaderWithBack('My Title', true);
    expect(options.title).toBe('My Title');
    expect(typeof options.headerLeft).toBe('function');
    // headerLeft should return a TouchableOpacity when showBack is true
    const header = options.headerLeft();
    expect(header).not.toBeNull();
    if (header) {
      // Should be a TouchableOpacity element
      expect(header.type).toBe(TouchableOpacity);
    }
  });

  it('returns null for headerLeft when showBack is false', () => {
    const options = getHeaderWithBack('No Back', false);
    expect(options.title).toBe('No Back');
    expect(typeof options.headerLeft).toBe('function');
    const header = options.headerLeft();
    expect(header).toBeNull();
  });
});
