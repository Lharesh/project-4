jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions = {
    get: jest.fn().mockReturnValue({ width: 320, height: 640 }),
  };
  return RN;
});
// Jest setup for React Native Testing Library and common native modules

import 'react-native-gesture-handler/jestSetup';

// Ensure Platform.OS is always defined for all imports from 'react-native'
import { Platform } from 'react-native';
try {
  Object.defineProperty(Platform, 'OS', { value: 'ios' });
} catch (e) {
  // fallback if already writable
  Platform.OS = 'ios';
}
Platform.select = objs => objs.ios;

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: React.forwardRef((props, ref) =>
      React.createElement(View, { ref, testID: props.testID || 'mockDateTimePicker' },
        React.createElement(Text, null, 'DateTimePicker Mock')
      )
    ),
  };
});
// [REINTRODUCE MOCK 1] Testing with react-native-reanimated mock only
jest.mock('react-native-reanimated', () => ({}));
// Required for react-native-reanimated v2+
global.__reanimatedWorkletInit = () => {};
// [REINTRODUCE MOCK 2] Testing with react-native-safe-area-context mock added
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock'));
// [REINTRODUCE MOCK 3] Testing with async-storage mock added
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
// [REINTRODUCE MOCK 4] Testing with lucide-react-native icon mock added
jest.mock('lucide-react-native', () => {
  const React = require('react');
  return new Proxy({}, {
    get: (target, prop) => {
      // Return a dummy component for every icon
      return (props) => React.createElement('View', props, null);
    }
  });
});
// [REINTRODUCE MOCK 5] Testing with @react-native-picker/picker mock added
jest.mock('@react-native-picker/picker', () => ({
  Picker: ({ children }) => children,
  Item: () => null,
}));
// [REINTRODUCE MOCK 6] Testing with react-native-vector-icons mock added
jest.mock('react-native-vector-icons', () => ({
  default: () => null,
}));


// Mock TurboModuleRegistry to prevent DevMenu invariant violations
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: (name) => {
    if (name === 'DevMenu') return {};
    return {};
  },
  get: (name) => {
    if (name === 'DevMenu') return {};
    return {};
  },
}));

// Mock NativeDeviceInfo at direct path (may fail if path does not exist)
try {
  jest.mock('react-native/Libraries/NativeModules/NativeDeviceInfo', () => ({
    getConstants: () => ({}),
  }));
} catch (e) {}
// Mock NativeDeviceInfo in NativeModules to provide getConstants
jest.mock('react-native/Libraries/BatchedBridge/NativeModules', () => ({
  ...jest.requireActual('react-native/Libraries/BatchedBridge/NativeModules'),
  NativeDeviceInfo: {
    getConstants: () => ({}),
  },
}));
// Mock Dimensions and PixelRatio to prevent getConstants errors
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 375, height: 667, scale: 2 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock PixelRatio at both the direct path and on the main 'react-native' mock
const pixelRatioMock = {
  get: () => 2,
  getFontScale: () => 2,
  getPixelSizeForLayoutSize: size => size * 2,
  roundToNearestPixel: x => x,
};
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => Object.assign({}, pixelRatioMock, { default: pixelRatioMock }));

// Mock NativeI18nManager for RN internals
jest.mock('react-native/Libraries/ReactNative/NativeI18nManager', () => ({
  getConstants: () => ({
    isRTL: false,
    doLeftAndRightSwapInRTL: true,
    localeIdentifier: 'en_US',
  }),
}));

// Mock NativeSettingsManager for RN internals
jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  getConstants: () => ({}),
}));

// Mock Platform.ios and Platform.android for RN internals
jest.mock('react-native/Libraries/Utilities/Platform.ios', () => ({
  __esModule: true,
  default: {
    OS: 'ios',
    select: (obj) => (obj ? obj.ios : undefined),
    getConstants: () => ({}),
  },
}));
jest.mock('react-native/Libraries/Utilities/Platform.android', () => ({
  __esModule: true,
  default: {
    OS: 'android',
    select: (obj) => (obj ? obj.android : undefined),
    getConstants: () => ({}),
  },
}));

// Robust mock for Platform and PixelRatio on main 'react-native' module for all tests
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios', // set default as needed
      select: RN.Platform ? RN.Platform.select : (obj) => (obj ? obj.ios : undefined),
      getConstants: RN.Platform ? RN.Platform.getConstants : () => ({}),
    },
    PixelRatio: pixelRatioMock,
    default: RN,
  };
});
