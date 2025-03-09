/**
 * Profile Screen
 * 
 * Displays user profile information, usage statistics, and provides
 * access to settings specific to HSP needs.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Profile menu items
const MENU_ITEMS = [
  {
    id: 'settings',
    title: '設定',
    icon: 'settings-outline',
    route: '/profile/settings',
  },
  {
    id: 'accessibility',
    title: 'アクセシビリティ',
    icon: 'eye-outline',
    route: '/profile/accessibility',
  },
  {
    id: 'premium',
    title: 'プレミアム',
    icon: 'star-outline',
    route: '/profile/premium',
  },
  {
    id: 'help',
    title: 'ヘルプ',
    icon: 'help-circle-outline',
    route: '/profile/help',
  },
  {
    id: 'about',
    title: 'このアプリについて',
    icon: 'information-circle-outline',
    route: '/profile/about',
  },
];

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMeditationMinutes: 0,
    meditationStreak: 0,
    favoriteActivities: ['瞑想', 'チャット'],
  });
  
  // Load user statistics
  useEffect(() => {
    loadUserStats();
  }, [user?.id]);
  
  // Load user statistics
  const loadUserStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get meditation statistics
      const totalMeditationTime = await MeditationService.getTotalMeditationTime(user.id);
      const meditationStreak = await MeditationService.getMeditationStreak(user.id);
      
      // Update stats
      setStats({
        totalMeditationMinutes: totalMeditationTime,
        meditationStreak,
        favoriteActivities: ['瞑想', 'チャット'], // Mock data
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user stats:', error);
      setLoading(false);
    }
  };
  
  // Navigate to profile edit
  const navigateToProfileEdit = () => {
    router.push('/profile/edit');
  };
  
  // Navigate to menu item
  const navigateToMenuItem = (route: string) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push(route);
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'ログアウトの確認',
      '本当にログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          onPress: async () => {
            if (hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            await signOut();
          },
          style: 'destructive'
        },
      ]
    );
  };
  
  // Format minutes as hours and minutes
  const formatMinutes = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}時間`;
    }
    
    return `${hours}時間${remainingMinutes}分`;
  };
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
        </View>
        
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@assets/images/default-avatar.png')}
                style={styles.avatar}
              />
              
              {/* Edit button */}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
                onPress={navigateToProfileEdit}
              >
                <Ionicons name="pencil" size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            {/* User info */}
            <View style={styles.userInfo}>
              <H3 style={styles.userName}>
                {profile?.display_name || user?.email?.split('@')[0] || 'ユーザー'}
              </H3>
              
              <Body1 style={styles.userEmail}>
                {user?.email || ''}
              </Body1>
              
              {/* Premium badge */}
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Ionicons name="star" size={12} color="white" style={styles.premiumIcon} />
                  <Body2 style={styles.premiumText}>プレミアム</Body2>
                </View>
              )}
            </View>
          </View>
        </Card>
        
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          {/* Meditation Stats Card */}
          <Card style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} style={styles.statsIcon} />
              <View style={styles.statsInfo}>
                <Body1 weight="medium" style={styles.statsTitle}>瞑想時間</Body1>
                <H3 style={styles.statsValue}>
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    formatMinutes(stats.totalMeditationMinutes)
                  )}
                </H3>
              </View>
            </View>
          </Card>
          
          {/* Streak Stats Card */}
          <Card style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Ionicons name="flame-outline" size={24} color={theme.colors.primary} style={styles.statsIcon} />
              <View style={styles.statsInfo}>
                <Body1 weight="medium" style={styles.statsTitle}>継続日数</Body1>
                <H3 style={styles.statsValue}>
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  ) : (
                    `${stats.meditationStreak}日`
                  )}
                </H3>
              </View>
            </View>
          </Card>
        </View>
        
        {/* Premium Upsell Card (if not premium) */}
        {!isPremium && (
          <Card 
            style={styles.premiumCard} 
            onPress={() => navigateToMenuItem('/profile/premium')}
            backgroundColor={theme.colors.secondaryContainer}
          >
            <View style={styles.premiumCardContent}>
              <Ionicons
                name="star"
                size={32}
                color={theme.colors.secondary}
                style={styles.premiumCardIcon}
              />
              <View style={styles.premiumCardTextContainer}>
                <H3>プレミアム会員になる</H3>
                <Body1>
                  すべての機能とコンテンツにアクセスして、より充実したセルフケア体験を。
                </Body1>
              </View>
            </View>
          </Card>
        )}
        
        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigateToMenuItem(item.route)}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.menuTextContainer}>
                <Body1 weight="medium">{item.title}</Body1>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Sign Out Button */}
        <Button
          label="ログアウト"
          variant="outline"
          onPress={handleSignOut}
          fullWidth
          style={styles.signOutButton}
        />
        
        {/* App Version */}
        <Body2 style={styles.versionText} align="center">
          Fukuro v0.1.0
        </Body2>
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
    marginBottom: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E1E1E1',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumIcon: {
    marginRight: 4,
  },
  premiumText: {
    color: 'white',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsContent: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  statsIcon: {
    marginRight: 12,
  },
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    marginBottom: 4,
  },
  statsValue: {
    fontSize: 20,
  },
  premiumCard: {
    marginBottom: 24,
  },
  premiumCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  premiumCardIcon: {
    marginRight: 16,
  },
  premiumCardTextContainer: {
    flex: 1,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  signOutButton: {
    marginBottom: 24,
  },
  versionText: {
    opacity: 0.5,
    marginBottom: 16,
  },
});
