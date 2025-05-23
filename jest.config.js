module.exports = {
  setupFiles: ['<rootDir>/jest.dimensions-mock.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  preset: 'jest-expo',
  //testEnvironment: 'node', // For React Native, node is usually preferred
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "node_modules/(?!(jest-)?react-native|@react-native|expo(nent)?|@expo|@expo-google-fonts|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-community|@reduxjs/toolkit|immer|reselect|redux-thunk|redux)/"
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Map asset files to a mock file
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    // Absolute imports (if you use @/)
    // Maps @/ to <rootDir>/src for absolute imports
    
    // React Native mapping
    '^react-native$': 'react-native',
  },
};