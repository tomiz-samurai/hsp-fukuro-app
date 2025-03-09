/**
 * Sounds Screen
 * 
 * Browse and play relaxing sounds with HSP-friendly design.
 * Features categorized sound sections, favorites, and volume control.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import SoundCard from '@components/ui/organisms/SoundCard';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { SoundService, SoundItem, SoundCategory, SoundInstance } from '@services/sound.service';
import { AppTheme } from '@config/theme';

// Organized category type
interface SoundCategoryData {
  id: SoundCategory;
  title: string;
  icon: string;
  sounds: SoundItem[];
}

// Sounds screen component
export default function SoundsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [categories, setCategories] = useState<SoundCategoryData[]>([]);
  const [favoriteSounds, setFavoriteSounds] = useState<string[]>([]);
  const [playingSounds, setPlayingSounds] = useState<Record<string, SoundInstance>>({});
  
  // Load sounds on component mount
  useEffect(() => {
    // Set up audio mode for background playback
    setupAudioMode();
    
    // Load sounds
    loadSounds();
    
    // Clean up on unmount
    return () => {
      stopAllSounds();
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
  
  // Load sounds data
  const loadSounds = async () => {
    try {
      setLoading(true);
      
      // Get all available sounds
      const sounds = await SoundService.getSounds(isPremium);
      
      // Group sounds by category
      const categorizedSounds: SoundCategoryData[] = [
        {
          id: SoundCategory.NATURE,
          title: '自然',
          icon: 'leaf-outline',
          sounds: sounds.filter(s => s.category === SoundCategory.NATURE),
        },
        {
          id: SoundCategory.WHITE_NOISE,
          title: 'ホワイトノイズ',
          icon: 'radio-outline',
          sounds: sounds.filter(s => s.category === SoundCategory.WHITE_NOISE),
        },
        {
          id: SoundCategory.AMBIENT,
          title: '環境音',
          icon: 'cafe-outline',
          sounds: sounds.filter(s => s.category === SoundCategory.AMBIENT),
        },
        {
          id: SoundCategory.MUSIC,
          title: '音楽',
          icon: 'musical-notes-outline',
          sounds: sounds.filter(s => s.category === SoundCategory.MUSIC),
        },
        {
          id: SoundCategory.BINAURAL,
          title: 'バイノーラル',
          icon: 'pulse-outline',
          sounds: sounds.filter(s => s.category === SoundCategory.BINAURAL),
        },
      ];
      
      // Remove empty categories
      const nonEmptyCategories = categorizedSounds.filter(c => c.sounds.length > 0);
      
      setCategories(nonEmptyCategories);
      
      // Mock favorites for now
      setFavoriteSounds(['nature-rain', 'white-noise-pink']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
    }
  };
  
  // Toggle sound playback
  const handlePlayToggle = async (sound: SoundItem) => {
    try {
      // Check if sound is already playing
      const isPlaying = !!playingSounds[sound.id];
      
      if (isPlaying) {
        // Pause sound
        await SoundService.pauseSound(sound.id);
        
        // Update state
        setPlayingSounds(prev => {
          const updated = { ...prev };
          delete updated[sound.id];
          return updated;
        });
        
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // Load and play sound
        const soundInstance = await SoundService.loadSound(sound.id, isPremium);
        
        if (soundInstance) {
          // Play sound
          await SoundService.playSound(sound.id, isPremium);
          
          // Update state
          setPlayingSounds(prev => ({
            ...prev,
            [sound.id]: soundInstance,
          }));
          
          // Haptic feedback
          if (hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling sound playback:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      // Update volume
      await SoundService.setVolume(soundId, volume);
      
      // Update state
      setPlayingSounds(prev => {
        const updated = { ...prev };
        if (updated[soundId]) {
          updated[soundId] = {
            ...updated[soundId],
            volume,
          };
        }
        return updated;
      });
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };
  
  // Toggle favorite status
  const handleToggleFavorite = (soundId: string) => {
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setFavoriteSounds(prev => {
      if (prev.includes(soundId)) {
        return prev.filter(id => id !== soundId);
      } else {
        return [...prev, soundId];
      }
    });
  };
  
  // Switch between tabs
  const handleTabChange = (tab: 'all' | 'favorites') => {
    setActiveTab(tab);
  };
  
  // Stop all playing sounds
  const stopAllSounds = async () => {
    try {
      // Unload all sounds
      await SoundService.unloadAll();
      
      // Update state
      setPlayingSounds({});
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  };
  
  // Get favorite sounds
  const getFavoriteSounds = () => {
    const allSounds = categories.flatMap(c => c.sounds);
    return allSounds.filter(s => favoriteSounds.includes(s.id));
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
    <ScreenWrapper scrollable={false} padding="none">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>サウンド</H2>
          <Body1 style={styles.subtitle}>
            リラックスと集中のための癒しの音
          </Body1>
          
          {/* Tab selector */}
          <View style={styles.tabSelector}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'all' && [styles.activeTab, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => handleTabChange('all')}
            >
              <Body1 
                style={[
                  styles.tabText,
                  activeTab === 'all' && styles.activeTabText,
                ]}
              >
                すべて
              </Body1>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'favorites' && [styles.activeTab, { backgroundColor: theme.colors.primary }],
              ]}
              onPress={() => handleTabChange('favorites')}
            >
              <Body1 
                style={[
                  styles.tabText,
                  activeTab === 'favorites' && styles.activeTabText,
                ]}
              >
                お気に入り
              </Body1>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* All sounds tab */}
          {activeTab === 'all' && (
            <>
              {/* Categories */}
              {categories.map((category) => (
                <View key={category.id} style={styles.categorySection}>
                  {/* Category header */}
                  <View style={styles.categoryHeader}>
                    <View style={styles.categoryTitleContainer}>
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={theme.colors.text}
                        style={styles.categoryIcon}
                      />
                      <H3>{category.title}</H3>
                    </View>
                    <Body2>{category.sounds.length}個のサウンド</Body2>
                  </View>
                  
                  {/* Sounds */}
                  {category.sounds.map((sound) => (
                    <SoundCard
                      key={sound.id}
                      sound={sound}
                      soundInstance={playingSounds[sound.id]}
                      isPlaying={!!playingSounds[sound.id]}
                      onPlayToggle={() => handlePlayToggle(sound)}
                      onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                      isFavorite={favoriteSounds.includes(sound.id)}
                      onToggleFavorite={() => handleToggleFavorite(sound.id)}
                      isPremiumUser={isPremium}
                      testID={`sound-${sound.id}`}
                    />
                  ))}
                </View>
              ))}
            </>
          )}
          
          {/* Favorites tab */}
          {activeTab === 'favorites' && (
            <View style={styles.favoritesSection}>
              {getFavoriteSounds().length === 0 ? (
                <Card style={styles.emptyCard}>
                  <Body1 align="center">
                    お気に入りに追加したサウンドはまだありません。
                  </Body1>
                </Card>
              ) : (
                getFavoriteSounds().map((sound) => (
                  <SoundCard
                    key={sound.id}
                    sound={sound}
                    soundInstance={playingSounds[sound.id]}
                    isPlaying={!!playingSounds[sound.id]}
                    onPlayToggle={() => handlePlayToggle(sound)}
                    onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(sound.id)}
                    isPremiumUser={isPremium}
                    testID={`favorite-sound-${sound.id}`}
                  />
                ))
              )}
            </View>
          )}
          
          {/* Info card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoCardContent}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.infoIcon}
              />
              <Body1>
                サウンドはバックグラウンドでも再生され、他のアプリを使用中や画面をロックしていても聞くことができます。
              </Body1>
            </View>
          </Card>
          
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
                    すべてのサウンドにアクセスしてカスタムミックスを作成できます。
                  </Body1>
                </View>
              </View>
            </Card>
          )}
        </ScrollView>
        
        {/* Playing indicator */}
        {Object.keys(playingSounds).length > 0 && (
          <Card 
            style={styles.playingBar}
            elevation="medium"
          >
            <View style={styles.playingContent}>
              <View style={styles.playingInfo}>
                <Ionicons
                  name="musical-notes"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.playingIcon}
                />
                <Body1>
                  {Object.keys(playingSounds).length}個のサウンドを再生中
                </Body1>
              </View>
              
              <TouchableOpacity
                style={styles.stopButton}
                onPress={stopAllSounds}
              >
                <Ionicons
                  name="stop-circle-outline"
                  size={28}
                  color={theme.colors.error}
                />
              </TouchableOpacity>
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
  },
  header: {
    padding: 16,
    paddingBottom: 0,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  tabSelector: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    color: theme.colors.text,
  },
  activeTabText: {
    color: theme.colors.background,
    fontFamily: 'NotoSansJP-Medium',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding for bottom bar
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  favoritesSection: {
    marginBottom: 24,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    marginBottom: 16,
  },
  infoCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 16,
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
  playingBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 16,
  },
  playingContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playingIcon: {
    marginRight: 8,
  },
  stopButton: {
    padding: 4,
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
