/**
 * Profile Screen
 * 
 * User profile and settings with HSP-friendly design.
 * Features account management, preferences, and accessibility options.
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
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useThemeStore, useAccessibilityStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const { 
    visualIntensity, 
    setVisualIntensity,
    animationsEnabled, 
    setAnimationsEnabled,
    hapticsEnabled, 
    setHapticsEnabled,
  } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // Stats state
  const [meditationMinutes, setMeditationMinutes] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  
  // Load user stats
  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);
  
  // Load user statistics
  const loadStats = async () => {
    try {
      // Load meditation stats
      const totalTime = await MeditationService.getTotalMeditationTime(user?.id || '');
      const streak = await MeditationService.getMeditationStreak(user?.id || '');
      
      setMeditationMinutes(totalTime);
      setMeditationStreak(streak);
    } catch (error) {
      console.error('Error loading user stats:', error);
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
            } catch (error) {
              console.error('Error signing out:', error);
            }
          }
        },
      ]
    );
  };
  
  // Handle haptic feedback toggle
  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    
    // Provide feedback when enabling
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Get displayed user name
  const displayName = profile?.display_name || user?.email?.split('@')[0] || '匿名ユーザー';
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
        </View>
        
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.userContent}>
            {/* User avatar */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <H2>{displayName.charAt(0).toUpperCase()}</H2>
              </View>
            </View>
            
            {/* User info */}
            <View style={styles.userInfo}>
              <H3>{displayName}</H3>
              <Body1>{user?.email}</Body1>
              
              {/* Premium badge */}
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Body2 style={{ color: theme.colors.background }}>プレミアム会員</Body2>
                </View>
              )}
            </View>
          </View>
        </Card>
        
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Subtitle1 weight="medium">統計</Subtitle1>
          </View>
          
          <View style={styles.statsGrid}>
            {/* Meditation time */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time-outline" size={24} color={theme.colors.primary} />
              </View>
              <H3>{meditationMinutes}</H3>
              <Body2>瞑想時間（分）</Body2>
            </View>
            
            {/* Meditation streak */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="flame-outline" size={24} color={theme.colors.primary} />
              </View>
              <H3>{meditationStreak}</H3>
              <Body2>連続日数</Body2>
            </View>
            
            {/* Completed sessions */}
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle-outline" size={24} color={theme.colors.primary} />
              </View>
              <H3>{Math.floor(meditationMinutes / 10)}</H3>
              <Body2>完了セッション</Body2>
            </View>
          </View>
        </Card>
        
        {/* Accessibility Settings */}
        <Card style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <Subtitle1 weight="medium">アクセシビリティ設定</Subtitle1>
          </View>
          
          {/* Dark mode toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Body1 weight="medium">ダークモード</Body1>
              <Body2>暗い配色にします</Body2>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D9D9D9', true: `${theme.colors.primary}80` }}
              thumbColor={isDarkTheme ? theme.colors.primary : '#F4F3F4'}
            />
          </View>
          
          {/* Animations toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Body1 weight="medium">アニメーション</Body1>
              <Body2>画面上の動きを制御します</Body2>
            </View>
            <Switch
              value={animationsEnabled}
              onValueChange={setAnimationsEnabled}
              trackColor={{ false: '#D9D9D9', true: `${theme.colors.primary}80` }}
              thumbColor={animationsEnabled ? theme.colors.primary : '#F4F3F4'}
            />
          </View>
          
          {/* Haptic feedback toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Body1 weight="medium">触覚フィードバック</Body1>
              <Body2>タップ時の振動を制御します</Body2>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ false: '#D9D9D9', true: `${theme.colors.primary}80` }}
              thumbColor={hapticsEnabled ? theme.colors.primary : '#F4F3F4'}
            />
          </View>
          
          {/* Visual intensity slider (simplified for MVP) */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Body1 weight="medium">視覚強度</Body1>
              <Body2>色の強さとコントラストを調整します</Body2>
            </View>
            <View style={styles.visualIntensityControls}>
              <TouchableOpacity
                onPress={() => setVisualIntensity(Math.max(30, visualIntensity - 10))}
                disabled={visualIntensity <= 30}
                style={[
                  styles.intensityButton,
                  visualIntensity <= 30 && styles.disabledButton,
                ]}
              >
                <Body1>-</Body1>
              </TouchableOpacity>
              
              <Body2 style={styles.intensityValue}>{visualIntensity}%</Body2>
              
              <TouchableOpacity
                onPress={() => setVisualIntensity(Math.min(100, visualIntensity + 10))}
                disabled={visualIntensity >= 100}
                style={[
                  styles.intensityButton,
                  visualIntensity >= 100 && styles.disabledButton,
                ]}
              >
                <Body1>+</Body1>
              </TouchableOpacity>
            </View>
          </View>
        </Card>
        
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
                  すべての機能にアクセスして、広告なしでアプリを楽しめます。
                </Body1>
              </View>
            </View>
          </Card>
        )}
        
        {/* Sign Out Button */}
        <Button
          label="ログアウト"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
        
        {/* App Version */}
        <Body2 style={styles.versionText}>
          バージョン 0.1.0
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
    marginBottom: 20,
  },
  userCard: {
    marginBottom: 16,
  },
  userContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#62A5BF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsHeader: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(98, 165, 191, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingsHeader: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  visualIntensityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  intensityValue: {
    marginHorizontal: 12,
    minWidth: 40,
    textAlign: 'center',
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
  signOutButton: {
    marginBottom: 24,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
});
