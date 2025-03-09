/**
 * Input Component
 * 
 * A customizable text input component with HSP-friendly design features
 * including gentle transitions, proper contrast, and accessibility support.
 */

import React, { useState, forwardRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextStyle, 
  ViewStyle, 
  TextInputProps, 
  Platform,
  Animated,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { Caption, Body2 } from './Typography';

// Input variant types
export type InputVariant = 'outlined' | 'filled' | 'underlined';

// Input props interface
export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Label and help text
  label?: string;
  helperText?: string;
  error?: string;
  
  // Styling
  variant?: InputVariant;
  rounded?: boolean;
  fullWidth?: boolean;
  
  // States
  disabled?: boolean;
  
  // Custom styling
  containerStyle?: ViewStyle;
  style?: TextStyle;
  labelStyle?: TextStyle;
  helperTextStyle?: TextStyle;
  errorTextStyle?: TextStyle;
  
  // Leading and trailing icons/elements
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Focus handling
  onFocusChange?: (isFocused: boolean) => void;
}

// Input component
const Input = forwardRef<TextInput, InputProps>(({
  // Label and help text
  label,
  helperText,
  error,
  
  // Styling
  variant = 'outlined',
  rounded = true,
  fullWidth = false,
  
  // States
  disabled = false,
  
  // Custom styling
  containerStyle,
  style,
  labelStyle,
  helperTextStyle,
  errorTextStyle,
  
  // Leading and trailing icons/elements
  leftIcon,
  rightIcon,
  
  // Focus handling
  onFocusChange,
  
  // TextInput props
  placeholder,
  value,
  onChangeText,
  onFocus,
  onBlur,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  multiline,
  numberOfLines,
  maxLength,
  returnKeyType,
  onSubmitEditing,
  blurOnSubmit,
  testID,
  ...rest
}, ref) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  
  // State for focus
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));
  
  // Helper functions for styling
  const getBorderRadius = () => {
    return rounded ? theme.radius.md : theme.radius.sm;
  };
  
  // Adjust visual intensity based on HSP needs
  const getOpacity = (baseOpacity: number) => {
    return baseOpacity * (visualIntensity / 100);
  };
  
  // Handle focus state changes
  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocusChange?.(true);
    onFocus?.(e);
    
    // Animate focus effect
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  const handleBlur = (e: any) => {
    setIsFocused(false);
    onFocusChange?.(false);
    onBlur?.(e);
    
    // Animate blur effect
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };
  
  // Get container style based on variant
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: fullWidth ? '100%' : undefined,
    };
    
    const focusBorderColor = error 
      ? theme.colors.error 
      : theme.colors.primary;
    
    const defaultBorderColor = error 
      ? `rgba(${parseInt(theme.colors.error.slice(1, 3), 16)}, ${parseInt(theme.colors.error.slice(3, 5), 16)}, ${parseInt(theme.colors.error.slice(5, 7), 16)}, 0.5)` 
      : theme.colors.surfaceVariant;
    
    // Interpolate border color for smooth transition
    const borderColor = focusAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [defaultBorderColor, focusBorderColor],
    });
    
    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor,
          borderRadius: getBorderRadius(),
          backgroundColor: 'transparent',
        };
      
      case 'filled':
        return {
          ...baseStyle,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor,
          borderRadius: getBorderRadius(),
          backgroundColor: theme.colors.surfaceVariant,
        };
      
      case 'underlined':
        return {
          ...baseStyle,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor,
          borderRadius: 0,
          backgroundColor: 'transparent',
        };
      
      default:
        return baseStyle;
    }
  };
  
  // Get input style
  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: disabled ? theme.colors.disabled : theme.colors.text,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSize.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: variant === 'underlined' ? theme.spacing.sm : theme.spacing.md,
      opacity: disabled ? getOpacity(0.6) : getOpacity(1),
    };
    
    if (multiline) {
      return {
        ...baseStyle,
        textAlignVertical: 'top',
        minHeight: numberOfLines ? numberOfLines * 20 : 80,
      };
    }
    
    return baseStyle;
  };
  
  return (
    <View style={[styles.root, containerStyle]}>
      {/* Label */}
      {label && (
        <Body2
          style={[
            styles.label,
            { 
              color: error 
                ? theme.colors.error 
                : (isFocused ? theme.colors.primary : theme.colors.textSecondary) 
            },
            labelStyle,
          ]}
        >
          {label}
        </Body2>
      )}
      
      {/* Input container */}
      <Animated.View style={[styles.inputContainer, getContainerStyle()]}>
        {/* Left icon */}
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        {/* Input field */}
        <TextInput
          ref={ref}
          style={[getInputStyle(), style]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit ?? !multiline}
          editable={!disabled}
          placeholderTextColor={theme.colors.placeholder}
          testID={testID}
          selectionColor={theme.colors.primary}
          {...rest}
        />
        
        {/* Right icon */}
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </Animated.View>
      
      {/* Helper text or error message */}
      {(helperText || error) && (
        <Caption
          style={[
            styles.helperText,
            { color: error ? theme.colors.error : theme.colors.textSecondary },
            error ? errorTextStyle : helperTextStyle,
          ]}
        >
          {error || helperText}
        </Caption>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  leftIconContainer: {
    paddingLeft: 12,
  },
  rightIconContainer: {
    paddingRight: 12,
  },
  helperText: {
    marginTop: 4,
  },
});

export default Input;
