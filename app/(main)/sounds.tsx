/**
 * Sounds Screen
 * 
 * Browse and play various relaxing sounds with HSP-friendly design.
 * Features categorized sound sections and multi-sound mixing capabilities.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
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
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playingSounds, setPlayingSounds] = useState<string[]>([]);
  
  // Setup audio session
  useEffect(() => {
    setupAudio();
    
    // Load sounds
    loadSounds();
    
    return () => {
      // Unload all sounds
      unloadAllSounds();
    };
  }, [isPremium]);
  
  // Set up audio session
  const setupAudio = async () => {
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
      setFavorites(['nature-rain', 'white-noise-fan']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading sounds:', error);
      setLoading(false);
    }
  };
  
  // Unload all sounds
  const unloadAllSounds = async () => {
    // Stop all playing sounds
    for (const soundId of playingSounds) {
      await handleSoundToggle(soundId, true);
    }
    
    // Clear loaded sounds
    setLoadedSounds(new Map());
    setPlayingSounds([]);
  };
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedCategory(categoryId);
  };
  
  // Handle sound toggle (play/pause)
  const handleSoundToggle = async (soundId: string, forceStop = false) => {
    try {
      // Get sound instance
      let instance = loadedSounds.get(soundId);
      
      // Check if sound is playing
      const isPlaying = playingSounds.includes(soundId);
      
      // If forcing stop or sound is playing, stop it
      if (forceStop || isPlaying) {
        // If sound instance exists, stop it
        if (instance) {
          await SoundService.pauseSound(soundId);
        }
        
        // Update playing sounds
        setPlayingSounds((prev) => prev.filter((id) => id !== soundId));
        
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        return;
      }
      
      // Otherwise, play or load sound
      if (!instance) {
        // Load sound
        instance = await SoundService.loadSound(soundId, isPremium);
        
        if (!instance) {
          console.error('Failed to load sound:', soundId);
          return;
        }
        
        // Add to loaded sounds
        setLoadedSounds((prev) => {
          const newMap = new Map(prev);
          newMap.set(soundId, instance!);
          return newMap;
        });
      }
      
      // Play sound
      await SoundService.playSound(soundId, isPremium);
      
      // Update playing sounds
      setPlayingSounds((prev) => [...prev, soundId]);
      
      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Error toggling sound:', error);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = async (soundId: string, volume: number) => {
    try {
      await SoundService.setVolume(soundId, volume);
      
      // Update loaded sound volume
      setLoadedSounds((prev) => {
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
  
  // Toggle favorite
  const handleToggleFavorite = (soundId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setFavorites((prev) => {
      if (prev.includes(soundId)) {
        return prev.filter((id) => id !== soundId);
      } else {
        return [...prev, soundId];
      }
    });
  };
  
  // Stop all sounds
  const stopAllSounds = async () => {
    // Stop all playing sounds
    for (const soundId of playingSounds) {
      await handleSoundToggle(soundId, true);
    }
    
    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Filtered sounds based on selected category
  const filteredSounds = selectedCategory === 'all'
    ? sounds
    : sounds.filter((s) => s.category === selectedCategory);
  
  // Favorite sounds
  const favoriteSounds = sounds.filter((s) => favorites.includes(s.id));
  
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
  const renderSoundItem = ({ item }: { item: SoundItem }) => {
    const isPlaying = playingSounds.includes(item.id);
    const soundInstance = loadedSounds.get(item.id);
    
    return (
      <SoundCard
        sound={item}
        soundInstance={soundInstance}
        isPlaying={isPlaying}
        onPlayToggle={() => handleSoundToggle(item.id)}
        onVolumeChange={(volume) => handleVolumeChange(item.id, volume)}
        isFavorite={favorites.includes(item.id)}
        onToggleFavorite={() => handleToggleFavorite(item.id)}
        isPremiumUser={isPremium}
        size="medium"
        testID={`sound-${item.id}`}
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>サウンド</H2>
          <Body1 style={styles.subtitle}>
            リラクゼーションや集中のための環境音
          </Body1>
        </View>
        
        {/* Currently playing + stop all button */}
        {playingSounds.length > 0 && (
          <Card style={styles.playingCard}>
            <View style={styles.playingCardContent}>
              <View style={styles.playingInfo}>
                <Subtitle1 style={styles.playingTitle}>
                  再生中: {playingSounds.length}個のサウンド
                </Subtitle1>
                <Body2>
                  複数のサウンドをミックスして、あなただけの環境音を作りましょう
                </Body2>
              </View>
              
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: theme.colors.error }]}
                onPress={stopAllSounds}
              >
                <Ionicons name="stop" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        
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
                    onPlayToggle={() => handleSoundToggle(sound.id)}
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
                onPlayToggle={() => handleSoundToggle(sound.id)}
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
                  すべてのサウンドとミックス機能にアクセスできます。
                </Body1>
              </View>
            </View>
          </Card>
        )}
        
        {/* Tips for HSP users */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons
              name="bulb-outline"
              size={24}
              color={theme.colors.primary}
              style={styles.tipsIcon}
            />
            <Subtitle1 weight="medium">HSPのためのヒント</Subtitle1>
          </View>
          <Body1 style={styles.tipsText}>
            1. 自然音は心拍数と呼吸を整えるのに効果的です。
          </Body1>
          <Body1 style={styles.tipsText}>
            2. ホワイトノイズは外部刺激をマスクして集中力を高めます。
          </Body1>
          <Body1 style={styles.tipsText}>
            3. 複数のサウンドを組み合わせて、自分だけの心地よい環境を作りましょう。
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
  playingCard: {
    marginBottom: 16,
  },
  playingCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  playingInfo: {
    flex: 1,
  },
  playingTitle: {
    marginBottom: 4,
  },
  stopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
  tipsCard: {
    marginBottom: 24,
    padding: 16,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsIcon: {
    marginRight: 12,
  },
  tipsText: {
    marginBottom: 8,
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
