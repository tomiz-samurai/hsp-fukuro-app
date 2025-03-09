/**
 * Button Component
 * 
 * A customizable button component with HSP-friendly design that supports
 * various styles, states, and accessibility features.
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { useTheme } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';

// Button size types
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface
export interface ButtonProps {
  // Content
  label: string;
  icon?: React.ReactNode;
  
  // Styling
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  
  // States
  isLoading?: boolean;
  disabled?: boolean;
  
  // Events
  onPress?: () => void;
  onLongPress?: () => void;
  
  // Accessibility
  accessibilityLabel?: string;
  testID?: string;
  
  // Custom styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Haptic feedback
  hapticFeedback?: boolean;
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

// Button component
const Button: React.FC<ButtonProps> = ({
  // Content
  label,
  icon,
  
  // Styling
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  rounded = false,
  
  // States
  isLoading = false,
  disabled = false,
  
  // Events
  onPress,
  onLongPress,
  
  // Accessibility
  accessibilityLabel,
  testID,
  
  // Custom styling
  style,
  textStyle,
  
  // Haptic feedback
  hapticFeedback = true,
  hapticStyle = 'light',
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { hapticsEnabled, visualIntensity } = useAccessibilityStore();
  
  // Calculate opacity based on HSP visual intensity setting
  const getOpacity = (baseOpacity: number) => {
    return baseOpacity * (visualIntensity / 100);
  };
  
  // Handle press with optional haptic feedback
  const handlePress = () => {
    if (disabled || isLoading) return;
    
    // Provide haptic feedback if enabled
    if (hapticFeedback && hapticsEnabled) {
      switch (hapticStyle) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }
    }
    
    // Call the onPress handler
    onPress?.();
  };
  
  // Get button colors based on variant
  const getColors = () => {
    const colors = {
      background: theme.colors.primary,
      text: theme.colors.background,
      border: 'transparent',
    };
    
    switch (variant) {
      case 'primary':
        // Default
        break;
      case 'secondary':
        colors.background = theme.colors.secondary;
        colors.text = theme.colors.background;
        break;
      case 'outline':
        colors.background = 'transparent';
        colors.text = theme.colors.primary;
        colors.border = theme.colors.primary;
        break;
      case 'ghost':
        colors.background = 'transparent';
        colors.text = theme.colors.primary;
        colors.border = 'transparent';
        break;
      case 'link':
        colors.background = 'transparent';
        colors.text = theme.colors.primary;
        colors.border = 'transparent';
        break;
    }
    
    // Adjust for disabled state
    if (disabled) {
      colors.background = theme.colors.disabled;
      colors.text = theme.colors.surfaceVariant;
      colors.border = colors.background;
    }
    
    return colors;
  };
  
  // Get button dimensions based on size
  const getDimensions = () => {
    const dimensions = {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.fontSize.md,
    };
    
    switch (size) {
      case 'small':
        dimensions.paddingVertical = theme.spacing.xs;
        dimensions.paddingHorizontal = theme.spacing.sm;
        dimensions.fontSize = theme.typography.fontSize.sm;
        break;
      case 'medium':
        // Default
        break;
      case 'large':
        dimensions.paddingVertical = theme.spacing.md;
        dimensions.paddingHorizontal = theme.spacing.lg;
        dimensions.fontSize = theme.typography.fontSize.lg;
        break;
    }
    
    return dimensions;
  };
  
  // Get styles for the button
  const colors = getColors();
  const dimensions = getDimensions();
  
  const buttonStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: variant === 'outline' ? 1 : 0,
    borderRadius: rounded ? theme.radius.round : theme.radius.md,
    paddingVertical: dimensions.paddingVertical,
    paddingHorizontal: dimensions.paddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: getOpacity(disabled ? 0.7 : 1),
    width: fullWidth ? '100%' : undefined,
    ...theme.shadows.light,
  };
  
  const labelStyle: TextStyle = {
    color: colors.text,
    fontSize: dimensions.fontSize,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
    opacity: getOpacity(1),
  };
  
  return (
    <TouchableOpacity
      style={[buttonStyle, style]}
      onPress={handlePress}
      onLongPress={onLongPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy: isLoading }}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[labelStyle, icon ? { marginLeft: theme.spacing.sm } : {}, textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default Button;
