/**
 * Sounds Screen
 * 
 * Browse and play various calming sounds for HSP users.
 * Includes nature sounds, white noise, and ambient sounds.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Platform,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as Haptics from 'expo-haptics';

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

// Sound category data
const CATEGORIES = [
  { id: 'all', label: 'すべて', icon: 'apps-outline' },
  { id: SoundCategory.NATURE, label: '自然', icon: 'leaf-outline' },
  { id: SoundCategory.AMBIENT, label: '環境音', icon: 'cafe-outline' },
  { id: SoundCategory.WHITE_NOISE, label: 'ホワイトノイズ', icon: 'radio-outline' },
  { id: SoundCategory.MUSIC, label: '音楽', icon: 'musical-notes-outline' },
  { id: SoundCategory.BINAURAL, label: 'バイノーラル', icon: 'pulse-outline' },
];

// Sounds screen component
export default function SoundsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [loadedSounds, setLoadedSounds] = useState<Map<string, SoundInstance>>(new Map());
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // App state reference for tracking background/foreground
  const appState = useRef(AppState.currentState);
  
  // Set up audio session on mount
  useEffect(() => {
    setupAudioSession();
    
    // Clean up on unmount
    return () => {
      unloadAllSounds();
    };
  }, []);
  
  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Load sounds data
  useEffect(() => {
    loadSounds();
  }, [isPremium]);
  
  // Set up audio session
  const setupAudioSession = async () => {
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
  
  // Handle app state changes (foreground/background)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App is going to background
      // We'll let sounds continue playing in the background
    } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App is coming to foreground
      // Refresh the state of loaded sounds
      refreshSoundStates();
    }
    
    appState.current = nextAppState;
  };
  
  // Refresh sound states
  const refreshSoundStates = async () => {
    const updatedPlayingSounds = new Set<string>();
    
    // Check each loaded sound
    for (const [soundId, instance] of loadedSounds.entries()) {
      try {
        const status = await instance.sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          updatedPlayingSounds.add(soundId);
        }
      } catch (error) {
        console.error(`Error getting status for sound ${soundId}:`, error);
      }
    }
    
    setPlayingSounds(updatedPlayingSounds);
  };
  
  // Load sounds data
  const loadSounds = async () => {
    try {
      setLoading(true);
      
      // Get sounds
      const allSounds = await SoundService.getSounds(isPremium);
      setSounds(allSounds);
      
      // Mock favorites for now
      setFavorites(['nature-rain', 'white-noise-fan']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
    }
  };
  
  // Unload all sounds
  const unloadAllSounds = async () => {
    try {
      // Unload each sound
      for (const [soundId, instance] of loadedSounds.entries()) {
        try {
          await instance.sound.unloadAsync();
        } catch (error) {
          console.error(`Error unloading sound ${soundId}:`, error);
        }
      }
      
      setLoadedSounds(new Map());
      setPlayingSounds(new Set());
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedCategory(categoryId);
  };
  
  // Toggle sound playback
  const handleTogglePlay = async (sound: SoundItem) => {
    try {
      const soundId = sound.id;
      
      // Check if sound is already loaded
      let soundInstance = loadedSounds.get(soundId);
      
      if (!soundInstance) {
        // Load sound
        const newInstance = await SoundService.loadSound(soundId, isPremium);
        
        if (!newInstance) {
          console.error(`Failed to load sound ${soundId}`);
          return;
        }
        
        // Update loaded sounds
        soundInstance = newInstance;
        setLoadedSounds(new Map(loadedSounds.set(soundId, newInstance)));
      }
      
      // Check if sound is playing
      const isPlaying = playingSounds.has(soundId);
      
      if (isPlaying) {
        // Pause sound
        await soundInstance.sound.pauseAsync();
        
        // Remove from playing sounds
        const newPlayingSounds = new Set(playingSounds);
        newPlayingSounds.delete(soundId);
        setPlayingSounds(newPlayingSounds);
      } else {
        // Play sound
        await soundInstance.sound.playAsync();
        
        // Add to playing sounds
        const newPlayingSounds = new Set(playingSounds);
        newPlayingSounds.add(soundId);
        setPlayingSounds(newPlayingSounds);
      }
      
      // Haptic feedback
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error toggling sound playback:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      const soundInstance = loadedSounds.get(soundId);
      
      if (!soundInstance) {
        return;
      }
      
      // Update volume
      await soundInstance.sound.setVolumeAsync(volume);
      
      // Update loaded sounds map
      const updatedInstance = {
        ...soundInstance,
        volume,
      };
      
      setLoadedSounds(new Map(loadedSounds.set(soundId, updatedInstance)));
    } catch (error) {
      console.error(`Error changing volume for sound ${soundId}:`, error);
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
  
  // Stop all playing sounds
  const stopAllSounds = async () => {
    try {
      // Stop each playing sound
      for (const soundId of playingSounds) {
        const instance = loadedSounds.get(soundId);
        
        if (instance) {
          await instance.sound.pauseAsync();
        }
      }
      
      // Clear playing sounds
      setPlayingSounds(new Set());
      
      // Haptic feedback
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error stopping all sounds:', error);
    }
  };
  
  // Filtered sounds based on selected category
  const filteredSounds = selectedCategory === 'all'
    ? sounds
    : sounds.filter(s => s.category === selectedCategory as SoundCategory);
  
  // Favorite sounds
  const favoriteSounds = sounds.filter(s => favorites.includes(s.id));
  
  // Render category item
  const renderCategoryItem = ({ item }: { item: typeof CATEGORIES[0] }) => (
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
  
  // Render sound item
  const renderSoundItem = (sound: SoundItem) => {
    const isPlaying = playingSounds.has(sound.id);
    const soundInstance = loadedSounds.get(sound.id);
    
    return (
      <SoundCard
        key={sound.id}
        sound={sound}
        soundInstance={soundInstance}
        isPlaying={isPlaying}
        onPlayToggle={() => handleTogglePlay(sound)}
        onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
        isPremiumUser={isPremium}
        isFavorite={favorites.includes(sound.id)}
        onToggleFavorite={() => handleToggleFavorite(sound.id)}
        size="medium"
        testID={`sound-${sound.id}`}
      />
    );
  };
  
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
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <H2>サウンド</H2>
            <Body1 style={styles.subtitle}>
              HSP向けの癒しのサウンド
            </Body1>
          </View>
          
          {/* Stop all button - only show if sounds are playing */}
          {playingSounds.size > 0 && (
            <Button
              label="すべて停止"
              variant="outline"
              size="small"
              icon={<Ionicons name="stop" size={18} color={theme.colors.primary} />}
              onPress={stopAllSounds}
              style={styles.stopButton}
            />
          )}
        </View>
        
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
        
        {/* Now Playing */}
        {playingSounds.size > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>再生中</H3>
              <Body2>{playingSounds.size}個のサウンド</Body2>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {sounds
                .filter(sound => playingSounds.has(sound.id))
                .map(sound => (
                  <View key={sound.id} style={styles.horizontalItem}>
                    <SoundCard
                      sound={sound}
                      soundInstance={loadedSounds.get(sound.id)}
                      isPlaying={true}
                      onPlayToggle={() => handleTogglePlay(sound)}
                      onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                      isPremiumUser={isPremium}
                      isFavorite={favorites.includes(sound.id)}
                      onToggleFavorite={() => handleToggleFavorite(sound.id)}
                      size="small"
                    />
                  </View>
                ))
              }
            </ScrollView>
          </View>
        )}
        
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
              {favoriteSounds.map(sound => (
                <View key={sound.id} style={styles.horizontalItem}>
                  <SoundCard
                    sound={sound}
                    soundInstance={loadedSounds.get(sound.id)}
                    isPlaying={playingSounds.has(sound.id)}
                    onPlayToggle={() => handleTogglePlay(sound)}
                    onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                    isPremiumUser={isPremium}
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(sound.id)}
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
                : CATEGORIES.find(c => c.id === selectedCategory)?.label || 'サウンド'}
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
            filteredSounds.map(sound => renderSoundItem(sound))
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
                  すべてのサウンドと多彩なミックス機能にアクセスできます。
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTextContainer: {
    flex: 1,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  stopButton: {
    marginLeft: 16,
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
    width: 250,
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
