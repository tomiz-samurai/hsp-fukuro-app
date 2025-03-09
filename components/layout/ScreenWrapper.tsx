/**
 * ScreenWrapper Component
 * 
 * A wrapper component for screens that provides consistent layout,
 * with options for headers, loading states, and HSP-friendly styling.
 */

import React from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle, 
  ScrollView, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';
import SafeAreaWrapper from './SafeAreaWrapper';
import { H2 } from '@components/ui/atoms/Typography';

// ScreenWrapper props interface
export interface ScreenWrapperProps {
  // Content
  children: React.ReactNode;
  
  // Header
  title?: string;
  headerRight?: React.ReactNode;
  hideHeader?: boolean;
  
  // Layout
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  // State
  isLoading?: boolean;
  loadingText?: string;
  
  // Background
  backgroundColor?: string;
  
  // Safe area
  safeAreaProps?: {
    edges?: ('top' | 'right' | 'bottom' | 'left')[];
    statusBarStyle?: 'dark-content' | 'light-content' | 'auto';
    statusBarColor?: string;
    hideStatusBar?: boolean;
  };
  
  // Custom styling
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  
  // Test ID
  testID?: string;
}

// ScreenWrapper component
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  // Content
  children,
  
  // Header
  title,
  headerRight,
  hideHeader = false,
  
  // Layout
  scrollable = false,
  keyboardAvoiding = true,
  padding = 'medium',
  
  // State
  isLoading = false,
  loadingText,
  
  // Background
  backgroundColor,
  
  // Safe area
  safeAreaProps,
  
  // Custom styling
  style,
  contentContainerStyle,
  
  // Test ID
  testID,
}) => {
  // Theme
  const theme = useTheme() as AppTheme;
  
  // Get padding value based on preference
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
  
  // Determine content container style
  const contentStyle: ViewStyle = {
    padding: getPadding(),
    flex: 1,
  };
  
  // Render header if not hidden
  const renderHeader = () => {
    if (hideHeader) return null;
    
    return (
      <View style={styles.header}>
        {title && (
          <View style={styles.titleContainer}>
            <H2>{title}</H2>
          </View>
        )}
        {headerRight && (
          <View style={styles.headerRight}>
            {headerRight}
          </View>
        )}
      </View>
    );
  };
  
  // Render loading indicator when loading
  const renderLoading = () => {
    if (!isLoading) return null;
    
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {loadingText && <H2 style={styles.loadingText}>{loadingText}</H2>}
      </View>
    );
  };
  
  // Render content based on props
  const renderContent = () => {
    // Base content with padding
    const content = (
      <View style={[contentStyle, contentContainerStyle]}>
        {renderHeader()}
        {isLoading ? renderLoading() : children}
      </View>
    );
    
    // If scrollable, wrap in ScrollView
    if (scrollable) {
      return (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      );
    }
    
    return content;
  };
  
  // Wrap in KeyboardAvoidingView if needed
  const renderWithKeyboardAvoidance = () => {
    if (keyboardAvoiding && Platform.OS === 'ios') {
      return (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior="padding"
          keyboardVerticalOffset={-200} // Avoid excessive shifting
        >
          {renderContent()}
        </KeyboardAvoidingView>
      );
    }
    
    return renderContent();
  };
  
  // Final render with SafeAreaWrapper
  return (
    <SafeAreaWrapper
      backgroundColor={backgroundColor}
      style={[styles.container, style]}
      testID={testID}
      {...safeAreaProps}
    >
      {renderWithKeyboardAvoidance()}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
});

export default ScreenWrapper;
