/**
 * Toast Component
 * 
 * A gentle notification toast component with HSP-friendly design.
 * Supports different types of notifications with appropriate styling.
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Dimensions,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body1 } from '@components/ui/atoms/Typography';
import { useToastStore, ToastType } from '@store/slices/uiSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';
import { TIMING } from '@config/constants';

// Get screen dimensions
const { width } = Dimensions.get('window');

// Toast props interface
interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onDismiss: (id: string) => void;
}

// Toast component
const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  duration = TIMING.AUTO_DISMISS_TOAST,
  onDismiss,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  const insets = useSafeAreaInsets();
  
  // Animation values
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Dismiss timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto-dismiss after duration
  useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      handleDismiss();
    }, duration);
    
    // Clean up
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Handle dismiss
  const handleDismiss = () => {
    // Hide animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss(id);
    });
  };
  
  // Get icon based on toast type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  };
  
  // Get colors based on toast type
  const getColors = () => {
    const baseColors = {
      iconColor: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    };
    
    switch (type) {
      case 'success':
        return {
          iconColor: theme.colors.success,
          backgroundColor: `rgba(${parseInt(theme.colors.success.slice(1, 3), 16)}, ${parseInt(theme.colors.success.slice(3, 5), 16)}, ${parseInt(theme.colors.success.slice(5, 7), 16)}, 0.15)`,
        };
      case 'error':
        return {
          iconColor: theme.colors.error,
          backgroundColor: `rgba(${parseInt(theme.colors.error.slice(1, 3), 16)}, ${parseInt(theme.colors.error.slice(3, 5), 16)}, ${parseInt(theme.colors.error.slice(5, 7), 16)}, 0.15)`,
        };
      case 'warning':
        return {
          iconColor: theme.colors.warning,
          backgroundColor: `rgba(${parseInt(theme.colors.warning.slice(1, 3), 16)}, ${parseInt(theme.colors.warning.slice(3, 5), 16)}, ${parseInt(theme.colors.warning.slice(5, 7), 16)}, 0.15)`,
        };
      case 'info':
      default:
        return {
          iconColor: theme.colors.info,
          backgroundColor: `rgba(${parseInt(theme.colors.info.slice(1, 3), 16)}, ${parseInt(theme.colors.info.slice(3, 5), 16)}, ${parseInt(theme.colors.info.slice(5, 7), 16)}, 0.15)`,
        };
    }
  };
  
  // Get colors
  const { iconColor, backgroundColor } = getColors();
  
  return (
    <Animated.View
      style={[
        styles.container,
        { 
          transform: [{ translateY }],
          opacity, 
          marginTop: insets.top,
        },
      ]}
    >
      <BlurView
        style={styles.blurView}
        intensity={10 * visualIntensity / 100}
        tint="light"
      >
        <View 
          style={[
            styles.toastContainer,
            { backgroundColor },
          ]}
        >
          <View style={styles.contentContainer}>
            <Ionicons name={getIcon()} size={24} color={iconColor} style={styles.icon} />
            <Body1 style={styles.message}>{message}</Body1>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
};

// ToastContainer component that manages multiple toasts
export const ToastContainer: React.FC = () => {
  // Get toasts from store
  const { toasts, hideToast } = useToastStore();
  
  // No toasts to show
  if (toasts.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.toastsWrapper} pointerEvents="box-none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onDismiss={hideToast}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  toastsWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  container: {
    alignSelf: 'center',
    width: width - 32,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  blurView: {
    borderRadius: 8,
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});

export default Toast;
