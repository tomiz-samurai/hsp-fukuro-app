/**
 * SafeAreaWrapper Component
 * 
 * A wrapper component that handles safe area insets consistently
 * across the app with HSP-friendly styling options.
 */

import React from 'react';
import { StyleSheet, View, ViewStyle, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';
import { useThemeStore } from '@store/slices/uiSlice';

// SafeAreaWrapper props interface
export interface SafeAreaWrapperProps {
  // Content
  children: React.ReactNode;
  
  // Styling
  backgroundColor?: string;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  ignoreSafeArea?: boolean;
  
  // Status bar
  statusBarStyle?: 'dark-content' | 'light-content' | 'auto';
  statusBarColor?: string;
  hideStatusBar?: boolean;
  
  // Custom styling
  style?: ViewStyle;
  
  // Test ID
  testID?: string;
}

// SafeAreaWrapper component
const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  // Content
  children,
  
  // Styling
  backgroundColor,
  edges = ['top', 'right', 'bottom', 'left'],
  ignoreSafeArea = false,
  
  // Status bar
  statusBarStyle,
  statusBarColor,
  hideStatusBar = false,
  
  // Custom styling
  style,
  
  // Test ID
  testID,
}) => {
  // Theme
  const theme = useTheme() as AppTheme;
  const { isDarkTheme } = useThemeStore();
  
  // Determine background color
  const bgColor = backgroundColor || theme.colors.background;
  
  // Determine status bar style
  const determineStatusBarStyle = (): 'dark-content' | 'light-content' => {
    if (statusBarStyle === 'auto') {
      return isDarkTheme ? 'light-content' : 'dark-content';
    }
    return statusBarStyle || (isDarkTheme ? 'light-content' : 'dark-content');
  };
  
  // Container style
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: bgColor,
  };
  
  // If ignoring safe area, return a simple View
  if (ignoreSafeArea) {
    return (
      <View style={[containerStyle, style]} testID={testID}>
        <StatusBar
          barStyle={determineStatusBarStyle()}
          backgroundColor={statusBarColor || bgColor}
          hidden={hideStatusBar}
          translucent={Platform.OS === 'android'}
        />
        {children}
      </View>
    );
  }
  
  // Return SafeAreaView with proper configuration
  return (
    <SafeAreaView
      style={[containerStyle, style]}
      edges={edges}
      testID={testID}
    >
      <StatusBar
        barStyle={determineStatusBarStyle()}
        backgroundColor={statusBarColor || bgColor}
        hidden={hideStatusBar}
        translucent={Platform.OS === 'android'}
      />
      {children}
    </SafeAreaView>
  );
};

export default SafeAreaWrapper;
