/**
 * Meditation Screen
 * 
 * Browse and select from various meditation sessions with HSP-friendly design.
 * Features categorized sections and easy access to meditation content.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useSearchParams, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import MeditationCard from '@components/ui/organisms/MeditationCard';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { MeditationService, Meditation, MeditationType } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Meditation category data
const CATEGORIES = [
  { id: 'all', label: 'すべて', icon: 'apps-outline' },
  { id: MeditationType.BEGINNER, label: '初心者', icon: 'leaf-outline' },
  { id: MeditationType.BREATHE, label: '呼吸法', icon: 'pulse-outline' },
  { id: MeditationType.MINDFULNESS, label: 'マインドフルネス', icon: 'radio-outline' },
  { id: MeditationType.BODY_SCAN, label: 'ボディスキャン', icon: 'body-outline' },
  { id: MeditationType.ANXIETY, label: '不安軽減', icon: 'water-outline' },
  { id: MeditationType.SLEEP, label: '睡眠', icon: 'moon-outline' },
  { id: MeditationType.GROUNDING, label: 'グラウンディング', icon: 'earth-outline' },
];

// Meditation screen component
export default function MeditationScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // Selected category from URL params
  const categoryParam = params.type as MeditationType || 'all';
  
  // State
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [meditations, setMeditations] = useState<Meditation[]>([]);
  const [recentMeditations, setRecentMeditations] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Fetch meditation data
  useEffect(() => {
    loadMeditations();
  }, [isPremium]);
  
  // Load meditations
  const loadMeditations = async () => {
    try {
      setLoading(true);
      
      // Get all meditations
      const allMeditations = await MeditationService.getMeditations(isPremium);
      setMeditations(allMeditations);
      
      // Get recent meditations (most recent 3)
      setRecentMeditations(allMeditations.slice(0, 3));
      
      // Mock favorites for now
      setFavorites(['beginner-1', 'breathe-1']);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading meditations:', error);
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
      router.setParams({ type: categoryId });
    }
  };
  
  // Navigate to meditation session
  const handleMeditationSelect = (meditation: Meditation) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    router.push({
      pathname: '/meditation/session',
      params: { id: meditation.id },
    });
  };
  
  // Toggle favorite status
  const handleToggleFavorite = (meditationId: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setFavorites((prev) => {
      if (prev.includes(meditationId)) {
        return prev.filter(id => id !== meditationId);
      } else {
        return [...prev, meditationId];
      }
    });
  };
  
  // Filtered meditations based on selected category
  const filteredMeditations = selectedCategory === 'all'
    ? meditations
    : meditations.filter(m => m.type === selectedCategory);
  
  // Favorite meditations
  const favoriteMeditations = meditations.filter(m => favorites.includes(m.id));
  
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
  
  // Render meditation item
  const renderMeditationItem = ({ item }: { item: Meditation }) => (
    <MeditationCard
      meditation={item}
      onPress={() => handleMeditationSelect(item)}
      isPremiumUser={isPremium}
      isFavorite={favorites.includes(item.id)}
      onToggleFavorite={() => handleToggleFavorite(item.id)}
      size="medium"
      testID={`meditation-${item.id}`}
    />
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
          <H2>瞑想</H2>
          <Body1 style={styles.subtitle}>
            HSP向けのマインドフルネスと瞑想
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
        
        {/* Recent Meditations */}
        {recentMeditations.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>最近の瞑想</H3>
              <TouchableOpacity
                onPress={() => {
                  // Refresh data
                  loadMeditations();
                }}
              >
                <Body2 color={theme.colors.primary}>更新</Body2>
              </TouchableOpacity>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {recentMeditations.map((meditation) => (
                <View key={meditation.id} style={styles.horizontalItem}>
                  <MeditationCard
                    meditation={meditation}
                    onPress={() => handleMeditationSelect(meditation)}
                    isPremiumUser={isPremium}
                    isFavorite={favorites.includes(meditation.id)}
                    onToggleFavorite={() => handleToggleFavorite(meditation.id)}
                    size="small"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Favorites */}
        {favoriteMeditations.length > 0 && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <H3>お気に入り</H3>
            </View>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {favoriteMeditations.map((meditation) => (
                <View key={meditation.id} style={styles.horizontalItem}>
                  <MeditationCard
                    meditation={meditation}
                    onPress={() => handleMeditationSelect(meditation)}
                    isPremiumUser={isPremium}
                    isFavorite={true}
                    onToggleFavorite={() => handleToggleFavorite(meditation.id)}
                    size="small"
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Meditation List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <H3>
              {selectedCategory === 'all' 
                ? 'すべての瞑想' 
                : CATEGORIES.find(c => c.id === selectedCategory)?.label || '瞑想'}
            </H3>
            <Body2>{filteredMeditations.length}個のセッション</Body2>
          </View>
          
          {filteredMeditations.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Body1 align="center">
                この種類の瞑想はまだありません。
              </Body1>
            </Card>
          ) : (
            filteredMeditations.map((meditation) => (
              <MeditationCard
                key={meditation.id}
                meditation={meditation}
                onPress={() => handleMeditationSelect(meditation)}
                isPremiumUser={isPremium}
                isFavorite={favorites.includes(meditation.id)}
                onToggleFavorite={() => handleToggleFavorite(meditation.id)}
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
                  すべての瞑想セッションと機能にアクセスできます。
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
