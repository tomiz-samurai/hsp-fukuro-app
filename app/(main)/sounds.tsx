/**
 * Sounds Screen
 * 
 * Browse and play ambient sounds and relaxation audio with HSP-friendly design.
 * Features categorized sound collections and easy playback controls.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
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

// Sound category data
const CATEGORIES = [
  { id: 'all', label: 'すべて', icon: 'apps-outline' },
  { id: SoundCategory.NATURE, label: '自然', icon: 'leaf-outline' },
  { id: SoundCategory.WHITE_NOISE, label: 'ホワイトノイズ', icon: 'radio-outline' },
  { id: SoundCategory.AMBIENT, label: '環境音', icon: 'cafe-outline' },
  { id: SoundCategory.MUSIC, label: '音楽', icon: 'musical-notes-outline' },
  { id: SoundCategory.BINAURAL, label: 'バイノーラル', icon: 'pulse-outline' },
];

// Sounds screen component
export default function SoundsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const appState = useRef(AppState.currentState);
  
  // Selected category from URL params
  const categoryParam = params.category as SoundCategory || 'all';
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [recentSounds, setRecentSounds] = useState<SoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playingSounds, setPlayingSounds] = useState<Map<string, SoundInstance>>(new Map());
  
  // Fetch sound data
  useEffect(() => {
    loadSounds();
    
    // Set up app state listener for audio handling
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Clean up audio when leaving screen
      stopAllSounds();
      subscription.remove();
    };
  }, [isPremium]);
  
  // Handle app state changes for audio
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App is going to background, handle audio accordingly
      // For this MVP, we'll just let sounds continue playing
    }
    
    appState.current = nextAppState;
  };
  
  // Load sounds
  const loadSounds = async () => {
    try {
      setLoading(true);
      
      // Get all sounds
      const allSounds = await SoundService.getSounds(isPremium);
      setSounds(allSounds);
      
      // Get recent sounds (most recent 3)
      setRecentSounds(allSounds.slice(0, 3));
      
      // Mock favorites for now
      setFavorites(['nature-rain', 'white-noise-fan']);
      
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
    
    // Update URL params
    if (categoryId === 'all') {
      router.setParams({});
    } else {
      router.setParams({ category: categoryId });
    }
  };
  
  // Toggle sound playback
  const handleToggleSound = async (sound: SoundItem) => {
    // Check if sound is accessible
    if (sound.isPremium && !isPremium) {
      return;
    }
    
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Check if sound is already playing
    const isPlaying = playingSounds.has(sound.id);
    
    if (isPlaying) {
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
      let instance = playingSounds.get(sound.id);
      
      if (!instance) {
        // Load the sound
        instance = await SoundService.loadSound(sound.id, isPremium);
        
        if (!instance) {
          console.error('Failed to load sound:', sound.id);
          return;
        }
      }
      
      // Play the sound
      await SoundService.playSound(sound.id, isPremium);
      
      // Update state
      setPlayingSounds(new Map(playingSounds.set(sound.id, instance)));
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };
  
  // Pause a sound
  const pauseSound = async (soundId: string) => {
    try {
      await SoundService.pauseSound(soundId);
      
      // Update state (keep the instance for resuming later)
      setPlayingSounds(new Map(playingSounds));
    } catch (error) {
      console.error('Error pausing sound:', error);
    }
  };
  
  // Stop a sound and remove it
  const stopSound = async (soundId: string) => {
    try {
      await SoundService.stopSound(soundId);
      
      // Remove from playing sounds
      playingSounds.delete(soundId);
      setPlayingSounds(new Map(playingSounds));
    } catch (error) {
      console.error('Error stopping sound:', error);
    }
  };
  
  // Stop all sounds
  const stopAllSounds = async () => {
    try {
      // Stop and unload all sounds
      await SoundService.unloadAll();
      
      // Clear playing sounds
      setPlayingSounds(new Map());
    } catch (error) {
      console.error('Error stopping all sounds:', error);
    }
  };
  
  // Change volume for a sound
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update state
      const instance = playingSounds.get(soundId);
      if (instance) {
        instance.volume = volume;
        setPlayingSounds(new Map(playingSounds.set(soundId, instance)));
      }
    } catch (error) {
      console.error('Error changing volume:', error);
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
  
  // Filtered sounds based on selected category
  const filteredSounds = selectedCategory === 'all'
    ? sounds
    : sounds.filter(s => s.category === selectedCategory);
  
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
          <H2>サウンド</H2>
          <Body1 style={styles.subtitle}>
            HSP向けのリラクゼーションサウンド
          </Body1>
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
              <TouchableOpacity
                onPress={stopAllSounds}
                style={styles.stopAllButton}
              >
                <Body2 color={theme.colors.error}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {Array.from(playingSounds.keys()).map((soundId) => {
              const soundItem = sounds.find(s => s.id === soundId);
              if (!soundItem) return null;
              
              return (
                <SoundCard
                  key={`playing-${soundId}`}
                  sound={soundItem}
                  soundInstance={playingSounds.get(soundId)}
                  isPlaying={true}
                  onPlayToggle={() => handleToggleSound(soundItem)}
                  onVolumeChange={(volume) => handleVolumeChange(soundId, volume)}
                  isPremiumUser={isPremium}
                  isFavorite={favorites.includes(soundId)}
                  onToggleFavorite={() => handleToggleFavorite(soundId)}
                  size="medium"
                />
              );
            })}
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
              {favoriteSounds.map((sound) => (
                <View key={`favorite-${sound.id}`} style={styles.horizontalItem}>
                  <SoundCard
                    sound={sound}
                    isPlaying={playingSounds.has(sound.id)}
                    onPlayToggle={() => handleToggleSound(sound)}
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
            filteredSounds.map((sound) => (
              <SoundCard
                key={sound.id}
                sound={sound}
                soundInstance={playingSounds.get(sound.id)}
                isPlaying={playingSounds.has(sound.id)}
                onPlayToggle={() => handleToggleSound(sound)}
                onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                isPremiumUser={isPremium}
                isFavorite={favorites.includes(sound.id)}
                onToggleFavorite={() => handleToggleFavorite(sound.id)}
                size="medium"
              />
            ))
          )}
        </View>
        
        {/* Sound Mixing Information */}
        <Card style={styles.infoCard}>
          <View style={styles.infoCardContent}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.primary}
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Subtitle1 weight="medium">サウンドミキシング</Subtitle1>
              <Body1>
                複数のサウンドを同時に再生して、あなた好みの環境音を作成できます。
              </Body1>
            </View>
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
                  すべてのサウンドとバイノーラルビート機能にアクセスできます。
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
  infoTextContainer: {
    flex: 1,
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
  stopAllButton: {
    padding: 4,
  },
});
