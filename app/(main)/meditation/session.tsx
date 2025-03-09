/**
 * Meditation Session Screen
 * 
 * Provides an active meditation session with timer, audio playback,
 * and an HSP-friendly serene environment.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ImageBackground, 
  TouchableOpacity, 
  BackHandler,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import MeditationTimer, { TimerState } from '@components/ui/organisms/MeditationTimer';
import Card from '@components/ui/molecules/Card';
import { H2, H3, Body1, Body2 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { MeditationService, Meditation } from '@services/meditation.service';
import { SoundService } from '@services/sound.service';
import { AppTheme } from '@config/theme';

// Meditation session screen component
export default function MeditationSessionScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const insets = useSafeAreaInsets();
  
  // Get meditation ID from params
  const meditationId = params.id as string;
  
  // State
  const [meditation, setMeditation] = useState<Meditation | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerState, setTimerState] = useState<TimerState>('ready');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [soundLoaded, setSoundLoaded] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [showControls, setShowControls] = useState(true);
  const [completed, setCompleted] = useState(false);
  
  // Audio refs
  const sound = useRef<Audio.Sound | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Load meditation data
  useEffect(() => {
    // Allow landscape orientation
    ScreenOrientation.unlockAsync();
    
    // Load meditation
    loadMeditation();
    
    // Set up back button handler
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    // Set up audio mode for background playback
    setupAudioMode();
    
    return () => {
      // Reset to portrait orientation
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      
      // Clean up
      backHandler.remove();
      
      // Unload sound
      unloadSound();
      
      // Clear control timeout
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // Set up audio mode for background playback
  const setupAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.InterruptionModeIOS.DuckOthers,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  };
  
  // Load meditation data
  const loadMeditation = async () => {
    try {
      setLoading(true);
      
      // Get meditation data
      const meditationData = await MeditationService.getMeditationById(meditationId, isPremium);
      
      if (!meditationData) {
        // Meditation not found or not accessible
        setLoading(false);
        Alert.alert(
          'エラー',
          '瞑想データの取得に失敗しました。',
          [{ text: '戻る', onPress: () => router.back() }]
        );
        return;
      }
      
      // Set meditation data
      setMeditation(meditationData);
      
      // Set initial timer duration
      setRemainingSeconds(meditationData.durationMinutes * 60);
      
      // Load audio
      await loadSound('meditations/meditation-sound.mp3');
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading meditation:', error);
      setLoading(false);
      
      Alert.alert(
        'エラー',
        '瞑想データの取得に失敗しました。',
        [{ text: '戻る', onPress: () => router.back() }]
      );
    }
  };
  
  // Load audio file
  const loadSound = async (audioUri: string) => {
    try {
      // Use hardcoded audio for demo
      const { sound: audioSound } = await Audio.Sound.createAsync(
        require('@assets/sounds/meditation-sound.mp3'),
        {
          isLooping: true,
          volume: volume,
          progressUpdateIntervalMillis: 1000,
        },
        onPlaybackStatusUpdate
      );
      
      sound.current = audioSound;
      setSoundLoaded(true);
      setSoundError(false);
    } catch (error) {
      console.error('Error loading sound:', error);
      setSoundLoaded(false);
      setSoundError(true);
    }
  };
  
  // Unload sound
  const unloadSound = async () => {
    try {
      if (sound.current) {
        await sound.current.unloadAsync();
        sound.current = null;
      }
    } catch (error) {
      console.error('Error unloading sound:', error);
    }
  };
  
  // Audio playback status update handler
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    
    // Handle playback status updates if needed
  };
  
  // Handle back button press
  const handleBackPress = () => {
    // If timer is running, confirm exit
    if (timerState === 'running') {
      Alert.alert(
        '終了の確認',
        '瞑想セッションを終了しますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '終了', onPress: () => router.back() },
        ]
      );
      return true;
    }
    
    // Otherwise, just go back
    router.back();
    return true;
  };
  
  // Handle timer state change
  const handleTimerStateChange = async (state: TimerState) => {
    setTimerState(state);
    
    // Handle different states
    switch (state) {
      case 'running':
        // Start playback
        if (sound.current && soundLoaded) {
          try {
            await sound.current.playAsync();
          } catch (error) {
            console.error('Error playing sound:', error);
          }
        }
        
        // Auto-hide controls after 3 seconds
        resetControlsTimeout();
        break;
        
      case 'paused':
        // Pause playback
        if (sound.current) {
          try {
            await sound.current.pauseAsync();
          } catch (error) {
            console.error('Error pausing sound:', error);
          }
        }
        
        // Show controls
        setShowControls(true);
        
        // Clear timeout
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        break;
        
      case 'finished':
        // Complete session
        setCompleted(true);
        
        // Stop playback
        if (sound.current) {
          try {
            await sound.current.stopAsync();
          } catch (error) {
            console.error('Error stopping sound:', error);
          }
        }
        
        // Show controls
        setShowControls(true);
        
        // Clear timeout
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        
        // Record completion
        if (user?.id && meditation) {
          try {
            await MeditationService.recordMeditationSession({
              user_id: user.id,
              duration: meditation.durationMinutes,
              session_type: meditation.type,
              completed: true,
              notes: null,
              mood_before: null,
              mood_after: null,
            });
          } catch (error) {
            console.error('Error recording meditation session:', error);
          }
        }
        
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        break;
        
      default:
        break;
    }
  };
  
  // Handle timer tick
  const handleTimerTick = (seconds: number) => {
    setRemainingSeconds(seconds);
  };
  
  // Handle volume change
  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    
    if (sound.current) {
      try {
        await sound.current.setVolumeAsync(newVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };
  
  // Reset controls timeout
  const resetControlsTimeout = () => {
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    // Set new timeout to hide controls
    controlsTimeoutRef.current = setTimeout(() => {
      if (timerState === 'running') {
        setShowControls(false);
      }
    }, 3000);
  };
  
  // Toggle controls visibility
  const toggleControls = () => {
    if (timerState === 'running') {
      setShowControls((prev) => !prev);
      
      if (!showControls) {
        resetControlsTimeout();
      } else {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }
    }
  };
  
  // Return to meditation list
  const handleClose = () => {
    router.back();
  };
  
  // Loading state
  if (loading || !meditation) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Body1 style={styles.loadingText}>読み込み中...</Body1>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Background */}
      <ImageBackground
        source={require('@assets/images/meditation-background.jpg')}
        style={styles.background}
        imageStyle={{ opacity: 0.7 }}
      >
        {/* Touchable area to toggle controls */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.touchableArea}
          onPress={toggleControls}
        >
          {/* Session content */}
          <View style={styles.contentContainer}>
            {/* Header controls - visible when showControls is true */}
            {showControls && (
              <BlurView
                style={[
                  styles.controlsBar,
                  { 
                    paddingTop: insets.top + 8,
                    paddingLeft: insets.left + 16,
                    paddingRight: insets.right + 16,
                  },
                ]}
                intensity={80}
                tint="dark"
              >
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleClose}
                >
                  <Ionicons name="close" size={28} color="white" />
                </TouchableOpacity>
                
                {/* Session title */}
                <H3 style={styles.sessionTitle}>
                  {meditation.title}
                </H3>
                
                {/* Empty view for balance */}
                <View style={styles.placeholder} />
              </BlurView>
            )}
            
            {/* Timer */}
            <View style={styles.timerContainer}>
              <MeditationTimer
                duration={meditation.durationMinutes * 60}
                initialState={timerState}
                onStateChange={handleTimerStateChange}
                onTick={handleTimerTick}
                size={240}
                color="white"
                backgroundColor="rgba(255, 255, 255, 0.3)"
              />
            </View>
            
            {/* Footer controls - visible when showControls is true */}
            {showControls && (
              <BlurView
                style={[
                  styles.footerBar,
                  {
                    paddingBottom: insets.bottom + 16,
                    paddingLeft: insets.left + 16,
                    paddingRight: insets.right + 16,
                  },
                ]}
                intensity={80}
                tint="dark"
              >
                {/* Breathing guidance */}
                <Card
                  style={styles.guidanceCard}
                  backgroundColor="rgba(255, 255, 255, 0.2)"
                >
                  <Body1 style={styles.guidanceText}>
                    {timerState === 'running' ? '呼吸に集中し、心を落ち着かせましょう' : 
                     timerState === 'paused' ? '再開するには、タイマーのプレイボタンを押してください' :
                     timerState === 'finished' ? '瞑想が完了しました。お疲れ様でした' :
                     '開始するには、タイマーのプレイボタンを押してください'}
                  </Body1>
                </Card>
                
                {/* Sound control - if sound is loaded and session is not completed */}
                {soundLoaded && !completed && (
                  <View style={styles.soundControl}>
                    <Ionicons
                      name={volume > 0 ? (volume > 0.5 ? 'volume-high' : 'volume-medium') : 'volume-mute'}
                      size={24}
                      color="white"
                    />
                    <View style={styles.volumeSlider}>
                      {/* This would be a custom slider component in a real app */}
                      <View 
                        style={[
                          styles.volumeTrack,
                          { backgroundColor: 'rgba(255, 255, 255, 0.3)' },
                        ]}
                      >
                        <View 
                          style={[
                            styles.volumeFill,
                            { 
                              width: `${volume * 100}%`,
                              backgroundColor: 'white',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </BlurView>
            )}
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#000',
  },
  touchableArea: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionTitle: {
    color: 'white',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBar: {
    padding: 16,
    paddingTop: 24,
  },
  guidanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 16,
  },
  guidanceText: {
    color: 'white',
    textAlign: 'center',
    padding: 16,
  },
  soundControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  volumeSlider: {
    flex: 1,
    marginLeft: 12,
    height: 40,
    justifyContent: 'center',
  },
  volumeTrack: {
    height: 4,
    borderRadius: 2,
  },
  volumeFill: {
    height: 4,
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: 'white',
  },
});
