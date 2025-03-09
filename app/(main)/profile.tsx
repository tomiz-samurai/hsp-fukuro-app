/**
 * Profile Screen
 * 
 * User profile and settings screen with HSP-friendly design.
 * Features account management, preferences, and accessibility settings.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useThemeStore, useAccessibilityStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Profile section
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled, setHapticsEnabled, visualIntensity, setVisualIntensity, animationsEnabled, setAnimationsEnabled } = useAccessibilityStore();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const setPremiumStatus = useAuthStore((state) => state.setPremiumStatus);
  
  // State for stats
  const [totalMeditationMinutes, setTotalMeditationMinutes] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [userSince, setUserSince] = useState('');
  
  // Load user stats
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);
  
  // Load user stats
  const loadUserStats = async () => {
    try {
      // Get total meditation time
      const totalTime = await MeditationService.getTotalMeditationTime(user!.id);
      setTotalMeditationMinutes(totalTime);
      
      // Get meditation streak
      const streak = await MeditationService.getMeditationStreak(user!.id);
      setMeditationStreak(streak);
      
      // Calculate user since date
      if (user?.created_at) {
        const date = new Date(user.created_at);
        setUserSince(`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };
  
  // Toggle premium status (for demo)
  const togglePremiumStatus = () => {
    setPremiumStatus(!isPremium);
    
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.notificationAsync(
        isPremium ? 
          Haptics.NotificationFeedbackType.Warning : 
          Haptics.NotificationFeedbackType.Success
      );
    }
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              
              // Haptic feedback
              if (hapticsEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        },
      ]
    );
  };
  
  // Render setting item with toggle
  const renderToggleSetting = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon: string,
    iconColor = theme.colors.primary
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Body1 weight="medium">{title}</Body1>
        <Body2 style={styles.settingDescription}>{description}</Body2>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d0d0d0', true: `${theme.colors.primary}80` }}
        thumbColor={value ? theme.colors.primary : '#f4f4f4'}
        ios_backgroundColor="#d0d0d0"
      />
    </View>
  );
  
  // Render navigation setting item
  const renderNavigationSetting = (
    title: string,
    description: string,
    onPress: () => void,
    icon: string,
    iconColor = theme.colors.primary
  ) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>
      <View style={styles.settingContent}>
        <Body1 weight="medium">{title}</Body1>
        <Body2 style={styles.settingDescription}>{description}</Body2>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
    </TouchableOpacity>
  );
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
        </View>
        
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={
                  profile?.avatar_url
                    ? { uri: profile.avatar_url }
                    : require('@assets/images/default-avatar.png')
                }
                style={styles.avatar}
              />
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Ionicons name="star" size={12} color="white" />
                </View>
              )}
            </View>
            
            <View style={styles.userDetails}>
              <H3>{profile?.display_name || user?.email || 'ユーザー'}</H3>
              <Body2 style={styles.userEmail}>{user?.email}</Body2>
              <View style={styles.userStatusContainer}>
                <Body2 style={styles.userStatus}>
                  {isPremium ? 'プレミアム会員' : '無料会員'}
                </Body2>
                {!isPremium && (
                  <TouchableOpacity style={styles.upgradeButton} onPress={togglePremiumStatus}>
                    <Body2 style={{ color: theme.colors.primary }}>アップグレード</Body2>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Card>
        
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <H3 style={styles.cardTitle}>統計</H3>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <H3 style={styles.statValue}>{totalMeditationMinutes}</H3>
              <Body2 style={styles.statLabel}>瞑想時間(分)</Body2>
            </View>
            
            <View style={styles.statItem}>
              <H3 style={styles.statValue}>{meditationStreak}</H3>
              <Body2 style={styles.statLabel}>連続日数</Body2>
            </View>
            
            <View style={styles.statItem}>
              <H3 style={styles.statValue}>24</H3>
              <Body2 style={styles.statLabel}>セッション数</Body2>
            </View>
          </View>
          
          <Body2 style={styles.memberSince}>
            {userSince ? `${userSince}から利用開始` : ''}
          </Body2>
        </Card>
        
        {/* Theme & Appearance Settings */}
        <Card style={styles.settingsCard}>
          <H3 style={styles.cardTitle}>テーマと外観</H3>
          
          {renderToggleSetting(
            'ダークモード',
            '画面の明るさを抑え、目の負担を軽減します',
            isDarkTheme,
            toggleTheme,
            'moon'
          )}
          
          {renderToggleSetting(
            'アニメーション',
            'アニメーション効果の有効/無効を切り替えます',
            animationsEnabled,
            setAnimationsEnabled,
            'film'
          )}
          
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="contrast" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.settingContent}>
              <Body1 weight="medium">視覚強度</Body1>
              <Body2 style={styles.settingDescription}>
                色の鮮やかさや明るさを調整します: {visualIntensity}%
              </Body2>
              
              {/* Custom slider for visual intensity */}
              <View style={styles.sliderContainer}>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill,
                      { 
                        width: `${visualIntensity}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <View style={styles.sliderLabels}>
                  <Body2>静か</Body2>
                  <Body2>標準</Body2>
                </View>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Accessibility Settings */}
        <Card style={styles.settingsCard}>
          <H3 style={styles.cardTitle}>アクセシビリティ</H3>
          
          {renderToggleSetting(
            '触覚フィードバック',
            'ボタン操作時の振動フィードバックを有効にします',
            hapticsEnabled,
            setHapticsEnabled,
            'radio'
          )}
          
          {renderNavigationSetting(
            'テキストサイズ',
            '文字の大きさを調整します',
            () => {
              // Navigate to text size settings
              // This would be implemented in a real app
              Alert.alert('機能準備中', 'この機能は準備中です。');
            },
            'text'
          )}
        </Card>
        
        {/* Account Settings */}
        <Card style={styles.settingsCard}>
          <H3 style={styles.cardTitle}>アカウント</H3>
          
          {renderNavigationSetting(
            '通知設定',
            'アプリからの通知設定を管理します',
            () => {
              // Navigate to notification settings
              // This would be implemented in a real app
              Alert.alert('機能準備中', 'この機能は準備中です。');
            },
            'notifications'
          )}
          
          {renderNavigationSetting(
            'パスワード変更',
            'アカウントのパスワードを変更します',
            () => {
              // Navigate to password change
              // This would be implemented in a real app
              Alert.alert('機能準備中', 'この機能は準備中です。');
            },
            'key'
          )}
          
          {renderNavigationSetting(
            '利用規約',
            'アプリの利用規約を確認します',
            () => {
              // Navigate to terms of service
              // This would be implemented in a real app
              Alert.alert('機能準備中', 'この機能は準備中です。');
            },
            'document-text'
          )}
          
          {/* Sign Out Button */}
          <TouchableOpacity
            style={[styles.signOutButton, { borderColor: theme.colors.error }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out" size={20} color={theme.colors.error} />
            <Body1 style={{ color: theme.colors.error, marginLeft: 8 }}>
              ログアウト
            </Body1>
          </TouchableOpacity>
        </Card>
        
        {/* Version info */}
        <View style={styles.versionInfo}>
          <Body2 style={styles.versionText}>Fukuro バージョン 0.1.0</Body2>
          <Body2 style={styles.versionText}>© 2025 Fukuro Team</Body2>
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
    marginBottom: 20,
  },
  userCard: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    marginTop: 4,
    opacity: 0.7,
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  userStatus: {
    opacity: 0.8,
  },
  upgradeButton: {
    marginLeft: 8,
    padding: 4,
  },
  statsCard: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  memberSince: {
    marginTop: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  settingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  sliderContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  versionText: {
    opacity: 0.5,
  },
});
