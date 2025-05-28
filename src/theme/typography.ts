// Typography scale for consistent font sizes, weights, and families
import { Platform } from 'react-native';

export const typography = {
  fontFamily: Platform.select({
    ios: 'San Francisco',
    android: 'Roboto',
    default: 'System',
  }),
  fontWeightRegular: '400',
  fontWeightMedium: '500',
  fontWeightBold: '700',
  fontSizeXs: 12,
  fontSizeSm: 14,
  fontSizeMd: 16,
  fontSizeLg: 20,
  fontSizeXl: 24,
  fontSizeXxl: 32,
  lineHeightSm: 18,
  lineHeightMd: 22,
  lineHeightLg: 28,
};
