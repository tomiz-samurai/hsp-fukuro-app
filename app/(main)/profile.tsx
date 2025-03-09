/**
 * Profile Screen
 * 
 * The user profile and settings screen with HSP-friendly design.
 * Features account management, app settings, and user statistics.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import { H2, H3, Body1, Body2, Subtitle1, Subtitle2 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { useThemeStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled, setHapticsEnabled } = useAccessibilityStore();
  const { animationsEnabled, setAnimationsEnabled } = useAccessibilityStore();
  const { visualIntensity, setVisualIntensity } = useAccessibilityStore();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const resetState = useAuthStore((state) => state.resetState);
  
  // Stats state
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [meditationSessions, setMeditationSessions] = useState(0);
  
  // Load user stats
  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);
  
  // Load user statistics
  const loadStats = async () => {
    try {
      if (!user?.id) return;
      
      // Get meditation stats
      const totalTime = await MeditationService.getTotalMeditationTime(user.id);
      const streak = await MeditationService.getMeditationStreak(user.id);
      const sessions = await MeditationService.getMeditationHistory(user.id);
      
      setMeditationMinutes(totalTime);
      setMeditationStreak(streak);
      setMeditationSessions(sessions.length);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      Alert.alert(
        'サインアウトの確認',
        '本当にサインアウトしますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: 'サインアウト', 
            style: 'destructive',
            onPress: async () => {
              await signOut();
              resetState();
              
              if (hapticsEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          },
        ]
      );
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Handle visual intensity change
  const handleVisualIntensityChange = (value: number) => {
    setVisualIntensity(value);
  };
  
  // Toggle haptic feedback
  const toggleHaptics = () => {
    setHapticsEnabled(!hapticsEnabled);
    
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Toggle animations
  const toggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
    
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Toggle theme
  const handleToggleTheme = () => {
    toggleTheme();
    
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Format email for display
  const formatEmail = (email: string) => {
    if (!email) return '';
    
    // If email is too long, truncate with ellipsis
    if (email.length > 25) {
      return email.substring(0, 22) + '...';
    }
    
    return email;
  };
  
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header with user info */}
        <View style={styles.header}>
          <View style={styles.userContainer}>
            <View 
              style={[
                styles.avatarContainer, 
                { 
                  backgroundColor: theme.colors.surfaceVariant,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Image
                source={require('@assets/images/user-avatar-placeholder.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.userInfo}>
              <H2 style={styles.userName}>
                {profile?.display_name || user?.email?.split('@')[0] || 'ユーザー'}
              </H2>
              <Body1 style={styles.userEmail}>
                {formatEmail(user?.email || '')}
              </Body1>
              
              {/* Plan badge */}
              <View 
                style={[
                  styles.planBadge,
                  {
                    backgroundColor: isPremium ? theme.colors.secondary : theme.colors.surface,
                    borderColor: isPremium ? 'transparent' : theme.colors.outline,
                  },
                ]}
              >
                <Body2 
                  style={{ 
                    color: isPremium ? theme.colors.background : theme.colors.text,
                    fontFamily: theme.typography.fontFamily.medium,
                  }}
                >
                  {isPremium ? 'プレミアム会員' : '無料プラン'}
                </Body2>
              </View>
            </View>
          </View>
        </View>
        
        {/* Stats cards */}
        <View style={styles.statsRow}>
          {/* Meditation minutes */}
          <Card style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Ionicons 
                name="timer-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.statsIcon}
              />
              <H3 style={styles.statsValue}>{meditationMinutes}</H3>
              <Body2 style={styles.statsLabel}>瞑想分数</Body2>
            </View>
          </Card>
          
          {/* Meditation streak */}
          <Card style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Ionicons 
                name="flame-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.statsIcon}
              />
              <H3 style={styles.statsValue}>{meditationStreak}</H3>
              <Body2 style={styles.statsLabel}>連続日数</Body2>
            </View>
          </Card>
          
          {/* Meditation count */}
          <Card style={styles.statsCard}>
            <View style={styles.statsContent}>
              <Ionicons 
                name="checkbox-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.statsIcon}
              />
              <H3 style={styles.statsValue}>{meditationSessions}</H3>
              <Body2 style={styles.statsLabel}>セッション</Body2>
            </View>
          </Card>
        </View>
        
        {/* Settings sections */}
        <View style={styles.settingsSection}>
          <Subtitle1 style={styles.sectionTitle}>アカウント設定</Subtitle1>
          
          {/* Edit profile */}
          <Card style={styles.settingCard}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/profile/edit')}
            >
              <View style={styles.settingInfo}>
                <Ionicons 
                  name="person-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <Body1>プロフィール編集</Body1>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
          
          {/* Upgrade to premium */}
          {!isPremium && (
            <Card 
              style={styles.premiumCard}
              backgroundColor={theme.colors.secondaryContainer}
              onPress={() => router.push('/profile/premium')}
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
                    すべての機能にアクセスして、さらに快適なHSP体験を。
                  </Body1>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </Card>
          )}
        </View>
        
        <View style={styles.settingsSection}>
          <Subtitle1 style={styles.sectionTitle}>アプリ設定</Subtitle1>
          
          {/* Theme toggle */}
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons 
                  name={isDarkTheme ? "moon-outline" : "sunny-outline"}
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <Body1>ダークモード</Body1>
              </View>
              <Switch
                value={isDarkTheme}
                onValueChange={handleToggleTheme}
                trackColor={{
                  false: theme.colors.surfaceVariant,
                  true: `${theme.colors.primary}99`,
                }}
                thumbColor={isDarkTheme ? theme.colors.primary : theme.colors.surface}
                ios_backgroundColor={theme.colors.surfaceVariant}
              />
            </View>
          </Card>
          
          {/* Animations toggle */}
          <Card style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons 
                  name="pulse-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <Body1>アニメーション</Body1>
              </View>
              <Switch
                value={animationsEnabled}
                onValueChange={toggleAnimations}
                trackColor={{
                  false: theme.colors.surfaceVariant,
                  true: `${theme.colors.primary}99`,
                }}
                thumbColor={animationsEnabled ? theme.colors.primary : theme.colors.surface}
                ios_backgroundColor={theme.colors.surfaceVariant}
              />
            </View>
          </Card>
          
          {/* Haptic feedback toggle */}
          {Platform.OS !== 'web' && (
            <Card style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons 
                    name="vibrate-outline"
                    size={22}
                    color={theme.colors.primary}
                    style={styles.settingIcon}
                  />
                  <Body1>触覚フィードバック</Body1>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={toggleHaptics}
                  trackColor={{
                    false: theme.colors.surfaceVariant,
                    true: `${theme.colors.primary}99`,
                  }}
                  thumbColor={hapticsEnabled ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
            </Card>
          )}
          
          {/* Visual intensity - HSP specific setting */}
          <Card style={styles.settingCard}>
            <View style={[styles.settingRow, styles.visualIntensitySetting]}>
              <View style={styles.settingInfo}>
                <Ionicons 
                  name="contrast-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <View>
                  <Body1>視覚強度</Body1>
                  <Body2 style={styles.settingDescription}>
                    視覚的な強さを調整して、HSPに優しい表示にします
                  </Body2>
                </View>
              </View>
            </View>
            
            {/* Visual intensity slider */}
            <View style={styles.sliderContainer}>
              <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
              
              {/* This would be a custom slider in a real app */}
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
              
              <Ionicons name="eye" size={16} color={theme.colors.textSecondary} />
            </View>
            
            <View style={styles.sliderLabels}>
              <Body2 style={styles.sliderLabel}>穏やか</Body2>
              <Body2 style={styles.sliderLabel}>標準</Body2>
            </View>
          </Card>
        </View>
        
        <View style={styles.settingsSection}>
          <Subtitle1 style={styles.sectionTitle}>情報</Subtitle1>
          
          {/* About */}
          <Card style={styles.settingCard}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/profile/about')}
            >
              <View style={styles.settingInfo}>
                <Ionicons 
                  name="information-circle-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <Body1>Fukuroについて</Body1>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
          
          {/* Help */}
          <Card style={styles.settingCard}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/profile/help')}
            >
              <View style={styles.settingInfo}>
                <Ionicons 
                  name="help-circle-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <Body1>ヘルプとサポート</Body1>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
          
          {/* Privacy */}
          <Card style={styles.settingCard}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => router.push('/profile/privacy')}
            >
              <View style={styles.settingInfo}>
                <Ionicons 
                  name="shield-outline"
                  size={22}
                  color={theme.colors.primary}
                  style={styles.settingIcon}
                />
                <Body1>プライバシーポリシー</Body1>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>
        
        {/* Sign out button */}
        <TouchableOpacity
          style={[
            styles.signOutButton,
            { borderColor: theme.colors.outline },
          ]}
          onPress={handleSignOut}
        >
          <Ionicons 
            name="log-out-outline"
            size={20}
            color={theme.colors.error}
            style={styles.signOutIcon}
          />
          <Body1 color={theme.colors.error}>サインアウト</Body1>
        </TouchableOpacity>
        
        {/* App version */}
        <Body2 style={styles.versionText}>
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
    marginBottom: 24,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
    marginBottom: 8,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
  },
  statsContent: {
    padding: 12,
    alignItems: 'center',
  },
  statsIcon: {
    marginBottom: 8,
  },
  statsValue: {
    marginBottom: 4,
  },
  statsLabel: {
    opacity: 0.7,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontFamily: 'NotoSansJP-Medium',
  },
  settingCard: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  visualIntensitySetting: {
    paddingBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sliderLabel: {
    opacity: 0.6,
  },
  premiumCard: {
    marginBottom: 12,
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 24,
    borderRadius: 8,
    borderWidth: 1,
  },
  signOutIcon: {
    marginRight: 8,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
});
