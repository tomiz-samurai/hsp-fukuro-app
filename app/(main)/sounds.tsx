/**
 * Sounds Screen
 * 
 * A collection of ambient sounds, nature sounds, and white noise
 * designed for HSP users to create a calming audio environment.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import SoundCard from '@components/ui/organisms/SoundCard';
import Card from '@components/ui/molecules/Card';
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
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playingSounds, setPlayingSounds] = useState<Map<string, SoundInstance>>(new Map());
  
  // Fetch sounds data
  useEffect(() => {
    loadSounds();
    
    // Clean up on unmount
    return () => {
      unloadAllSounds();
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
      setFavorites(['nature-rain', 'white-noise-fan']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
    }
  };
  
  // Unload all sounds
  const unloadAllSounds = async () => {
    await SoundService.unloadAll();
    setPlayingSounds(new Map());
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedCategory(categoryId);
  };
  
  // Toggle sound playback
  const handlePlayToggle = async (sound: SoundItem) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      const isPlaying = playingSounds.has(sound.id);
      
      if (isPlaying) {
        // Pause sound
        await SoundService.pauseSound(sound.id);
        
        // Update playing sounds
        const newPlayingSounds = new Map(playingSounds);
        newPlayingSounds.delete(sound.id);
        setPlayingSounds(newPlayingSounds);
      } else {
        // Check if sound is accessible
        if (sound.isPremium && !isPremium) {
          Alert.alert(
            'プレミアム機能',
            'この音はプレミアム会員専用です。アップグレードするとすべての音にアクセスできます。',
            [{ text: '了解' }]
          );
          return;
        }
        
        // Check if maximum number of free sounds is reached
        if (!isPremium && playingSounds.size >= 2) {
          Alert.alert(
            '無料版の制限',
            '無料版では2つまでの音を同時に再生できます。プレミアム会員になると、制限なく音を組み合わせることができます。',
            [{ text: '了解' }]
          );
          return;
        }
        
        // Load and play sound
        const soundInstance = await SoundService.loadSound(sound.id, isPremium);
        
        if (soundInstance) {
          await SoundService.playSound(sound.id, isPremium);
          
          // Update playing sounds
          const newPlayingSounds = new Map(playingSounds);
          newPlayingSounds.set(sound.id, soundInstance);
          setPlayingSounds(newPlayingSounds);
        }
      }
    } catch (error) {
      console.error('Error toggling sound playback:', error);
    }
  };
  
  // Change sound volume
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update playing sounds with new volume
      const soundInstance = playingSounds.get(soundId);
      
      if (soundInstance) {
        const updatedInstance = { ...soundInstance, volume };
        const newPlayingSounds = new Map(playingSounds);
        newPlayingSounds.set(soundId, updatedInstance);
        setPlayingSounds(newPlayingSounds);
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
  
  // Currently playing sounds
  const playingItems = sounds.filter(s => playingSounds.has(s.id));
  
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
            リラックスや集中のための音環境を作りましょう
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
        {playingItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>再生中</H3>
              <TouchableOpacity
                onPress={unloadAllSounds}
                style={styles.stopAllButton}
              >
                <Ionicons name="stop-circle-outline" size={20} color={theme.colors.error} />
                <Body2 color={theme.colors.error} style={styles.stopAllText}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {playingItems.map((sound) => {
              const soundInstance = playingSounds.get(sound.id);
              return (
                <SoundCard
                  key={`playing-${sound.id}`}
                  sound={sound}
                  soundInstance={soundInstance}
                  isPlaying={true}
                  onPlayToggle={() => handlePlayToggle(sound)}
                  onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                  isPremiumUser={isPremium}
                  isFavorite={favorites.includes(sound.id)}
                  onToggleFavorite={() => handleToggleFavorite(sound.id)}
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
                    soundInstance={playingSounds.get(sound.id)}
                    isPlaying={playingSounds.has(sound.id)}
                    onPlayToggle={() => handlePlayToggle(sound)}
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
                ? 'すべての音' 
                : CATEGORIES.find(c => c.id === selectedCategory)?.label || '音'}
            </H3>
            <Body2>{filteredSounds.length}個のサウンド</Body2>
          </View>
          
          {filteredSounds.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Body1 align="center">
                この種類の音はまだありません。
              </Body1>
            </Card>
          ) : (
            filteredSounds.map((sound) => (
              <SoundCard
                key={`list-${sound.id}`}
                sound={sound}
                soundInstance={playingSounds.get(sound.id)}
                isPlaying={playingSounds.has(sound.id)}
                onPlayToggle={() => handlePlayToggle(sound)}
                onVolumeChange={playingSounds.has(sound.id) ? (volume) => handleVolumeChange(sound.id, volume) : undefined}
                isPremiumUser={isPremium}
                isFavorite={favorites.includes(sound.id)}
                onToggleFavorite={() => handleToggleFavorite(sound.id)}
                size="medium"
              />
            ))
          )}
        </View>
        
        {/* Mixing Tips */}
        <Card 
          style={styles.tipsCard} 
          backgroundColor={theme.colors.surfaceVariant}
        >
          <View style={styles.tipsCardContent}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.primary}
              style={styles.tipsIcon}
            />
            <View style={styles.tipsTextContainer}>
              <Subtitle1 weight="medium">音の組み合わせのヒント</Subtitle1>
              <Body1>
                森の音と雨の音の組み合わせや、ピンクノイズと環境音の組み合わせなど、複数の音をミックスすると、より心地よい音環境を作ることができます。
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
                  バイノーラルビートなどの専用音源と、無制限の音の組み合わせが使えるようになります。
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
  stopAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  stopAllText: {
    marginLeft: 4,
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
  tipsCard: {
    marginBottom: 24,
  },
  tipsCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  tipsIcon: {
    marginRight: 16,
  },
  tipsTextContainer: {
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
