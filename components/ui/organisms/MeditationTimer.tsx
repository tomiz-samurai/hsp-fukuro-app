/**
 * MeditationTimer Component
 * 
 * A circular timer component for meditation sessions with HSP-friendly design.
 * Features smooth animations, gentle visual feedback, and accessibility options.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  ViewStyle,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Circle, G } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

import { H2, Body1 } from '@components/ui/atoms/Typography';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// Timer state types
export type TimerState = 'ready' | 'running' | 'paused' | 'finished';

// MeditationTimer props interface
interface MeditationTimerProps {
  // Duration in seconds
  duration: number;
  
  // State
  initialState?: TimerState;
  
  // Callbacks
  onStateChange?: (state: TimerState) => void;
  onTick?: (remainingSeconds: number) => void;
  onComplete?: () => void;
  
  // Styling
  size?: number;
  color?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  
  // Custom styling
  style?: ViewStyle;
  
  // Test ID
  testID?: string;
}

// MeditationTimer component
const MeditationTimer: React.FC<MeditationTimerProps> = ({
  // Duration
  duration,
  
  // State
  initialState = 'ready',
  
  // Callbacks
  onStateChange,
  onTick,
  onComplete,
  
  // Styling
  size = 200,
  color,
  backgroundColor,
  strokeWidth = 8,
  
  // Custom styling
  style,
  
  // Test ID
  testID,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity, hapticsEnabled, animationsEnabled } = useAccessibilityStore();
  
  // Timer state
  const [timerState, setTimerState] = useState<TimerState>(initialState);
  const [remainingSeconds, setRemainingSeconds] = useState(duration);
  
  // Animation refs
  const circleAnimatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnimatedValue = useRef(new Animated.Value(1)).current;
  const textOpacityValue = useRef(new Animated.Value(1)).current;
  
  // Timer interval ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Animation control refs
  const circleAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);
  
  // Default color values
  const timerColor = color || theme.colors.primary;
  const timerBackgroundColor = backgroundColor || theme.colors.surfaceVariant;
  
  // Calculate timer values
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Format remaining time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Start the timer
  const startTimer = () => {
    if (timerState === 'running') return;
    
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Update state
    setTimerState('running');
    onStateChange?.('running');
    
    // Start interval
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        onTick?.(newValue);
        
        // Check if timer completed
        if (newValue <= 0) {
          clearInterval(timerRef.current!);
          setTimerState('finished');
          onStateChange?.('finished');
          onComplete?.();
          
          // Haptic feedback on completion
          if (hapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
          
          return 0;
        }
        
        return newValue;
      });
    }, 1000);
    
    // Start animations
    startAnimations();
  };
  
  // Pause the timer
  const pauseTimer = () => {
    if (timerState !== 'running') return;
    
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Update state
    setTimerState('paused');
    onStateChange?.('paused');
    
    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Pause animations
    pauseAnimations();
  };
  
  // Reset the timer
  const resetTimer = () => {
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Update state
    setTimerState('ready');
    setRemainingSeconds(duration);
    onStateChange?.('ready');
    
    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset animations
    resetAnimations();
  };
  
  // Toggle timer (play/pause)
  const toggleTimer = () => {
    if (timerState === 'running') {
      pauseTimer();
    } else if (timerState === 'paused' || timerState === 'ready') {
      startTimer();
    } else if (timerState === 'finished') {
      resetTimer();
    }
  };
  
  // Start animations
  const startAnimations = () => {
    if (!animationsEnabled) return;
    
    // Progress circle animation
    circleAnimation.current = Animated.timing(circleAnimatedValue, {
      toValue: 1,
      duration: remainingSeconds * 1000,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    circleAnimation.current.start();
    
    // Pulse animation
    pulseAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimatedValue, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimatedValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.current.start();
  };
  
  // Pause animations
  const pauseAnimations = () => {
    if (!animationsEnabled) return;
    
    if (circleAnimation.current) {
      circleAnimation.current.stop();
    }
    
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
    }
  };
  
  // Reset animations
  const resetAnimations = () => {
    if (!animationsEnabled) return;
    
    // Reset values
    circleAnimatedValue.setValue(0);
    pulseAnimatedValue.setValue(1);
    
    // Stop existing animations
    if (circleAnimation.current) {
      circleAnimation.current.stop();
    }
    
    if (pulseAnimation.current) {
      pulseAnimation.current.stop();
    }
  };
  
  // Handle initial state
  useEffect(() => {
    if (initialState === 'running') {
      startTimer();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      resetAnimations();
    };
  }, []);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      resetAnimations();
    };
  }, []);
  
  // Map animated value to stroke dash offset
  const strokeDashoffset = circleAnimatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, circumference],
  });
  
  // Get button icon based on timer state
  const getButtonIcon = () => {
    switch (timerState) {
      case 'running':
        return 'pause';
      case 'paused':
      case 'ready':
        return 'play';
      case 'finished':
        return 'refresh';
      default:
        return 'play';
    }
  };
  
  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Timer */}
      <Animated.View
        style={[
          styles.timerContainer,
          { 
            width: size, 
            height: size,
            transform: [{ scale: pulseAnimatedValue }],
          },
        ]}
      >
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={styles.svg}
        >
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={timerBackgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
            opacity={visualIntensity / 100 * 0.3}
          />
          
          {/* Progress circle */}
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={timerColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              opacity={visualIntensity / 100}
            />
          </G>
        </Svg>
        
        {/* Time display */}
        <Animated.View
          style={[
            styles.timeDisplay,
            { opacity: textOpacityValue },
          ]}
        >
          <H2 style={styles.timeText}>
            {formatTime(remainingSeconds)}
          </H2>
          
          <Body1 
            style={[styles.stateText, timerState === 'finished' && styles.finishedText]}
          >
            {timerState === 'ready' && '開始する準備ができています'}
            {timerState === 'running' && '瞑想中...'}
            {timerState === 'paused' && '一時停止中'}
            {timerState === 'finished' && '完了しました'}
          </Body1>
        </Animated.View>
      </Animated.View>
      
      {/* Control button */}
      <TouchableOpacity
        style={[
          styles.controlButton,
          { backgroundColor: timerColor },
        ]}
        onPress={toggleTimer}
        activeOpacity={0.8}
      >
        <Ionicons
          name={getButtonIcon()}
          size={24}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

// Animated Circle for SVG
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  timeDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    marginBottom: 8,
  },
  stateText: {
    opacity: 0.8,
  },
  finishedText: {
    fontFamily: 'NotoSansJP-Medium',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
});

export default MeditationTimer;
