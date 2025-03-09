/**
 * Profile Screen
 * 
 * User profile and settings screen with HSP-friendly design.
 * Displays user information, stats, and access to settings.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Switch,
  ScrollView,
  Alert,
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
import { useToastStore } from '@store/slices/uiSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { showToast } = useToastStore();
  const { hapticsEnabled, setHapticsEnabled, visualIntensity, setVisualIntensity } = useAccessibilityStore();
  
  // Auth store
  const isPremium = useAuthStore((state) => state.isPremium);
  const updateUserPreferences = useAuthStore((state) => state.updateUserPreferences);
  
  // State for user preferences
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    useAuthStore((state) => state.userPreferences.notificationsEnabled)
  );
  const [soundEnabled, setSoundEnabled] = useState(
    useAuthStore((state) => state.userPreferences.soundEnabled)
  );
  
  // Stats
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [meditationCount, setMeditationCount] = useState(0);
  const [streak, setStreak] = useState(0);
  
  // Save preferences when changed
  useEffect(() => {
    updateUserPreferences({
      notificationsEnabled,
      soundEnabled,
    });
  }, [notificationsEnabled, soundEnabled]);
  
  // Mock stat data
  useEffect(() => {
    // In a real app, these would be fetched from the backend
    setMeditationMinutes(76);
    setMeditationCount(8);
    setStreak(3);
  }, []);
  
  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'ログアウトの確認',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Router will redirect to login via AuthProvider
            } catch (error) {
              console.error('Error signing out:', error);
              showToast('ログアウト中にエラーが発生しました。', 'error');
            }
          },
        },
      ]
    );
  };
  
  // Handle premium subscription button
  const handleSubscribe = () => {
    router.push('/profile/subscription');
  };
  
  // Navigation to settings
  const navigateToSettings = () => {
    router.push('/profile/settings');
  };
  
  // Navigation to edit profile
  const navigateToEditProfile = () => {
    router.push('/profile/edit');
  };
  
  // Get display name or email
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'ユーザー';
  
  return (
    <ScreenWrapper>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
          
          {/* Settings button */}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={navigateToSettings}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <H3 style={{ color: theme.colors.background }}>
                    {displayName.charAt(0).toUpperCase()}
                  </H3>
                </View>
              )}
              
              {/* Edit button */}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: theme.colors.surface }]}
                onPress={navigateToEditProfile}
              >
                <Ionicons name="pencil" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            
            {/* User info */}
            <View style={styles.userInfo}>
              <H3>{displayName}</H3>
              <Body2>{user?.email}</Body2>
              
              {/* Premium badge */}
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Body2 style={{ color: theme.colors.background }}>
                    プレミアム
                  </Body2>
                </View>
              )}
            </View>
          </View>
        </Card>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Meditation Time */}
          <Card style={styles.statsCard}>
            <View style={styles.statContent}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <H3 style={styles.statNumber}>{meditationMinutes}</H3>
              <Body2>瞑想分数</Body2>
            </View>
          </Card>
          
          {/* Meditation Count */}
          <Card style={styles.statsCard}>
            <View style={styles.statContent}>
              <Ionicons name="leaf-outline" size={24} color={theme.colors.primary} />
              <H3 style={styles.statNumber}>{meditationCount}</H3>
              <Body2>瞑想回数</Body2>
            </View>
          </Card>
          
          {/* Streak */}
          <Card style={styles.statsCard}>
            <View style={styles.statContent}>
              <Ionicons name="flame-outline" size={24} color={theme.colors.primary} />
              <H3 style={styles.statNumber}>{streak}</H3>
              <Body2>連続日数</Body2>
            </View>
          </Card>
        </View>
        
        {/* Settings */}
        <Card style={styles.settingsCard}>
          <H3 style={styles.settingsTitle}>設定</H3>
          
          {/* Haptic Feedback */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Body1>触覚フィードバック</Body1>
              <Body2 style={styles.settingDescription}>
                タッチ時の振動フィードバック
              </Body2>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={(value) => {
                setHapticsEnabled(value);
                if (value) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          
          {/* Sound Effects */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Body1>サウンド効果</Body1>
              <Body2 style={styles.settingDescription}>
                UI操作時の効果音
              </Body2>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          
          {/* Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Body1>通知</Body1>
              <Body2 style={styles.settingDescription}>
                瞑想やセッションのリマインダー
              </Body2>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          
          {/* Visual Intensity - For HSP users */}
          <View style={styles.visualIntensityContainer}>
            <View style={styles.intensityLabelContainer}>
              <Body1>視覚強度</Body1>
              <Body2 style={styles.settingDescription}>
                視覚的な刺激の強さを調整します
              </Body2>
            </View>
            <View style={styles.intensitySlider}>
              <TouchableOpacity
                onPress={() => setVisualIntensity(Math.max(50, visualIntensity - 10))}
              >
                <Ionicons name="remove-circle-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderFill, 
                    { 
                      width: `${visualIntensity}%`,
                      backgroundColor: theme.colors.primary
                    }
                  ]} 
                />
              </View>
              
              <TouchableOpacity
                onPress={() => setVisualIntensity(Math.min(100, visualIntensity + 10))}
              >
                <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
            <Body2 style={styles.intensityValue}>{visualIntensity}%</Body2>
          </View>
        </Card>
        
        {/* Premium Upsell or Account Options */}
        {!isPremium ? (
          <Card 
            style={styles.premiumCard} 
            backgroundColor={theme.colors.secondaryContainer}
            onPress={handleSubscribe}
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
                  すべての機能とコンテンツにアクセスできます。
                </Body1>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.secondary} />
            </View>
          </Card>
        ) : (
          <Card style={styles.accountCard}>
            <View style={styles.accountCardContent}>
              <Subtitle1 weight="medium">アカウント情報</Subtitle1>
              <Body1>
                プレミアム会員: {isPremium ? '有効' : '無効'}
              </Body1>
              <Body2>
                有効期限: 2025年12月31日まで
              </Body2>
            </View>
          </Card>
        )}
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Body1 style={[styles.logoutText, { color: theme.colors.error }]}>
            ログアウト
          </Body1>
        </TouchableOpacity>
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
    alignItems: 'center',
    marginBottom: 20,
  },
  settingsButton: {
    padding: 8,
  },
  profileCard: {
    marginBottom: 16,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
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
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  userInfo: {
    flex: 1,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsCard: {
    width: '31%',
    padding: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    marginVertical: 8,
  },
  settingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  settingsTitle: {
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  visualIntensityContainer: {
    paddingVertical: 12,
  },
  intensityLabelContainer: {
    marginBottom: 12,
  },
  intensitySlider: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginHorizontal: 8,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  intensityValue: {
    textAlign: 'right',
    marginTop: 4,
    opacity: 0.7,
  },
  premiumCard: {
    marginBottom: 16,
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
  accountCard: {
    marginBottom: 16,
    padding: 16,
  },
  accountCardContent: {
    
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  logoutText: {
    marginLeft: 8,
  },
});
