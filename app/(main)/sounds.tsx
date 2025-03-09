/**
 * Sounds Screen
 * 
 * Browse and play ambient sounds with HSP-friendly design.
 * Features categorized sound files, mixing capabilities, and timers.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import SoundCard from '@components/ui/organisms/SoundCard';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { SoundService, SoundItem, SoundCategory, SoundInstance } from '@services/sound.service';
import { AppTheme } from '@config/theme';

// Timer durations (in minutes)
const TIMER_DURATIONS = [15, 30, 45, 60, 90, 120];

// Sounds screen component
export default function SoundsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // State
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [playingSounds, setPlayingSounds] = useState<Map<string, SoundInstance>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch sound data
  useEffect(() => {
    loadSounds();
    
    // Set up audio mode for background playback
    setupAudioMode();
    
    return () => {
      // Clean up sounds
      stopAllSounds();
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPremium]);
  
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
  
  // Load sounds
  const loadSounds = async () => {
    try {
      setLoading(true);
      
      // Get all sounds
      const allSounds = await SoundService.getSounds(isPremium);
      setSounds(allSounds);
      
      // Mock favorites for now
      setFavorites(['nature-rain', 'nature-ocean', 'white-noise-fan']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedCategory(categoryId);
  };
  
  // Handle sound play/pause
  const handlePlayToggle = async (sound: SoundItem) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Check if sound is already playing
    if (playingSounds.has(sound.id)) {
      // Pause sound
      await pauseSound(sound.id);
    } else {
      // Play sound
      await playSound(sound);
    }
  };
  
  // Play a sound
  const playSound = async (sound: SoundItem) => {
    try {
      // Load sound if not already loaded
      let soundInstance = Array.from(playingSounds.values()).find(s => s.id === sound.id);
      
      if (!soundInstance) {
        // Load the sound
        soundInstance = await SoundService.loadSound(sound.id, isPremium);
        
        if (!soundInstance) {
          console.error('Failed to load sound');
          return;
        }
      }
      
      // Set volume
      await SoundService.setVolume(sound.id, masterVolume);
      
      // Play the sound
      await SoundService.playSound(sound.id, isPremium);
      
      // Update state
      setPlayingSounds(new Map(playingSounds.set(sound.id, soundInstance)));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  // Pause a sound
  const pauseSound = async (soundId: string) => {
    try {
      // Pause the sound
      await SoundService.pauseSound(soundId);
      
      // Update state
      const newPlayingSounds = new Map(playingSounds);
      newPlayingSounds.delete(soundId);
      setPlayingSounds(newPlayingSounds);
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };
  
  // Stop all sounds
  const stopAllSounds = async () => {
    try {
      // Stop all playing sounds
      for (const soundId of playingSounds.keys()) {
        await SoundService.stopSound(soundId);
      }
      
      // Clear playing sounds
      setPlayingSounds(new Map());
      
      // Stop and clear timer
      stopTimer();
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  };
  
  // Handle volume change for a sound
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      // Set volume for the sound
      await SoundService.setVolume(soundId, volume);
      
      // Update state
      const soundInstance = playingSounds.get(soundId);
      if (soundInstance) {
        soundInstance.volume = volume;
        setPlayingSounds(new Map(playingSounds.set(soundId, soundInstance)));
      }
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };
  
  // Handle master volume change
  const handleMasterVolumeChange = async (volume: number) => {
    setMasterVolume(volume);
    
    // Update volume for all playing sounds
    try {
      for (const [soundId, soundInstance] of playingSounds.entries()) {
        await SoundService.setVolume(soundId, volume);
        soundInstance.volume = volume;
      }
      
      // Update state
      setPlayingSounds(new Map(playingSounds));
    } catch (error) {
      console.error('Error changing master volume:', error);
    }
  };
  
  // Toggle favorite status
  const handleToggleFavorite = (soundId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setFavorites((prev) => {
      if (prev.includes(soundId)) {
        return prev.filter(id => id !== soundId);
      } else {
        return [...prev, soundId];
      }
    });
  };
  
  // Start sleep timer
  const startTimer = (minutes: number) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Set timer duration and remaining time
    const durationMs = minutes * 60 * 1000;
    const endTime = Date.now() + durationMs;
    
    setTimerDuration(minutes);
    setTimerRemaining(minutes * 60); // in seconds
    setTimerActive(true);
    
    // Start timer interval
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setTimerRemaining(remaining);
      
      // Check if timer has finished
      if (remaining <= 0) {
        stopTimer();
        stopAllSounds();
        
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }, 1000);
  };
  
  // Stop timer
  const stopTimer = () => {
    if (hapticsEnabled && timerActive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset timer state
    setTimerActive(false);
    setTimerDuration(null);
    setTimerRemaining(null);
  };
  
  // Format timer display
  const formatTimerDisplay = (seconds: number | null) => {
    if (seconds === null) return '';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
      : `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Filtered sounds based on selected category
  const filteredSounds = selectedCategory === 'all'
    ? sounds
    : sounds.filter(s => s.category === selectedCategory as SoundCategory);
  
  // Favorite sounds
  const favoriteSounds = sounds.filter(s => favorites.includes(s.id));
  
  // Render category item
  const renderCategoryItem = ({ item }: { item: { id: string; label: string; icon: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && {
          backgroundColor: theme.colors.primary,
        },
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <Ionicons
        name={item.icon as any}
        size={20}
        color={selectedCategory === item.id ? theme.colors.background : theme.colors.text}
        style={styles.categoryIcon}
      />
      <Body2 
        style={[
          styles.categoryLabel,
          selectedCategory === item.id && { color: theme.colors.background },
        ]}
      >
        {item.label}
      </Body2>
    </TouchableOpacity>
  );
  
  // Loading state
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Body1 style={styles.loadingText}>読み込み中...</Body1>
        </View>
      </ScreenWrapper>
    );
  }
  
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>サウンド</H2>
          <Body1 style={styles.subtitle}>
            心地よい音環境でリラックス
          </Body1>
        </View>
        
        {/* Now Playing */}
        {playingSounds.size > 0 && (
          <Card style={styles.nowPlayingCard}>
            <View style={styles.nowPlayingHeader}>
              <H3>再生中</H3>
              <TouchableOpacity onPress={stopAllSounds}>
                <Body2 color={theme.colors.error}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {/* Master Volume Control */}
            <View style={styles.masterVolumeContainer}>
              <Body2>全体音量</Body2>
              <View style={styles.volumeSliderContainer}>
                <Ionicons
                  name={masterVolume > 0 ? (masterVolume > 0.5 ? 'volume-high' : 'volume-medium') : 'volume-mute'}
                  size={22}
                  color={theme.colors.text}
                />
                <Slider
                  style={styles.volumeSlider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.05}
                  value={masterVolume}
                  onValueChange={handleMasterVolumeChange}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.surfaceVariant}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
            </View>
            
            {/* Sleep Timer */}
            <View style={styles.timerContainer}>
              <Body2>スリープタイマー</Body2>
              
              {timerActive ? (
                <View style={styles.activeTimerContainer}>
                  <Body1 style={styles.timerDisplay}>
                    {formatTimerDisplay(timerRemaining)}
                  </Body1>
                  <TouchableOpacity 
                    style={styles.stopTimerButton}
                    onPress={stopTimer}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={theme.colors.error}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.timerButtonsContainer}
                >
                  {TIMER_DURATIONS.map((duration) => (
                    <Button
                      key={`timer-${duration}`}
                      label={`${duration}分`}
                      variant="outline"
                      size="small"
                      style={styles.timerButton}
                      onPress={() => startTimer(duration)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
            
            {/* Playing Sounds */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playingSoundsContainer}
            >
              {Array.from(playingSounds.keys()).map((soundId) => {
                const soundItem = sounds.find(s => s.id === soundId);
                if (!soundItem) return null;
                
                return (
                  <View key={`playing-${soundId}`} style={styles.playingSoundItem}>
                    <SoundCard
                      sound={soundItem}
                      soundInstance={playingSounds.get(soundId)}
                      isPlaying={true}
                      onPlayToggle={() => handlePlayToggle(soundItem)}
                      onVolumeChange={(volume) => handleVolumeChange(soundId, volume)}
                      isFavorite={favorites.includes(soundId)}
                      onToggleFavorite={() => handleToggleFavorite(soundId)}
                      isPremiumUser={isPremium}
                      size="small"
                    />
                  </View>
                );
              })}
            </ScrollView>
          </Card>
        )}
        
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={[
              { id: 'all', label: 'すべて', icon: 'apps-outline' },
              { id: SoundCategory.NATURE, label: '自然', icon: 'leaf-outline' },
              { id: SoundCategory.AMBIENT, label: '環境音', icon: 'cafe-outline' },
              { id: SoundCategory.MUSIC, label: '音楽', icon: 'musical-notes-outline' },
              { id: SoundCategory.BINAURAL, label: 'バイノーラル', icon: 'pulse-outline' },
              { id: SoundCategory.WHITE_NOISE, label: 'ホワイトノイズ', icon: 'radio-outline' },
            ]}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        {/* Favorites */}
        {favoriteSounds.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>お気に入り</H3>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {favoriteSounds.map((sound) => (
                <View key={`favorite-${sound.id}`} style={styles.horizontalItem}>
                  <SoundCard
                    sound={sound}
                    soundInstance={playingSounds.get(sound.id)}
                    isPlaying={playingSounds.has(sound.id)}
                    onPlayToggle={() => handlePlayToggle(sound)}
                    onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(sound.id)}
                    isPremiumUser={isPremium}
                    size="small"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Sound List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3>
              {selectedCategory === 'all' 
                ? 'すべてのサウンド' 
                : selectedCategory === SoundCategory.NATURE ? '自然'
                : selectedCategory === SoundCategory.AMBIENT ? '環境音'
                : selectedCategory === SoundCategory.MUSIC ? '音楽'
                : selectedCategory === SoundCategory.BINAURAL ? 'バイノーラル'
                : selectedCategory === SoundCategory.WHITE_NOISE ? 'ホワイトノイズ'
                : 'サウンド'}
            </H3>
            <Body2>{filteredSounds.length}個のサウンド</Body2>
          </View>
          
          {filteredSounds.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Body1 align="center">
                この種類のサウンドはまだありません。
              </Body1>
            </Card>
          ) : (
            filteredSounds.map((sound) => (
              <SoundCard
                key={`sound-${sound.id}`}
                sound={sound}
                soundInstance={playingSounds.get(sound.id)}
                isPlaying={playingSounds.has(sound.id)}
                onPlayToggle={() => handlePlayToggle(sound)}
                onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                isFavorite={favorites.includes(sound.id)}
                onToggleFavorite={() => handleToggleFavorite(sound.id)}
                isPremiumUser={isPremium}
                size="medium"
              />
            ))
          )}
        </View>
        
        {/* Premium Upsell */}
        {!isPremium && (
          <Card 
            style={styles.premiumCard} 
            backgroundColor={theme.colors.secondaryContainer}
          >
            <View style={styles.premiumCardContent}>
              <Ionicons
                name="star"
                size={24}
                color={theme.colors.secondary}
                style={styles.premiumIcon}
              />
              <View style={styles.premiumTextContainer}>
                <Subtitle1 weight="medium">プレミアム会員になる</Subtitle1>
                <Body1>
                  すべてのサウンドと機能にアクセスできます。
                </Body1>
              </View>
            </View>
          </Card>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
  },
  nowPlayingCard: {
    marginBottom: 20,
  },
  nowPlayingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  masterVolumeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  volumeSliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerButtonsContainer: {
    marginTop: 8,
    paddingRight: 8,
  },
  timerButton: {
    marginRight: 8,
  },
  activeTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timerDisplay: {
    fontFamily: 'NotoSansJP-Medium',
    marginRight: 8,
  },
  stopTimerButton: {
    padding: 4,
  },
  playingSoundsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  playingSoundItem: {
    width: 200,
    marginRight: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  horizontalList: {
    paddingVertical: 4,
  },
  horizontalItem: {
    width: 200,
    marginRight: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumCard: {
    marginBottom: 24,
  },
  premiumCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  premiumIcon: {
    marginRight: 16,
  },
  premiumTextContainer: {
    flex: 1,
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
