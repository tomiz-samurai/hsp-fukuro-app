/**
 * Sounds Screen
 * 
 * Browse and play various ambient sounds with HSP-friendly design.
 * Features categorized sound library and ability to create custom mixes.
 */

import React, { useState, useEffect } from 'react';
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
  const params = useSearchParams();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // Selected category from URL params
  const categoryParam = params.category as SoundCategory || 'all';
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [playingSounds, setPlayingSounds] = useState<Map<string, SoundInstance>>(new Map());
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
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
      
      // Get user favorites if logged in
      if (user?.id) {
        const favs = await SoundService.getFavorites(user.id);
        setFavorites(favs.map(f => f.sound_id));
      } else {
        // Mock favorites for now
        setFavorites(['nature-rain', 'nature-forest']);
      }
      
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
  
  // Handle sound play/pause
  const handlePlayToggle = async (sound: SoundItem) => {
    try {
      // Check if sound is already loaded and playing
      const isPlaying = playingSounds.has(sound.id) && 
                       playingSounds.get(sound.id)?.isPlaying;
      
      if (isPlaying) {
        // Pause sound
        await SoundService.pauseSound(sound.id);
        
        // Update playing sounds map
        const newMap = new Map(playingSounds);
        if (newMap.has(sound.id)) {
          const instance = newMap.get(sound.id)!;
          instance.isPlaying = false;
          newMap.set(sound.id, instance);
        }
        setPlayingSounds(newMap);
      } else {
        // Play sound
        // First load if not loaded
        if (!playingSounds.has(sound.id)) {
          const soundInstance = await SoundService.loadSound(sound.id, isPremium);
          if (soundInstance) {
            const newMap = new Map(playingSounds);
            newMap.set(sound.id, soundInstance);
            setPlayingSounds(newMap);
          }
        }
        
        // Then play
        await SoundService.playSound(sound.id, isPremium);
        
        // Update playing sounds map
        const newMap = new Map(playingSounds);
        if (newMap.has(sound.id)) {
          const instance = newMap.get(sound.id)!;
          instance.isPlaying = true;
          newMap.set(sound.id, instance);
        }
        setPlayingSounds(newMap);
      }
      
      // Haptic feedback
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error toggling sound play state:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update playing sounds map
      const newMap = new Map(playingSounds);
      if (newMap.has(soundId)) {
        const instance = newMap.get(soundId)!;
        instance.volume = volume;
        newMap.set(soundId, instance);
      }
      setPlayingSounds(newMap);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };
  
  // Toggle favorite status
  const handleToggleFavorite = async (soundId: string) => {
    if (!user?.id) return;
    
    try {
      const isFavorite = favorites.includes(soundId);
      
      if (isFavorite) {
        // Remove from favorites
        await SoundService.removeFavorite(user.id, soundId);
        setFavorites(prev => prev.filter(id => id !== soundId));
      } else {
        // Add to favorites
        await SoundService.addFavorite({
          user_id: user.id,
          sound_id: soundId,
          custom_name: null,
        });
        setFavorites(prev => [...prev, soundId]);
      }
      
      // Haptic feedback
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
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
    const isPlaying = playingSounds.has(sound.id) && 
                      playingSounds.get(sound.id)?.isPlaying;
    const soundInstance = playingSounds.get(sound.id);
    
    return (
      <SoundCard
        key={sound.id}
        sound={sound}
        soundInstance={soundInstance}
        isPlaying={isPlaying}
        onPlayToggle={() => handlePlayToggle(sound)}
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
          <H2>サウンド</H2>
          <Body1 style={styles.subtitle}>
            リラックスと集中のための癒しの音
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
        
        {/* Currently Playing */}
        {Array.from(playingSounds.values()).some(s => s.isPlaying) && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>再生中</H3>
              <TouchableOpacity
                onPress={async () => {
                  // Stop all playing sounds
                  for (const [soundId, instance] of playingSounds.entries()) {
                    if (instance.isPlaying) {
                      await SoundService.pauseSound(soundId);
                    }
                  }
                  
                  // Update state
                  const newMap = new Map(playingSounds);
                  for (const [soundId, instance] of newMap.entries()) {
                    instance.isPlaying = false;
                    newMap.set(soundId, instance);
                  }
                  setPlayingSounds(newMap);
                }}
              >
                <Body2 color={theme.colors.primary}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {sounds
              .filter(sound => {
                const instance = playingSounds.get(sound.id);
                return instance && instance.isPlaying;
              })
              .map(sound => renderSoundItem(sound))
            }
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
        
        {/* Sound Mixer Info Card */}
        <Card 
          style={styles.mixerCard} 
          backgroundColor={theme.colors.secondaryContainer}
        >
          <View style={styles.mixerCardContent}>
            <Ionicons
              name="options"
              size={24}
              color={theme.colors.secondary}
              style={styles.mixerIcon}
            />
            <View style={styles.mixerTextContainer}>
              <Subtitle1 weight="medium">サウンドミキサー</Subtitle1>
              <Body1>
                複数のサウンドを同時に再生して、あなた好みの音環境を作成できます。
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
                  すべてのサウンドとバイノーラルビートにアクセスできます。
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
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mixerCard: {
    marginBottom: 16,
  },
  mixerCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  mixerIcon: {
    marginRight: 16,
  },
  mixerTextContainer: {
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
});
