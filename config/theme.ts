/**
 * Theme Configuration
 * 
 * This file defines the theme settings for the application,
 * including colors, typography, spacing, and other visual styles.
 * It follows HSP-friendly design principles with low visual stimulation.
 */

import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Type definitions for our theme
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  notification: string;
  error: string;
  info: string;
  success: string;
  warning: string;
}

export interface ThemeTypography {
  fontFamily: {
    regular: string;
    medium: string;
    light: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeRadius {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  round: number;
}

export interface ThemeShadows {
  light: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  heavy: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface AppTheme extends MD3Theme {
  colors: MD3Theme['colors'] & ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  shadows: ThemeShadows;
}

// Default light theme colors from requirements spec
const lightColors: ThemeColors = {
  primary: '#62A5BF',      // Calm blue
  secondary: '#9B7E6B',    // Earth color
  accent: '#F4A261',       // Soft orange
  background: '#F8F3E6',   // Off-white
  surface: '#FFFFFF',
  surfaceVariant: '#EFEAE0',
  text: '#2C3E50',         // Dark blue for text
  textSecondary: '#5D6D7E',
  disabled: '#A9B2BD',
  placeholder: '#B8C1CD',
  backdrop: 'rgba(44, 62, 80, 0.15)',
  notification: '#62A5BF',
  error: '#E57373',        // Soft red
  info: '#90CAF9',         // Soft blue
  success: '#7FB685',      // Soft green
  warning: '#EFC88B',      // Soft yellow
};

// Dark theme colors - gentler on the eyes for HSP users
const darkColors: ThemeColors = {
  primary: '#5D99B3',      // Slightly darker calm blue
  secondary: '#8C7262',    // Darker earth color
  accent: '#E29352',       // Darker soft orange
  background: '#2D2D2D',   // Soft dark background (not pure black)
  surface: '#3A3A3A',
  surfaceVariant: '#454545',
  text: '#E0E0E0',         // Off-white for text
  textSecondary: '#B0B0B0',
  disabled: '#6A6A6A',
  placeholder: '#808080',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  notification: '#5D99B3',
  error: '#CF6679',        // Softer red for dark mode
  info: '#82B1FF',         // Softer blue for dark mode
  success: '#76B887',      // Softer green for dark mode
  warning: '#DFBA74',      // Softer yellow for dark mode
};

// Typography settings
const typography: ThemeTypography = {
  fontFamily: {
    regular: 'NotoSansJP-Regular',
    medium: 'NotoSansJP-Medium',
    light: 'NotoSansJP-Light',
  },
  fontSize: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 26,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Spacing system
const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
const radius: ThemeRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Shadow styles - very subtle for HSP users
const shadows: ThemeShadows = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 2.5,
    elevation: 2,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 3.5,
    elevation: 3,
  },
};

// React Native Paper font configuration
const fontConfig = {
  fontFamily: typography.fontFamily.regular,
};

// Create the light theme
export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...lightColors,
  },
  typography,
  spacing,
  radius,
  shadows,
  fonts: configureFonts({ config: fontConfig }),
};

// Create the dark theme with the same structure
export const darkTheme: AppTheme = {
  ...MD3LightTheme,
  dark: true,
  mode: 'adaptive',
  colors: {
    ...MD3LightTheme.colors,
    ...darkColors,
  },
  typography,
  spacing,
  radius,
  shadows,
  fonts: configureFonts({ config: fontConfig }),
};

export default { light: lightTheme, dark: darkTheme };
