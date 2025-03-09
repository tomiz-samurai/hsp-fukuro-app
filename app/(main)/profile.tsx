/**
 * Profile Screen
 * 
 * User profile screen showing account information, usage stats,
 * and app settings with HSP-friendly design.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

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
  const { hapticsEnabled, visualIntensity, animationsEnabled, setHapticsEnabled, setVisualIntensity, setAnimationsEnabled } = useAccessibilityStore();
  const { isPremium } = useAuthStore();
  
  // State
  const [totalMeditationTime, setTotalMeditationTime] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Load user stats
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);
  
  // Load user statistics
  const loadUserStats = async () => {
    try {
      setIsLoadingStats(true);
      
      // Get total meditation time
      const totalTime = await MeditationService.getTotalMeditationTime(user!.id);
      setTotalMeditationTime(totalTime);
      
      // Get meditation streak
      const streak = await MeditationService.getMeditationStreak(user!.id);
      setMeditationStreak(streak);
      
      setIsLoadingStats(false);
    } catch (error) {
      console.error('Error loading user stats:', error);
      setIsLoadingStats(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: async () => {
            // Haptic feedback
            if (hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            
            // Sign out
            await signOut();
          },
        },
      ]
    );
  };
  
  // Handle visual intensity change
  const handleVisualIntensityChange = (value: number) => {
    setVisualIntensity(value);
  };
  
  // Format time in minutes to hours and minutes
  const formatMeditationTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours}時間`;
    }
    
    return `${hours}時間${mins}分`;
  };
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
          <Body1 style={styles.subtitle}>
            アカウント情報と設定
          </Body1>
        </View>
        
        {/* User info */}
        <Card style={styles.userCard}>
          <View style={styles.userCardContent}>
            {/* User avatar */}
            <View style={[styles.avatarContainer, { backgroundColor: theme.colors.primary }]}>
              <Body1 style={{ color: 'white', fontSize: 24 }}>
                {profile?.display_name?.[0] || user?.email?.[0] || 'U'}
              </Body1>
            </View>
            
            {/* User details */}
            <View style={styles.userInfo}>
              <H3>{profile?.display_name || '匿名ユーザー'}</H3>
              <Body1>{user?.email}</Body1>
              <View style={styles.membershipBadge}>
                <Ionicons 
                  name={isPremium ? 'star' : 'person'} 
                  size={14} 
                  color={isPremium ? theme.colors.secondary : theme.colors.text}
                  style={styles.membershipIcon}
                />
                <Body2 
                  color={isPremium ? theme.colors.secondary : undefined}
                  weight={isPremium ? 'medium' : 'regular'}
                >
                  {isPremium ? 'プレミアム会員' : '無料会員'}
                </Body2>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.sectionHeader}>
            <H3>統計</H3>
          </View>
          
          <View style={styles.statsContainer}>
            {/* Meditation time */}
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              <View style={styles.statContent}>
                <Subtitle1>{formatMeditationTime(totalMeditationTime)}</Subtitle1>
                <Body2>瞑想合計時間</Body2>
              </View>
            </View>
            
            {/* Meditation streak */}
            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={24} color={theme.colors.primary} />
              <View style={styles.statContent}>
                <Subtitle1>{meditationStreak}日</Subtitle1>
                <Body2>連続達成</Body2>
              </View>
            </View>
            
            {/* Sessions */}
            <View style={styles.statItem}>
              <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
              <View style={styles.statContent}>
                <Subtitle1>{Math.floor(totalMeditationTime / 10) || 0}回</Subtitle1>
                <Body2>セッション数</Body2>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Accessibility settings */}
        <Card style={styles.settingsCard}>
          <View style={styles.sectionHeader}>
            <H3>感覚過敏設定</H3>
            <TouchableOpacity>
              <Body2 color={theme.colors.primary}>ヘルプ</Body2>
            </TouchableOpacity>
          </View>
          
          {/* Visual intensity slider */}
          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <Subtitle2>視覚刺激の強さ</Subtitle2>
              <Body2>{visualIntensity}%</Body2>
            </View>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderTrack}>
                <View 
                  style={[
                    styles.sliderFill, 
                    { 
                      width: `${visualIntensity}%`,
                      backgroundColor: theme.colors.primary, 
                    }
                  ]}
                />
              </View>
              <View style={styles.sliderLabels}>
                <Body2>弱</Body2>
                <Body2>強</Body2>
              </View>
            </View>
            <Body2 style={styles.settingDescription}>
              色の鮮やかさやコントラストの強さを調整します。低い値に設定すると、目に優しい表示になります。
            </Body2>
          </View>
          
          {/* Haptic feedback */}
          <View style={styles.settingItem}>
            <View style={styles.switchSettingLabel}>
              <View>
                <Subtitle2>触覚フィードバック</Subtitle2>
                <Body2 style={styles.settingDescription}>
                  タップ時の振動フィードバックを設定します。
                </Body2>
              </View>
              <Switch 
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: '#d0d0d0', true: `${theme.colors.primary}80` }}
                thumbColor={hapticsEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
          
          {/* Animations */}
          <View style={styles.settingItem}>
            <View style={styles.switchSettingLabel}>
              <View>
                <Subtitle2>アニメーション</Subtitle2>
                <Body2 style={styles.settingDescription}>
                  画面遷移やUI要素のアニメーションを設定します。
                </Body2>
              </View>
              <Switch 
                value={animationsEnabled}
                onValueChange={setAnimationsEnabled}
                trackColor={{ false: '#d0d0d0', true: `${theme.colors.primary}80` }}
                thumbColor={animationsEnabled ? theme.colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </Card>
        
        {/* Premium upgrade */}
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
                  すべての機能とコンテンツにアクセスできます。広告なし、無制限セッション。
                </Body1>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.secondary} />
            </View>
          </Card>
        )}
        
        {/* Options */}
        <Card style={styles.optionsCard}>
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/profile/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
            <Body1 style={styles.optionText}>アプリ設定</Body1>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/profile/help')}
          >
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.text} />
            <Body1 style={styles.optionText}>ヘルプとサポート</Body1>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => router.push('/profile/about')}
          >
            <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} />
            <Body1 style={styles.optionText}>Fukuroについて</Body1>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          
          <View style={styles.separator} />
          
          <TouchableOpacity 
            style={[styles.optionItem, styles.signOutOption]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={24} color={theme.colors.error} />
            <Body1 style={[styles.optionText, { color: theme.colors.error }]}>ログアウト</Body1>
          </TouchableOpacity>
        </Card>
        
        {/* Version info */}
        <View style={styles.versionInfo}>
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
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  userCard: {
    marginBottom: 16,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  membershipIcon: {
    marginRight: 4,
  },
  statsCard: {
    marginBottom: 16,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statContent: {
    alignItems: 'center',
    marginTop: 8,
  },
  settingsCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginBottom: 4,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingDescription: {
    opacity: 0.7,
    marginTop: 4,
  },
  switchSettingLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  optionsCard: {
    marginBottom: 16,
    padding: 8, 
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionText: {
    flex: 1,
    marginLeft: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  signOutOption: {
    marginTop: 8,
  },
  versionInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  versionText: {
    opacity: 0.5,
  },
});
