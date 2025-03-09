/**
 * Sounds Screen
 * 
 * Browse and play ambient sounds designed for HSP users.
 * Features categories of sounds and volume control with gentle UI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useSearchParams, Stack } from 'expo-router';
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
import { 
  SoundService, 
  SoundItem, 
  SoundCategory,
  SoundInstance 
} from '@services/sound.service';
import { AppTheme } from '@config/theme';

// Sound categories
const CATEGORIES = [
  { id: 'all', label: 'すべて', icon: 'apps-outline' },
  { id: SoundCategory.NATURE, label: '自然', icon: 'leaf-outline' },
  { id: SoundCategory.AMBIENT, label: '環境音', icon: 'cafe-outline' },
  { id: SoundCategory.MUSIC, label: '音楽', icon: 'musical-notes-outline' },
  { id: SoundCategory.BINAURAL, label: 'バイノーラル', icon: 'pulse-outline' },
  { id: SoundCategory.WHITE_NOISE, label: 'ホワイトノイズ', icon: 'radio-outline' },
];

// Sounds screen component
export default function SoundsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // Selected category from URL params
  const categoryParam = params.category as SoundCategory || 'all';
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [loadedSounds, setLoadedSounds] = useState<Map<string, SoundInstance>>(new Map());
  const [playingSounds, setPlayingSounds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Unload all sounds when leaving the screen
      SoundService.unloadAll();
    };
  }, []);
  
  // Fetch sound data
  useEffect(() => {
    loadSounds();
  }, [isPremium]);
  
  // Load sounds
  const loadSounds = async () => {
    try {
      setLoading(true);
      
      // Get all sounds
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
  const handleSoundToggle = async (sound: SoundItem) => {
    try {
      const soundId = sound.id;
      
      // Check if sound is currently playing
      if (playingSounds.includes(soundId)) {
        // Pause sound
        await SoundService.pauseSound(soundId);
        
        // Update playing sounds state
        setPlayingSounds(prev => prev.filter(id => id !== soundId));
        
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // Load sound if not already loaded
        if (!loadedSounds.has(soundId)) {
          const soundInstance = await SoundService.loadSound(soundId, isPremium);
          
          if (!soundInstance) {
            console.error('Failed to load sound:', soundId);
            return;
          }
          
          // Update loaded sounds
          setLoadedSounds(prev => {
            const newMap = new Map(prev);
            newMap.set(soundId, soundInstance);
            return newMap;
          });
        }
        
        // Play sound
        await SoundService.playSound(soundId, isPremium);
        
        // Update playing sounds state
        setPlayingSounds(prev => [...prev, soundId]);
        
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update loaded sounds with new volume
      setLoadedSounds(prev => {
        const newMap = new Map(prev);
        const soundInstance = newMap.get(soundId);
        
        if (soundInstance) {
          soundInstance.volume = volume;
          newMap.set(soundId, soundInstance);
        }
        
        return newMap;
      });
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
            HSP向けの心地よいサウンド
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
        {playingSounds.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>再生中</H3>
              <TouchableOpacity
                onPress={async () => {
                  // Stop all playing sounds
                  for (const soundId of playingSounds) {
                    await SoundService.pauseSound(soundId);
                  }
                  setPlayingSounds([]);
                }}
              >
                <Body2 color={theme.colors.primary}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {sounds
              .filter(sound => playingSounds.includes(sound.id))
              .map(sound => (
                <SoundCard
                  key={`playing-${sound.id}`}
                  sound={sound}
                  soundInstance={loadedSounds.get(sound.id)}
                  isPlaying={true}
                  onPlayToggle={() => handleSoundToggle(sound)}
                  onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                  isFavorite={favorites.includes(sound.id)}
                  onToggleFavorite={() => handleToggleFavorite(sound.id)}
                  isPremiumUser={isPremium}
                />
              ))}
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
                <View key={sound.id} style={styles.horizontalItem}>
                  <SoundCard
                    sound={sound}
                    soundInstance={loadedSounds.get(sound.id)}
                    isPlaying={playingSounds.includes(sound.id)}
                    onPlayToggle={() => handleSoundToggle(sound)}
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
                soundInstance={loadedSounds.get(sound.id)}
                isPlaying={playingSounds.includes(sound.id)}
                onPlayToggle={() => handleSoundToggle(sound)}
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
                  すべてのサウンドとミキシング機能にアクセスできます。
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
