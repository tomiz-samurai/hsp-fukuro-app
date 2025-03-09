/**
 * MeditationCard Component
 * 
 * Displays a meditation session in a card format with HSP-friendly design.
 * Includes details like duration, type, and premium status.
 */

import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import Card from '@components/ui/molecules/Card';
import { H3, Body1, Body2 } from '@components/ui/atoms/Typography';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { Meditation, MeditationType } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// MeditationCard props interface
interface MeditationCardProps {
  // Meditation data
  meditation: Meditation;
  
  // Events
  onPress?: () => void;
  
  // Styling
  size?: 'small' | 'medium' | 'large';
  
  // State
  isActive?: boolean;
  isPremiumUser?: boolean;
  isFavorite?: boolean;
  
  // Action
  onToggleFavorite?: () => void;
  
  // Test ID
  testID?: string;
}

// MeditationCard component
const MeditationCard: React.FC<MeditationCardProps> = ({
  // Meditation data
  meditation,
  
  // Events
  onPress,
  
  // Styling
  size = 'medium',
  
  // State
  isActive = false,
  isPremiumUser = false,
  isFavorite = false,
  
  // Action
  onToggleFavorite,
  
  // Test ID
  testID,
}) => {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  
  // Check if session is accessible to user
  const isAccessible = !meditation.isPremium || isPremiumUser;
  
  // Get icon based on meditation type
  const getTypeIcon = () => {
    switch (meditation.type) {
      case MeditationType.BEGINNER:
        return 'leaf-outline';
      case MeditationType.BREATHE:
        return 'pulse-outline';
      case MeditationType.BODY_SCAN:
        return 'body-outline';
      case MeditationType.MINDFULNESS:
        return 'radio-outline';
      case MeditationType.SLEEP:
        return 'moon-outline';
      case MeditationType.ANXIETY:
        return 'water-outline';
      case MeditationType.GROUNDING:
        return 'earth-outline';
      default:
        return 'sunny-outline';
    }
  };
  
  // Get type label
  const getTypeLabel = () => {
    switch (meditation.type) {
      case MeditationType.BEGINNER:
        return '初心者向け';
      case MeditationType.BREATHE:
        return '呼吸法';
      case MeditationType.BODY_SCAN:
        return 'ボディスキャン';
      case MeditationType.MINDFULNESS:
        return 'マインドフルネス';
      case MeditationType.SLEEP:
        return '睡眠';
      case MeditationType.ANXIETY:
        return '不安軽減';
      case MeditationType.GROUNDING:
        return 'グラウンディング';
      default:
        return 'その他';
    }
  };
  
  // Get card dimensions
  const getCardDimensions = () => {
    switch (size) {
      case 'small':
        return {
          height: 140,
          imageHeight: 80,
        };
      case 'large':
        return {
          height: 240,
          imageHeight: 160,
        };
      case 'medium':
      default:
        return {
          height: 200,
          imageHeight: 120,
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
        { backgroundColor: meditation.isPremium ? theme.colors.secondary : 'transparent' }
      ]}
    >
      {meditation.isPremium && (
        <Body2 style={{ color: theme.colors.background }}>プレミアム</Body2>
      )}
    </View>
  );
  
  // Duration badge component
  const DurationBadge = () => (
    <View 
      style={[
        styles.durationBadge, 
        { backgroundColor: isActive ? theme.colors.primary : theme.colors.surfaceVariant }
      ]}
    >
      <Body2 
        style={{ 
          color: isActive ? theme.colors.background : theme.colors.text,
          fontFamily: theme.typography.fontFamily.medium,
        }}
      >
        {meditation.durationMinutes}分
      </Body2>
    </View>
  );
  
  // Type badge component
  const TypeBadge = () => (
    <View 
      style={[
        styles.typeBadge, 
        { backgroundColor: theme.colors.surfaceVariant }
      ]}
    >
      <Ionicons 
        name={getTypeIcon()} 
        size={14} 
        color={theme.colors.text}
        style={{ marginRight: 4 }}
      />
      <Body2 style={{ color: theme.colors.text }}>
        {getTypeLabel()}
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
          borderColor: isActive ? theme.colors.primary : undefined,
          borderWidth: isActive ? 2 : 0,
        }
      ]}
      onPress={isAccessible ? onPress : undefined}
      elevation={isActive ? 'medium' : 'low'}
      testID={testID}
      padding="none"
    >
      {/* Image */}
      <View style={[styles.imageContainer, { height: dimensions.imageHeight }]}>
        <ImageBackground
          source={require('@assets/images/meditation-placeholder.jpg')}
          style={styles.image}
          imageStyle={{ opacity: visualIntensity / 100 }}
        >
          {/* Premium badge */}
          <PremiumBadge />
          
          {/* Duration badge */}
          <DurationBadge />
          
          {/* Locked overlay for premium content */}
          {renderLockedOverlay()}
        </ImageBackground>
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <H3 style={styles.title} numberOfLines={1}>
            {meditation.title}
          </H3>
          
          {/* Favorite button */}
          {onToggleFavorite && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={onToggleFavorite}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons 
                name={isFavorite ? 'heart' : 'heart-outline'} 
                size={24} 
                color={isFavorite ? theme.colors.error : theme.colors.text}
              />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Type badge */}
        <TypeBadge />
        
        {/* Description */}
        {size !== 'small' && (
          <Body1 style={styles.description} numberOfLines={2}>
            {meditation.description}
          </Body1>
        )}
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
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  content: {
    padding: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  description: {
    marginTop: 8,
    opacity: 0.8,
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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

export default MeditationCard;
