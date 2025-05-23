jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions = {
    get: jest.fn().mockReturnValue({ width: 320, height: 640 }),
  };
  return RN;
});
