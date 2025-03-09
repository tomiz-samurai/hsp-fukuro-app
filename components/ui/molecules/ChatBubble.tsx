/**
 * ChatBubble Component
 * 
 * A message bubble component for chat interfaces with HSP-friendly design.
 * Supports both user and AI messages with appropriate styling.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Body1 } from '@components/ui/atoms/Typography';
import { AppTheme } from '@config/theme';
import { useAccessibilityStore } from '@store/slices/uiSlice';

// ChatBubble props interface
export interface ChatBubbleProps {
  // Content
  message: string;
  
  // Styling
  isUser: boolean;
  showAvatar?: boolean;
  avatar?: React.ReactNode;
  
  // Interaction
  onPress?: () => void;
  onLongPress?: () => void;
  
  // Time
  timestamp?: string;
  
  // Status
  isTyping?: boolean;
  
  // Custom styling
  style?: ViewStyle;
  
  // Test ID
  testID?: string;
}

// ChatBubble component
const ChatBubble: React.FC<ChatBubbleProps> = ({
  // Content
  message,
  
  // Styling
  isUser,
  showAvatar = true,
  avatar,
  
  // Interaction
  onPress,
  onLongPress,
  
  // Time
  timestamp,
  
  // Status
  isTyping = false,
  
  // Custom styling
  style,
  
  // Test ID
  testID,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  
  // Adjust shadow opacity based on HSP visual intensity
  const getShadowOpacity = () => {
    return (visualIntensity / 100) * 0.1; // Very subtle shadow
  };
  
  // Get bubble style based on sender
  const getBubbleStyle = (): ViewStyle => {
    if (isUser) {
      return {
        backgroundColor: theme.colors.primary,
        marginLeft: 'auto',
        marginRight: showAvatar ? 8 : 0,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 20,
        shadowOpacity: getShadowOpacity(),
      };
    } else {
      return {
        backgroundColor: theme.colors.surfaceVariant,
        marginRight: 'auto',
        marginLeft: showAvatar ? 8 : 0,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderTopLeftRadius: 4,
        shadowOpacity: getShadowOpacity(),
      };
    }
  };
  
  // Get text color based on sender
  const getTextColor = () => {
    return isUser ? theme.colors.background : theme.colors.text;
  };
  
  // Render bubble content
  const renderContent = () => (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {/* AI Avatar (only show for AI messages) */}
      {!isUser && showAvatar && (
        <View style={styles.avatarContainer}>
          {avatar || (
            <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.primary }]}>
              <Body1 style={{ color: theme.colors.background }}>ミ</Body1>
            </View>
          )}
        </View>
      )}
      
      {/* Message Bubble */}
      <View style={[styles.bubble, getBubbleStyle(), style]}>
        <Body1 
          style={[styles.message, { color: getTextColor() }]}
          selectable
        >
          {isTyping ? '...' : message}
        </Body1>
        
        {/* Timestamp (if provided) */}
        {timestamp && (
          <Body1 
            style={[
              styles.timestamp, 
              { color: isUser ? `${theme.colors.background}99` : `${theme.colors.text}99` }
            ]}
          >
            {timestamp}
          </Body1>
        )}
      </View>
      
      {/* User Avatar (only show for user messages) */}
      {isUser && showAvatar && (
        <View style={styles.avatarContainer}>
          {avatar || (
            <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.secondary }]}>
              <Body1 style={{ color: theme.colors.background }}>ユ</Body1>
            </View>
          )}
        </View>
      )}
    </View>
  );
  
  // If onPress or onLongPress is provided, wrap with TouchableOpacity
  if (onPress || onLongPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        onLongPress={onLongPress}
        testID={testID}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  // Otherwise return static bubble
  return <View testID={testID}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    marginBottom: 4,
  },
  defaultAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '70%',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  message: {
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ChatBubble;
