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

describe('getHeaderWithBack navigation logic', () => {
  it('navigates back when router.canGoBack returns true', () => {
    router.canGoBack = jest.fn(() => true);
    router.back = jest.fn();
    router.replace = jest.fn();
    const options = getHeaderWithBack('Test', true);
    const header = options.headerLeft();
    if (header) header.props.onPress();
    expect(router.back).toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it('navigates to /clinics when router.canGoBack returns false', () => {
    router.canGoBack = jest.fn(() => false);
    router.back = jest.fn();
    router.replace = jest.fn();
    const options = getHeaderWithBack('Test', true);
    const header = options.headerLeft();
    if (header) header.props.onPress();
    expect(router.replace).toHaveBeenCalledWith('/(admin)/clinics');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('navigates to /clinics when router.canGoBack is undefined', () => {
    router.canGoBack = undefined;
    router.back = jest.fn();
    router.replace = jest.fn();
    const options = getHeaderWithBack('Test', true);
    const header = options.headerLeft();
    if (header) header.props.onPress();
    expect(router.replace).toHaveBeenCalledWith('/(admin)/clinics');
    expect(router.back).not.toHaveBeenCalled();
  });

  it('navigates to /clinics when exception is thrown', () => {
    router.canGoBack = jest.fn(() => { throw new Error('fail'); });
    router.back = jest.fn();
    router.replace = jest.fn();
    const options = getHeaderWithBack('Test', true);
    const header = options.headerLeft();
    if (header) header.props.onPress();
    expect(router.replace).toHaveBeenCalledWith('/(admin)/clinics');
    expect(router.back).not.toHaveBeenCalled();
  });
});
