/**
 * SoundCard Component
 * 
 * Displays a sound item in a card format with HSP-friendly design.
 * Includes playback controls, volume slider, and favorite option.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ImageBackground,
  Animated,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import Card from '@components/ui/molecules/Card';
import { H3, Body1, Body2 } from '@components/ui/atoms/Typography';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { SoundItem, SoundCategory, SoundInstance } from '@services/sound.service';
import { AppTheme } from '@config/theme';

// SoundCard props interface
interface SoundCardProps {
  // Sound data
  sound: SoundItem;
  soundInstance?: SoundInstance;
  
  // Playback control
  isPlaying?: boolean;
  onPlayToggle?: () => void;
  onVolumeChange?: (volume: number) => void;
  
  // Favorite control
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  
  // Styling
  size?: 'small' | 'medium' | 'large';
  
  // State
  isPremiumUser?: boolean;
  
  // Test ID
  testID?: string;
}

// SoundCard component
const SoundCard: React.FC<SoundCardProps> = ({
  // Sound data
  sound,
  soundInstance,
  
  // Playback control
  isPlaying = false,
  onPlayToggle,
  onVolumeChange,
  
  // Favorite control
  isFavorite = false,
  onToggleFavorite,
  
  // Styling
  size = 'medium',
  
  // State
  isPremiumUser = false,
  
  // Test ID
  testID,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity, hapticsEnabled } = useAccessibilityStore();
  
  // Animation values
  const [pulseAnim] = useState(new Animated.Value(1));
  
  // Volume state
  const [volume, setVolume] = useState(soundInstance?.volume || 1);
  
  // Check if sound is accessible to user
  const isAccessible = !sound.isPremium || isPremiumUser;
  
  // Update volume when soundInstance changes
  useEffect(() => {
    if (soundInstance) {
      setVolume(soundInstance.volume);
    }
  }, [soundInstance]);
  
  // Pulse animation when playing
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation
      pulseAnim.setValue(1);
      Animated.timing(pulseAnim).stop();
    }
    
    return () => {
      Animated.timing(pulseAnim).stop();
    };
  }, [isPlaying]);
  
  // Handle volume change
  const handleVolumeChange = (value: number) => {
    setVolume(value);
    onVolumeChange?.(value);
    
    // Haptic feedback on full or zero volume
    if (hapticsEnabled && (value === 0 || value === 1)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Get icon based on sound category
  const getCategoryIcon = () => {
    switch (sound.category) {
      case SoundCategory.NATURE:
        return 'leaf-outline';
      case SoundCategory.AMBIENT:
        return 'cafe-outline';
      case SoundCategory.MUSIC:
        return 'musical-notes-outline';
      case SoundCategory.BINAURAL:
        return 'pulse-outline';
      case SoundCategory.WHITE_NOISE:
        return 'radio-outline';
      default:
        return 'planet-outline';
    }
  };
  
  // Get category label
  const getCategoryLabel = () => {
    switch (sound.category) {
      case SoundCategory.NATURE:
        return '自然';
      case SoundCategory.AMBIENT:
        return '環境音';
      case SoundCategory.MUSIC:
        return '音楽';
      case SoundCategory.BINAURAL:
        return 'バイノーラル';
      case SoundCategory.WHITE_NOISE:
        return 'ホワイトノイズ';
      default:
        return 'その他';
    }
  };
  
  // Get card dimensions
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return {
          height: 120,
          imageSize: 70,
        };
      case 'large':
        return {
          height: 220,
          imageSize: 120,
        };
      case 'medium':
      default:
        return {
          height: 180,
          imageSize: 100,
        };
    }
  };
  
  // Get dimensions
  const dimensions = getCardDimensions();
  
  // Premium badge component
  const PremiumBadge = () => (
    <View 
      style={[
        styles.premiumBadge, 
        { backgroundColor: sound.isPremium ? theme.colors.secondary : 'transparent' }
      ]}
    >
      {sound.isPremium && (
        <Body2 style={{ color: theme.colors.background }}>プレミアム</Body2>
      )}
    </View>
  );
  
  // Category badge component
  const CategoryBadge = () => (
    <View 
      style={[
        styles.categoryBadge, 
        { backgroundColor: theme.colors.surfaceVariant }
      ]}
    >
      <Ionicons 
        name={getCategoryIcon()} 
        size={14} 
        color={theme.colors.text}
        style={{ marginRight: 4 }}
      />
      <Body2 style={{ color: theme.colors.text }}>
        {getCategoryLabel()}
      </Body2>
    </View>
  );
  
  // Render locked overlay for premium content
  const renderLockedOverlay = () => {
    if (isAccessible) return null;
    
    return (
      <View style={styles.lockedOverlay}>
        <View style={[styles.lockedCircle, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <Ionicons name="lock-closed" size={24} color="white" />
        </View>
      </View>
    );
  };
  
  return (
    <Card
      style={[
        styles.card, 
        { 
          height: dimensions.height,
          opacity: isAccessible ? 1 : 0.8,
          borderColor: isPlaying ? theme.colors.primary : undefined,
          borderWidth: isPlaying ? 2 : 0,
        }
      ]}
      elevation={isPlaying ? 'medium' : 'low'}
      testID={testID}
      padding="none"
    >
      <View style={styles.container}>
        {/* Sound image and controls */}
        <View style={styles.imageSection}>
          <Animated.View
            style={[
              styles.imageContainer,
              { 
                width: dimensions.imageSize, 
                height: dimensions.imageSize,
                transform: [{ scale: isPlaying ? pulseAnim : 1 }],
              },
            ]}
          >
            <ImageBackground
              source={require('@assets/images/sound-placeholder.jpg')}
              style={styles.image}
              imageStyle={{ 
                borderRadius: dimensions.imageSize / 2,
                opacity: visualIntensity / 100,
              }}
            >
              {/* Play/Pause button */}
              {isAccessible && (
                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { 
                      backgroundColor: isPlaying 
                        ? `${theme.colors.primary}E6` 
                        : `${theme.colors.surface}E6`
                    },
                  ]}
                  onPress={onPlayToggle}
                  disabled={!isAccessible}
                >
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={isPlaying ? theme.colors.background : theme.colors.primary}
                  />
                </TouchableOpacity>
              )}
              
              {/* Premium badge */}
              <PremiumBadge />
              
              {/* Locked overlay for premium content */}
              {renderLockedOverlay()}
            </ImageBackground>
          </Animated.View>
          
          {/* Favorite button */}
          {onToggleFavorite && isAccessible && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={onToggleFavorite}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={22} 
                color={isFavorite ? theme.colors.error : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Sound info */}
        <View style={styles.infoSection}>
          <H3 style={styles.title} numberOfLines={1}>
            {sound.title}
          </H3>
          
          {/* Category badge */}
          <CategoryBadge />
          
          {/* Description */}
          {size !== 'small' && (
            <Body1 style={styles.description} numberOfLines={2}>
              {sound.description}
            </Body1>
          )}
          
          {/* Volume slider for playing sounds */}
          {isAccessible && isPlaying && onVolumeChange && (
            <View style={styles.volumeContainer}>
              <Ionicons 
                name={volume > 0 ? (volume > 0.5 ? 'volume-high' : 'volume-medium') : 'volume-mute'} 
                size={18}
                color={theme.colors.text}
              />
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={volume}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surfaceVariant}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 16,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 12,
  },
  imageSection: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginRight: 16,
  },
  imageContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    marginTop: 8,
    padding: 4,
  },
  infoSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginTop: 8,
    opacity: 0.8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginLeft: 8,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SoundCard;
