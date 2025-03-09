/**
 * Profile Screen
 * 
 * User profile page with usage statistics, settings, and account management.
 * Designed with HSP considerations for visual comfort and user experience.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import { H2, H3, Body1, Body2, Subtitle1, Subtitle2 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const resetAuthState = useAuthStore((state) => state.resetState);
  
  // State
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMeditationMinutes: 0,
    meditationStreak: 0,
    totalChatMessages: 0,
    favoriteActivities: ['瞑想', 'チャット'],
  });
  
  // Fetch user data
  useEffect(() => {
    loadUserData();
  }, [user?.id]);
  
  // Load user data
  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get meditation stats
      const totalMeditationMinutes = await MeditationService.getTotalMeditationTime(user.id);
      const meditationStreak = await MeditationService.getMeditationStreak(user.id);
      
      // Mock chat stats for now
      const totalChatMessages = 24;
      
      // Update stats
      setStats({
        totalMeditationMinutes,
        meditationStreak,
        totalChatMessages,
        favoriteActivities: totalMeditationMinutes > totalChatMessages ? ['瞑想', 'チャット'] : ['チャット', '瞑想'],
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'ログアウト',
      'アカウントからログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              resetAuthState();
              router.replace('/login');
            } catch (error) {
              console.error('Error signing out:', error);
            }
          },
        },
      ]
    );
  };
  
  // Navigate to settings
  const navigateToSettings = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push('/profile/settings');
  };
  
  // Navigate to premium subscription
  const navigateToPremium = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    router.push('/profile/premium');
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
          <View style={styles.headerContent}>
            {/* Profile image */}
            <View style={styles.profileImageContainer}>
              <Image
                source={profile?.avatar_url ? { uri: profile.avatar_url } : require('@assets/images/default-avatar.png')}
                style={styles.profileImage}
              />
              
              {/* Premium badge */}
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Ionicons name="star" size={12} color="white" />
                </View>
              )}
            </View>
            
            {/* User info */}
            <View style={styles.userInfo}>
              <H2>{profile?.display_name || user?.email?.split('@')[0]}</H2>
              <Body1 style={styles.email}>{user?.email}</Body1>
              
              {/* Membership status */}
              <View style={styles.membershipRow}>
                <View 
                  style={[
                    styles.membershipBadge,
                    { 
                      backgroundColor: isPremium 
                        ? theme.colors.secondaryContainer 
                        : theme.colors.surfaceVariant,
                    },
                  ]}
                >
                  <Body2 
                    style={{ 
                      color: isPremium ? theme.colors.secondary : theme.colors.textSecondary,
                    }}
                  >
                    {isPremium ? 'プレミアム会員' : '無料会員'}
                  </Body2>
                </View>
                
                {!isPremium && (
                  <TouchableOpacity 
                    style={styles.upgradeButton}
                    onPress={navigateToPremium}
                  >
                    <Body2 color={theme.colors.primary}>アップグレード</Body2>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
          
          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={navigateToSettings}
            >
              <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Usage Stats */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>利用状況</H3>
          
          <View style={styles.statsGrid}>
            {/* Meditation Time */}
            <Card style={styles.statCard}>
              <View style={styles.statCardContent}>
                <Ionicons name="time-outline" size={24} color={theme.colors.primary} style={styles.statIcon} />
                <Body1 weight="medium" style={styles.statValue}>{stats.totalMeditationMinutes}分</Body1>
                <Body2 style={styles.statLabel}>瞑想時間</Body2>
              </View>
            </Card>
            
            {/* Meditation Streak */}
            <Card style={styles.statCard}>
              <View style={styles.statCardContent}>
                <Ionicons name="flame-outline" size={24} color={theme.colors.accent} style={styles.statIcon} />
                <Body1 weight="medium" style={styles.statValue}>{stats.meditationStreak}日</Body1>
                <Body2 style={styles.statLabel}>連続記録</Body2>
              </View>
            </Card>
            
            {/* Chat Messages */}
            <Card style={styles.statCard}>
              <View style={styles.statCardContent}>
                <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.secondary} style={styles.statIcon} />
                <Body1 weight="medium" style={styles.statValue}>{stats.totalChatMessages}</Body1>
                <Body2 style={styles.statLabel}>会話数</Body2>
              </View>
            </Card>
            
            {/* Favorite Activity */}
            <Card style={styles.statCard}>
              <View style={styles.statCardContent}>
                <Ionicons name="heart-outline" size={24} color={theme.colors.error} style={styles.statIcon} />
                <Body1 weight="medium" style={styles.statValue}>{stats.favoriteActivities[0]}</Body1>
                <Body2 style={styles.statLabel}>よく使う機能</Body2>
              </View>
            </Card>
          </View>
        </View>
        
        {/* Quick Settings */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>クイック設定</H3>
          
          <Card>
            <View style={styles.settingsList}>
              {/* Account settings */}
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => router.push('/profile/account')}
              >
                <Ionicons name="person-outline" size={24} color={theme.colors.primary} style={styles.settingsIcon} />
                <View style={styles.settingsContent}>
                  <Body1>アカウント設定</Body1>
                  <Body2 style={styles.settingsDescription}>プロフィール情報の編集</Body2>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              {/* Notifications */}
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => router.push('/profile/notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} style={styles.settingsIcon} />
                <View style={styles.settingsContent}>
                  <Body1>通知設定</Body1>
                  <Body2 style={styles.settingsDescription}>通知と思い出し設定</Body2>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              
              {/* Appearance */}
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => router.push('/profile/appearance')}
              >
                <Ionicons name="color-palette-outline" size={24} color={theme.colors.primary} style={styles.settingsIcon} />
                <View style={styles.settingsContent}>
                  <Body1>表示設定</Body1>
                  <Body2 style={styles.settingsDescription}>テーマとHSP向け視覚調整</Body2>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </Card>
        </View>
        
        {/* More Options */}
        <View style={styles.section}>
          <Card>
            <View style={styles.moreOptionsList}>
              {/* Help */}
              <TouchableOpacity
                style={styles.moreOption}
                onPress={() => router.push('/profile/help')}
              >
                <Ionicons name="help-circle-outline" size={22} color={theme.colors.text} style={styles.moreOptionIcon} />
                <Body1>ヘルプとサポート</Body1>
              </TouchableOpacity>
              
              {/* About */}
              <TouchableOpacity
                style={styles.moreOption}
                onPress={() => router.push('/profile/about')}
              >
                <Ionicons name="information-circle-outline" size={22} color={theme.colors.text} style={styles.moreOptionIcon} />
                <Body1>アプリについて</Body1>
              </TouchableOpacity>
              
              {/* Feedback */}
              <TouchableOpacity
                style={styles.moreOption}
                onPress={() => router.push('/profile/feedback')}
              >
                <Ionicons name="chatbox-outline" size={22} color={theme.colors.text} style={styles.moreOptionIcon} />
                <Body1>フィードバック</Body1>
              </TouchableOpacity>
              
              {/* Privacy */}
              <TouchableOpacity
                style={[styles.moreOption, styles.noBorder]}
                onPress={() => router.push('/profile/privacy')}
              >
                <Ionicons name="lock-closed-outline" size={22} color={theme.colors.text} style={styles.moreOptionIcon} />
                <Body1>プライバシーとセキュリティ</Body1>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
        
        {/* Version info */}
        <View style={styles.versionContainer}>
          <Body2 style={styles.versionText}>Fukuro v0.1.0</Body2>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    flex: 1,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  email: {
    marginTop: 4,
    opacity: 0.7,
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  membershipBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  upgradeButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  settingsList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsDescription: {
    marginTop: 2,
    opacity: 0.7,
  },
  moreOptionsList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  moreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  moreOptionIcon: {
    marginRight: 16,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  versionText: {
    opacity: 0.5,
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
