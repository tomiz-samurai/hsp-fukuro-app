/**
 * Sounds Screen
 * 
 * A screen for browsing and playing calming sounds for HSP users.
 * Features various sound categories and background playback.
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
import { useRouter, useSearchParams, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio, AVPlaybackStatus } from 'expo-av';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import SoundCard from '@components/ui/organisms/SoundCard';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { SoundService, SoundItem, SoundCategory, SoundInstance } from '@services/sound.service';
import { AppTheme } from '@config/theme';

// Sound categories for tabs
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
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playingSounds, setPlayingSounds] = useState<string[]>([]);
  
  // App state ref for tracking background/foreground
  const appState = useRef<AppStateStatus>(AppState.currentState);
  
  // Load sounds on mount
  useEffect(() => {
    loadSounds();
    
    // Set up app state change listener for audio handling
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Set up audio
    setupAudio();
    
    return () => {
      // Clean up
      subscription.remove();
      unloadAllSounds();
    };
  }, [isPremium]);
  
  // Handle app state changes for audio
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // If app goes into background, do nothing (let audio continue)
    // If app comes back to foreground from background
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      // We could refresh the UI state here if needed
    }
    
    appState.current = nextAppState;
  };
  
  // Setup audio
  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: Audio.InterruptionModeAndroid.DoNotMix,
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
      setFavorites(['nature-rain', 'nature-forest']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
    }
  };
  
  // Unload all sounds
  const unloadAllSounds = async () => {
    // Use the service to unload all sounds
    await SoundService.unloadAll();
    setLoadedSounds(new Map());
    setPlayingSounds([]);
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
    try {
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      // Check if sound is already playing
      const isPlaying = playingSounds.includes(sound.id);
      
      if (isPlaying) {
        // Pause the sound
        await SoundService.pauseSound(sound.id);
        
        // Update playing sounds list
        setPlayingSounds((prev) => prev.filter(id => id !== sound.id));
      } else {
        // Check if sound is loaded
        let soundInstance = loadedSounds.get(sound.id);
        
        if (!soundInstance) {
          // Load the sound
          soundInstance = await SoundService.loadSound(sound.id, isPremium);
          
          if (soundInstance) {
            // Update loaded sounds list
            setLoadedSounds((prev) => {
              const updated = new Map(prev);
              updated.set(sound.id, soundInstance!);
              return updated;
            });
          } else {
            // Error loading sound
            console.error('Failed to load sound:', sound.id);
            return;
          }
        }
        
        // Play the sound
        await SoundService.playSound(sound.id, isPremium);
        
        // Update playing sounds list
        setPlayingSounds((prev) => [...prev, sound.id]);
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update loaded sounds map
      setLoadedSounds((prev) => {
        const updated = new Map(prev);
        const soundInstance = updated.get(soundId);
        
        if (soundInstance) {
          soundInstance.volume = volume;
          updated.set(soundId, soundInstance);
        }
        
        return updated;
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
  
  // Render sound item
  const renderSoundItem = (sound: SoundItem) => {
    const isPlaying = playingSounds.includes(sound.id);
    const soundInstance = loadedSounds.get(sound.id);
    
    return (
      <SoundCard
        key={sound.id}
        sound={sound}
        soundInstance={soundInstance}
        isPlaying={isPlaying}
        onPlayToggle={() => handleToggleSound(sound)}
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
            穏やかな音で心を落ち着かせましょう
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
        
        {/* Currently Playing Section */}
        {playingSounds.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>再生中</H3>
              <TouchableOpacity onPress={unloadAllSounds}>
                <Body2 color={theme.colors.primary}>すべて停止</Body2>
              </TouchableOpacity>
            </View>
            
            {sounds
              .filter(sound => playingSounds.includes(sound.id))
              .map(sound => renderSoundItem(sound))
            }
          </View>
        )}
        
        {/* Favorites Section */}
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
        
        {/* Mix sounds info card */}
        <Card 
          style={styles.infoCard} 
          backgroundColor={theme.colors.infoContainer}
        >
          <View style={styles.infoCardContent}>
            <Ionicons
              name="information-circle"
              size={24}
              color={theme.colors.info}
              style={styles.infoIcon}
            />
            <View style={styles.infoTextContainer}>
              <Subtitle1 weight="medium">サウンドミックス</Subtitle1>
              <Body1>
                複数の音を同時に再生して、あなただけの落ち着く環境音を作ることができます。
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
});
