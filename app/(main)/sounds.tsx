/**
 * Sounds Screen
 * 
 * Browse and play various ambient sounds with HSP-friendly design.
 * Features categorized sounds and easy playback controls.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
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
  { id: SoundCategory.AMBIENT, label: '環境音', icon: 'cafe-outline' },
  { id: SoundCategory.WHITE_NOISE, label: 'ホワイトノイズ', icon: 'radio-outline' },
  { id: SoundCategory.MUSIC, label: '音楽', icon: 'musical-notes-outline' },
  { id: SoundCategory.BINAURAL, label: 'バイノーラル', icon: 'pulse-outline' },
];

// Sounds screen component
export default function SoundsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [loadedSounds, setLoadedSounds] = useState<Map<string, SoundInstance>>(new Map());
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch sound data
  useEffect(() => {
    loadSounds();
    
    // Clean up sounds on unmount
    return () => {
      SoundService.unloadAll();
    };
  }, [isPremium]);
  
  // Load sounds
  const loadSounds = async () => {
    try {
      setLoading(true);
      
      // Get all sounds
      const allSounds = await SoundService.getSounds(isPremium);
      setSounds(allSounds);
      
      // Mock favorites for now
      setFavorites(['nature-rain', 'nature-ocean']);
      
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
  
  // Handle sound playback toggle
  const handlePlayToggle = async (soundId: string) => {
    try {
      // Check if sound is already playing
      const isPlaying = playingSounds.has(soundId);
      
      if (isPlaying) {
        // Pause sound
        await SoundService.pauseSound(soundId);
        
        // Update state
        const newPlayingSounds = new Set(playingSounds);
        newPlayingSounds.delete(soundId);
        setPlayingSounds(newPlayingSounds);
      } else {
        // Check if sound is loaded
        let soundInstance = loadedSounds.get(soundId);
        
        if (!soundInstance) {
          // Load sound
          soundInstance = await SoundService.loadSound(soundId, isPremium);
          
          if (soundInstance) {
            // Update loaded sounds
            const newLoadedSounds = new Map(loadedSounds);
            newLoadedSounds.set(soundId, soundInstance);
            setLoadedSounds(newLoadedSounds);
          } else {
            // Failed to load sound
            return;
          }
        }
        
        // Play sound
        await SoundService.playSound(soundId, isPremium);
        
        // Update state
        const newPlayingSounds = new Set(playingSounds);
        newPlayingSounds.add(soundId);
        setPlayingSounds(newPlayingSounds);
      }
      
      // Haptic feedback
      if (hapticsEnabled) {
        Haptics.impactAsync(
          isPlaying ? 
            Haptics.ImpactFeedbackStyle.Light : 
            Haptics.ImpactFeedbackStyle.Medium
        );
      }
    } catch (error) {
      console.error('Error toggling sound playback:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
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
        onPlayToggle={() => handlePlayToggle(sound.id)}
        onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
        isFavorite={favorites.includes(sound.id)}
        onToggleFavorite={() => handleToggleFavorite(sound.id)}
        isPremiumUser={isPremium}
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
          <H2>サウンド</H2>
          <Body1 style={styles.subtitle}>
            HSP向けの心地よい環境音
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
                onPress={() => {
                  // Stop all sounds
                  playingSounds.forEach(async (soundId) => {
                    await SoundService.pauseSound(soundId);
                  });
                  setPlayingSounds(new Set());
                }}
              >
                <Body2 color={theme.colors.primary}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {Array.from(playingSounds).map((soundId) => {
              const sound = sounds.find(s => s.id === soundId);
              if (!sound) return null;
              
              return renderSoundItem(sound);
            })}
          </View>
        )}
        
        {/* Favorites */}
        {favoriteSounds.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>お気に入り</H3>
            </View>
            
            {favoriteSounds.map(sound => renderSoundItem(sound))}
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
                  すべての音源とミキシング機能にアクセスできます。
                </Body1>
              </View>
            </View>
          </Card>
        )}
        
        {/* Sound mixing information */}
        <Card style={styles.infoCard}>
          <Body1>
            複数のサウンドを同時に再生すると、独自のサウンドスケープを作成できます。サウンドごとに音量を調整して、最適な環境を見つけましょう。
          </Body1>
        </Card>
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
  infoCard: {
    marginBottom: 24,
    padding: 16,
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
