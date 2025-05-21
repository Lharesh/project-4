import { Platform } from 'react-native';

// Ayurvedic dosha-based color schemes
export const COLORS = {
  // Vata (Air & Space) - Blues and purples, calming
  vata: {
    100: '#E6EDFF',
    200: '#C4D5FF',
    300: '#9DB4FF',
    400: '#7A91F4',
    500: '#5C6CDE', // Primary Vata
    600: '#4A53C6',
    700: '#3B3E9A',
    800: '#2A2B69',
    900: '#1C1C3F',
  },
  
  // Pitta (Fire & Water) - Reds and oranges, energizing
  pitta: {
    100: '#FFEDE6',
    200: '#FFD2C3',
    300: '#FFAC9B',
    400: '#FF8878',
    500: '#F76553', // Primary Pitta
    600: '#DB4A3D',
    700: '#B0342C',
    800: '#832420',
    900: '#5E1816',
  },
  
  // Kapha (Earth & Water) - Greens and browns, grounding
  kapha: {
    100: '#E8F5ED',
    200: '#C7E7D5',
    300: '#9CD4B4',
    400: '#74BF95',
    500: '#4EA975', // Primary Kapha
    600: '#3A8D5A',
    700: '#2C7045',
    800: '#1F5330',
    900: '#153720',
  },
  
  // Neutral colors
  neutral: {
    50: '#F9F9FB',
    100: '#F3F3F6',
    200: '#E6E6EC',
    300: '#D1D1DB',
    400: '#A0A0B0',
    500: '#71717F',
    600: '#4B4B57',
    700: '#3A3A44',
    800: '#252530',
    900: '#17171D',
  },
  
  // Semantic colors
  success: '#22C55E',
  warning: '#FACC15',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export type ThemeMode = 'light' | 'dark';
export type DoshaType = 'vata' | 'pitta' | 'kapha';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    card: string;
    surface: string;
    text: string;
    subtext: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    pill: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  shadows: {
    sm: object;
    md: object;
    lg: object;
  };
}

// Function to generate theme based on dosha type and mode
export const generateTheme = (doshaType: DoshaType, mode: ThemeMode): Theme => {
  // Get primary color based on dosha
  const primaryColors = COLORS[doshaType];

  // Create theme based on mode and dosha
  const isDark = mode === 'dark';
  
  return {
    colors: {
      primary: primaryColors[500],
      secondary: isDark ? primaryColors[300] : primaryColors[700],
      background: isDark ? COLORS.neutral[900] : COLORS.white,
      card: isDark ? COLORS.neutral[800] : COLORS.neutral[50],
      surface: isDark ? COLORS.neutral[700] : COLORS.neutral[100],
      text: isDark ? COLORS.neutral[100] : COLORS.neutral[900],
      subtext: isDark ? COLORS.neutral[400] : COLORS.neutral[500],
      border: isDark ? COLORS.neutral[700] : COLORS.neutral[200],
      success: COLORS.success,
      warning: COLORS.warning,
      error: COLORS.error,
      info: COLORS.info,
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
      xxl: 48,
    },
    borderRadius: {
      sm: 4,
      md: 8,
      lg: 12,
      xl: 16,
      pill: 9999,
    },
    typography: {
      fontFamily: {
        regular: Platform.OS === 'ios' ? 'System' : 'Roboto',
        medium: Platform.OS === 'ios' ? 'System' : 'Roboto',
        bold: Platform.OS === 'ios' ? 'System' : 'Roboto',
      },
      fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
      },
      lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.8,
      },
    },
    shadows: {
      sm: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      md: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      },
      lg: {
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      },
    },
  };
};

// Default theme
export const defaultTheme = generateTheme('vata', 'light');