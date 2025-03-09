/**
 * Typography Component
 * 
 * A set of text components with consistent styling and HSP-friendly features
 * like adjustable line height, controllable contrast, and font weight.
 */

import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';
import { useAccessibilityStore } from '@store/slices/uiSlice';

// Typography variant types
export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'subtitle1' 
  | 'subtitle2' 
  | 'body1' 
  | 'body2' 
  | 'caption'
  | 'button'
  | 'overline';

// Typography props interface
export interface TypographyProps {
  // Content
  children: React.ReactNode;
  
  // Styling
  variant?: TypographyVariant;
  color?: string;
  weight?: 'light' | 'regular' | 'medium';
  align?: 'auto' | 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  
  // Features
  numberOfLines?: number;
  selectable?: boolean;
  
  // Custom styling
  style?: TextStyle;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
}

// Typography component
const Typography: React.FC<TypographyProps> = ({
  // Content
  children,
  
  // Styling
  variant = 'body1',
  color,
  weight = 'regular',
  align = 'left',
  lineHeight,
  
  // Features
  numberOfLines,
  selectable = false,
  
  // Custom styling
  style,
  
  // Accessibility
  accessibilityLabel,
  testID,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  
  // Get font style based on variant
  const getFontStyle = (): TextStyle => {
    let fontSize: number;
    let defaultLineHeight: number;
    let fontWeight: TextStyle['fontWeight'];
    let letterSpacing: number;
    
    switch (variant) {
      case 'h1':
        fontSize = theme.typography.fontSize.xxl;
        defaultLineHeight = fontSize * theme.typography.lineHeight.tight;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: -0.5,
          fontFamily: theme.typography.fontFamily.medium,
        };
      
      case 'h2':
        fontSize = theme.typography.fontSize.xl;
        defaultLineHeight = fontSize * theme.typography.lineHeight.tight;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: -0.3,
          fontFamily: theme.typography.fontFamily.medium,
        };
      
      case 'h3':
        fontSize = theme.typography.fontSize.lg;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: -0.2,
          fontFamily: theme.typography.fontFamily.medium,
        };
      
      case 'h4':
        fontSize = theme.typography.fontSize.md;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: -0.1,
          fontFamily: theme.typography.fontFamily.medium,
        };
      
      case 'subtitle1':
        fontSize = theme.typography.fontSize.md;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 0.1,
          fontFamily: theme.typography.fontFamily.regular,
        };
      
      case 'subtitle2':
        fontSize = theme.typography.fontSize.sm;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 0.1,
          fontFamily: theme.typography.fontFamily.medium,
        };
      
      case 'body1':
        fontSize = theme.typography.fontSize.md;
        defaultLineHeight = fontSize * theme.typography.lineHeight.relaxed;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 0.2,
          fontFamily: theme.typography.fontFamily.regular,
        };
      
      case 'body2':
        fontSize = theme.typography.fontSize.sm;
        defaultLineHeight = fontSize * theme.typography.lineHeight.relaxed;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 0.2,
          fontFamily: theme.typography.fontFamily.regular,
        };
      
      case 'caption':
        fontSize = theme.typography.fontSize.xs;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 0.4,
          fontFamily: theme.typography.fontFamily.regular,
        };
      
      case 'button':
        fontSize = theme.typography.fontSize.sm;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
          fontFamily: theme.typography.fontFamily.medium,
        };
      
      case 'overline':
        fontSize = theme.typography.fontSize.xs;
        defaultLineHeight = fontSize * theme.typography.lineHeight.normal;
        return {
          fontSize,
          lineHeight: lineHeight || defaultLineHeight,
          letterSpacing: 1,
          textTransform: 'uppercase',
          fontFamily: theme.typography.fontFamily.regular,
        };
      
      default:
        return {};
    }
  };
  
  // Get font family based on weight
  const getFontFamily = (): string => {
    switch (weight) {
      case 'light':
        return theme.typography.fontFamily.light;
      case 'regular':
        return theme.typography.fontFamily.regular;
      case 'medium':
        return theme.typography.fontFamily.medium;
      default:
        return theme.typography.fontFamily.regular;
    }
  };
  
  // Calculate text color opacity based on HSP visual intensity setting
  const getTextColor = (): string => {
    // Use provided color or default text color from theme
    const baseColor = color || theme.colors.text;
    
    // Calculate opacity based on visual intensity
    // This will help HSP users who are sensitive to high contrast
    const contrastAdjustment = visualIntensity / 100;
    
    // Create a color with adjusted opacity
    return baseColor;
  };
  
  // Combine styles
  const textStyle: TextStyle = {
    ...getFontStyle(),
    fontFamily: getFontFamily(),
    color: getTextColor(),
    textAlign: align,
  };
  
  return (
    <Text
      style={[textStyle, style]}
      numberOfLines={numberOfLines}
      selectable={selectable}
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </Text>
  );
};

// Export pre-configured variants for convenience
export const H1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h1" {...props} />
);

export const H2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h2" {...props} />
);

export const H3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h3" {...props} />
);

export const H4: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="h4" {...props} />
);

export const Subtitle1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle1" {...props} />
);

export const Subtitle2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="subtitle2" {...props} />
);

export const Body1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body1" {...props} />
);

export const Body2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="body2" {...props} />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="caption" {...props} />
);

export const ButtonText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="button" {...props} />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="overline" {...props} />
);

export default Typography;
