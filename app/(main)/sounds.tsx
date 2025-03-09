/**
 * Sounds Screen
 * 
 * Browse and play various soothing sounds with HSP-friendly design.
 * Features categories of ambient sounds for relaxation and focus.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
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
  const [playingSounds, setPlayingSounds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Fetch sound data
  useEffect(() => {
    loadSounds();
    
    // Cleanup function
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
      
      // If user is logged in, get favorites
      if (user?.id) {
        const userFavorites = await SoundService.getFavorites(user.id);
        setFavorites(userFavorites.map(fav => fav.sound_id));
      } else {
        // Mock favorites for now
        setFavorites(['nature-rain', 'white-noise-fan']);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
      
      Alert.alert(
        'エラー',
        'サウンドデータの取得に失敗しました。',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Unload all sounds on unmount
  const unloadAllSounds = async () => {
    try {
      await SoundService.unloadAll();
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
    
    // Update URL params
    if (categoryId === 'all') {
      router.setParams({});
    } else {
      router.setParams({ category: categoryId });
    }
  };
  
  // Toggle sound play/pause
  const handleTogglePlaySound = async (sound: SoundItem) => {
    try {
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      const soundId = sound.id;
      
      // Check if sound is playing
      if (playingSounds.has(soundId)) {
        // Pause sound
        await SoundService.pauseSound(soundId);
        
        // Update state
        setPlayingSounds(prev => {
          const newSet = new Set(prev);
          newSet.delete(soundId);
          return newSet;
        });
      } else {
        // Check if sound is already loaded
        let soundInstance = loadedSounds.get(soundId);
        
        if (!soundInstance) {
          // Load sound
          soundInstance = await SoundService.loadSound(soundId, isPremium);
          
          if (soundInstance) {
            // Update loaded sounds
            setLoadedSounds(prev => {
              const newMap = new Map(prev);
              newMap.set(soundId, soundInstance!);
              return newMap;
            });
          } else {
            // Failed to load sound
            Alert.alert(
              'エラー',
              'サウンドの読み込みに失敗しました。',
              [{ text: 'OK' }]
            );
            return;
          }
        }
        
        // Play sound
        await SoundService.playSound(soundId, isPremium);
        
        // Update state
        setPlayingSounds(prev => {
          const newSet = new Set(prev);
          newSet.add(soundId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error toggling sound playback:', error);
      
      Alert.alert(
        'エラー',
        'サウンドの再生に失敗しました。',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update loaded sound instance
      setLoadedSounds(prev => {
        const newMap = new Map(prev);
        const instance = newMap.get(soundId);
        
        if (instance) {
          instance.volume = volume;
          newMap.set(soundId, instance);
        }
        
        return newMap;
      });
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };
  
  // Toggle favorite status
  const handleToggleFavorite = async (soundId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    if (!user?.id) {
      // If user is not logged in, show sign-in prompt
      Alert.alert(
        'ログインが必要です',
        'お気に入り機能を使用するにはログインが必要です。',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: 'ログイン', onPress: () => router.push('/login') },
        ]
      );
      return;
    }
    
    try {
      if (favorites.includes(soundId)) {
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
    } catch (error) {
      console.error('Error toggling favorite:', error);
      
      Alert.alert(
        'エラー',
        'お気に入りの更新に失敗しました。',
        [{ text: 'OK' }]
      );
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
            心を落ち着かせるリラクゼーションサウンド
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
        
        {/* Multi Sound Mixer Card */}
        <Card 
          style={styles.mixerCard} 
          backgroundColor={theme.colors.secondaryContainer}
        >
          <View style={styles.mixerContent}>
            <View style={styles.mixerIcon}>
              <Ionicons
                name="albums-outline"
                size={24}
                color={theme.colors.secondary}
              />
            </View>
            <View style={styles.mixerTextContainer}>
              <Subtitle1 weight="medium">サウンドミキサー</Subtitle1>
              <Body1>
                複数のサウンドを同時に再生して、カスタムサウンドスケープを作成できます。
              </Body1>
            </View>
          </View>
        </Card>
        
        {/* Currently Playing */}
        {playingSounds.size > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>再生中</H3>
              <TouchableOpacity
                onPress={() => {
                  // Stop all playing sounds
                  playingSounds.forEach(async (soundId) => {
                    await SoundService.stopSound(soundId);
                  });
                  setPlayingSounds(new Set());
                }}
              >
                <Body2 color={theme.colors.primary}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {Array.from(playingSounds).map(soundId => {
              const sound = sounds.find(s => s.id === soundId);
              if (!sound) return null;
              
              return (
                <SoundCard
                  key={`playing-${sound.id}`}
                  sound={sound}
                  soundInstance={loadedSounds.get(sound.id)}
                  isPlaying={true}
                  onPlayToggle={() => handleTogglePlaySound(sound)}
                  onVolumeChange={(volume) => handleVolumeChange(sound.id, volume)}
                  isFavorite={favorites.includes(sound.id)}
                  onToggleFavorite={() => handleToggleFavorite(sound.id)}
                  isPremiumUser={isPremium}
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
                    soundInstance={loadedSounds.get(sound.id)}
                    isPlaying={playingSounds.has(sound.id)}
                    onPlayToggle={() => handleTogglePlaySound(sound)}
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
                isPlaying={playingSounds.has(sound.id)}
                onPlayToggle={() => handleTogglePlaySound(sound)}
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
                  すべてのサウンドやバイノーラルビートにアクセスできます。
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
  mixerCard: {
    marginBottom: 20,
  },
  mixerContent: {
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
