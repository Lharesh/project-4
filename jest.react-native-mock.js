jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...(RN.Platform || {}),
      OS: 'ios',
      select: objs => objs.ios,
    },
  };
});
