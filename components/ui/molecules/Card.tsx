/**
 * Card Component
 * 
 * A customizable card component with HSP-friendly design features
 * like gentle shadows, rounded corners, and adjustable visual intensity.
 */

import React from 'react';
import { 
  View, 
  StyleSheet, 
  ViewStyle, 
  TouchableOpacity, 
  StyleProp 
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { H3, Body1 } from '@components/ui/atoms/Typography';

// Card props interface
export interface CardProps {
  // Content
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  
  // Styling
  elevation?: 'none' | 'low' | 'medium' | 'high';
  rounded?: boolean;
  bordered?: boolean;
  backgroundColor?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  // Layout
  fullWidth?: boolean;
  
  // Interaction
  onPress?: () => void;
  
  // Custom styling
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  
  // Test ID
  testID?: string;
}

// Card component
const Card: React.FC<CardProps> = ({
  // Content
  children,
  title,
  subtitle,
  
  // Styling
  elevation = 'low',
  rounded = true,
  bordered = false,
  backgroundColor,
  padding = 'medium',
  
  // Layout
  fullWidth = false,
  
  // Interaction
  onPress,
  
  // Custom styling
  style,
  contentStyle,
  
  // Test ID
  testID,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  
  // Calculate shadow opacity based on HSP visual intensity setting
  const getShadowOpacity = (baseOpacity: number): number => {
    return baseOpacity * (visualIntensity / 100);
  };
  
  // Get border radius based on preference
  const getBorderRadius = (): number => {
    return rounded ? theme.radius.lg : theme.radius.sm;
  };
  
  // Get padding based on preference
  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return theme.spacing.sm;
      case 'medium':
        return theme.spacing.md;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  };
  
  // Get shadow style based on elevation
  const getShadowStyle = (): ViewStyle => {
    switch (elevation) {
      case 'none':
        return {};
      case 'low':
        return {
          ...theme.shadows.light,
          shadowOpacity: getShadowOpacity(theme.shadows.light.shadowOpacity),
        };
      case 'medium':
        return {
          ...theme.shadows.medium,
          shadowOpacity: getShadowOpacity(theme.shadows.medium.shadowOpacity),
        };
      case 'high':
        return {
          ...theme.shadows.heavy,
          shadowOpacity: getShadowOpacity(theme.shadows.heavy.shadowOpacity),
        };
      default:
        return {
          ...theme.shadows.light,
          shadowOpacity: getShadowOpacity(theme.shadows.light.shadowOpacity),
        };
    }
  };
  
  // Card container style
  const containerStyle: ViewStyle = {
    backgroundColor: backgroundColor || theme.colors.surface,
    borderRadius: getBorderRadius(),
    borderWidth: bordered ? 1 : 0,
    borderColor: bordered ? theme.colors.surfaceVariant : 'transparent',
    width: fullWidth ? '100%' : undefined,
    overflow: 'hidden',
    ...getShadowStyle(),
  };
  
  // Content container style
  const innerContentStyle: ViewStyle = {
    padding: getPadding(),
  };
  
  // Render card with or without touchable capabilities
  const CardContent = () => (
    <View style={[containerStyle, style]} testID={testID}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <H3>{title}</H3>}
          {subtitle && <Body1 color={theme.colors.textSecondary}>{subtitle}</Body1>}
        </View>
      )}
      <View style={[innerContentStyle, contentStyle]}>
        {children}
      </View>
    </View>
  );
  
  // If onPress is provided, wrap with TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={onPress}
        accessibilityRole="button"
      >
        <CardContent />
      </TouchableOpacity>
    );
  }
  
  // Otherwise return static card
  return <CardContent />;
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});

export default Card;
