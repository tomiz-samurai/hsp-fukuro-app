/**
 * Profile Screen
 * 
 * User profile and settings screen with HSP-friendly design.
 * Shows user information, statistics, and settings options.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
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

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled, setHapticsEnabled, visualIntensity, setVisualIntensity, animationsEnabled, setAnimationsEnabled } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const resetState = useAuthStore((state) => state.resetState);
  
  // State
  const [totalMeditationMinutes, setTotalMeditationMinutes] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load user statistics
  useEffect(() => {
    if (user?.id) {
      loadUserStatistics();
    }
  }, [user?.id]);
  
  // Load user statistics
  const loadUserStatistics = async () => {
    try {
      setIsLoading(true);
      
      // Get total meditation time
      const totalMinutes = await MeditationService.getTotalMeditationTime(user?.id || '');
      setTotalMeditationMinutes(totalMinutes);
      
      // Get meditation streak
      const streak = await MeditationService.getMeditationStreak(user?.id || '');
      setMeditationStreak(streak);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user statistics:', error);
      setIsLoading(false);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Confirm sign out
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
            onPress: async () => {
              // Sign out
              await signOut();
              
              // Reset state
              resetState();
              
              // Haptic feedback
              if (hapticsEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error signing out:', error);
      
      Alert.alert('エラー', 'ログアウト中にエラーが発生しました。');
    }
  };
  
  // Toggle haptic feedback
  const toggleHaptics = () => {
    setHapticsEnabled(!hapticsEnabled);
    
    // Provide feedback if enabling
    if (!hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Toggle animations
  const toggleAnimations = () => {
    setAnimationsEnabled(!animationsEnabled);
    
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle visual intensity change
  const handleVisualIntensityChange = (value: 'low' | 'medium' | 'high') => {
    let intensity = 0;
    
    switch (value) {
      case 'low':
        intensity = 50;
        break;
      case 'medium':
        intensity = 75;
        break;
      case 'high':
        intensity = 100;
        break;
    }
    
    setVisualIntensity(intensity);
    
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Get current visual intensity level
  const getVisualIntensityLevel = (): 'low' | 'medium' | 'high' => {
    if (visualIntensity <= 50) {
      return 'low';
    } else if (visualIntensity <= 75) {
      return 'medium';
    } else {
      return 'high';
    }
  };
  
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile?.avatar_url ? (
              <Image 
                source={{ uri: profile.avatar_url }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.primary }]}>
                <H2 style={{ color: theme.colors.background }}>
                  {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </H2>
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <H2>{profile?.display_name || 'ユーザー'}</H2>
            <Body1>{user?.email}</Body1>
            
            {/* Premium badge */}
            {isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                <Body2 style={{ color: theme.colors.background }}>プレミアム会員</Body2>
              </View>
            )}
          </View>
        </View>
        
        {/* Statistics Section */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>統計</H3>
          
          <View style={styles.statsContainer}>
            {/* Meditation stats */}
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons 
                  name="time-outline" 
                  size={28} 
                  color={theme.colors.primary} 
                  style={styles.statIcon}
                />
                <View>
                  <H3>{totalMeditationMinutes}</H3>
                  <Body2>瞑想時間（分）</Body2>
                </View>
              </View>
            </Card>
            
            {/* Streak stat */}
            <Card style={styles.statCard}>
              <View style={styles.statContent}>
                <Ionicons 
                  name="flame-outline" 
                  size={28} 
                  color={theme.colors.accent} 
                  style={styles.statIcon}
                />
                <View>
                  <H3>{meditationStreak}</H3>
                  <Body2>連続日数</Body2>
                </View>
              </View>
            </Card>
          </View>
        </View>
        
        {/* HSP Settings Section */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>HSP向け設定</H3>
          
          <Card style={styles.settingsCard}>
            {/* Visual intensity setting */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="eye-outline" size={24} color={theme.colors.text} style={styles.settingIcon} />
                <View>
                  <Body1>視覚的な強度</Body1>
                  <Body2 style={{ opacity: 0.7 }}>色やコントラストの強さを調整します</Body2>
                </View>
              </View>
              
              <View style={styles.intensitySelector}>
                <TouchableOpacity
                  style={[
                    styles.intensityOption,
                    getVisualIntensityLevel() === 'low' && styles.selectedIntensity,
                    getVisualIntensityLevel() === 'low' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleVisualIntensityChange('low')}
                >
                  <Body2 
                    style={[
                      getVisualIntensityLevel() === 'low' && { color: theme.colors.background },
                    ]}
                  >
                    弱
                  </Body2>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.intensityOption,
                    getVisualIntensityLevel() === 'medium' && styles.selectedIntensity,
                    getVisualIntensityLevel() === 'medium' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleVisualIntensityChange('medium')}
                >
                  <Body2 
                    style={[
                      getVisualIntensityLevel() === 'medium' && { color: theme.colors.background },
                    ]}
                  >
                    中
                  </Body2>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.intensityOption,
                    getVisualIntensityLevel() === 'high' && styles.selectedIntensity,
                    getVisualIntensityLevel() === 'high' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => handleVisualIntensityChange('high')}
                >
                  <Body2 
                    style={[
                      getVisualIntensityLevel() === 'high' && { color: theme.colors.background },
                    ]}
                  >
                    強
                  </Body2>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            {/* Haptic feedback toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="phone-portrait-outline" size={24} color={theme.colors.text} style={styles.settingIcon} />
                <View>
                  <Body1>触覚フィードバック</Body1>
                  <Body2 style={{ opacity: 0.7 }}>タップ時の振動フィードバック</Body2>
                </View>
              </View>
              
              <Switch
                value={hapticsEnabled}
                onValueChange={toggleHaptics}
                trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                thumbColor={hapticsEnabled ? theme.colors.primary : '#f4f3f4'}
                ios_backgroundColor={theme.colors.surfaceVariant}
              />
            </View>
            
            <View style={styles.divider} />
            
            {/* Animations toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <Ionicons name="move-outline" size={24} color={theme.colors.text} style={styles.settingIcon} />
                <View>
                  <Body1>アニメーション</Body1>
                  <Body2 style={{ opacity: 0.7 }}>画面の動きエフェクト</Body2>
                </View>
              </View>
              
              <Switch
                value={animationsEnabled}
                onValueChange={toggleAnimations}
                trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                thumbColor={animationsEnabled ? theme.colors.primary : '#f4f3f4'}
                ios_backgroundColor={theme.colors.surfaceVariant}
              />
            </View>
          </Card>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>アカウント</H3>
          
          <Card style={styles.settingsCard}>
            {/* Edit profile */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons name="person-outline" size={24} color={theme.colors.text} style={styles.menuIcon} />
              <Body1>プロフィール編集</Body1>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={styles.menuArrow} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            {/* Subscription management */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/subscription')}
            >
              <Ionicons name="card-outline" size={24} color={theme.colors.text} style={styles.menuIcon} />
              <Body1>サブスクリプション管理</Body1>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={styles.menuArrow} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            {/* Password change */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/password')}
            >
              <Ionicons name="lock-closed-outline" size={24} color={theme.colors.text} style={styles.menuIcon} />
              <Body1>パスワード変更</Body1>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={styles.menuArrow} />
            </TouchableOpacity>
          </Card>
        </View>
        
        {/* Support Section */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>サポート</H3>
          
          <Card style={styles.settingsCard}>
            {/* About HSP */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/about-hsp')}
            >
              <Ionicons name="information-circle-outline" size={24} color={theme.colors.text} style={styles.menuIcon} />
              <Body1>HSPについて</Body1>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={styles.menuArrow} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            {/* Help and FAQ */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/help')}
            >
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.text} style={styles.menuIcon} />
              <Body1>ヘルプ・FAQ</Body1>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={styles.menuArrow} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            {/* Contact support */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile/contact')}
            >
              <Ionicons name="mail-outline" size={24} color={theme.colors.text} style={styles.menuIcon} />
              <Body1>サポートに問い合わせ</Body1>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} style={styles.menuArrow} />
            </TouchableOpacity>
          </Card>
        </View>
        
        {/* Sign out button */}
        <Button
          label="ログアウト"
          variant="outline"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
        
        {/* App version */}
        <Body2 style={styles.versionText}>バージョン 0.1.0</Body2>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statIcon: {
    marginRight: 16,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  intensitySelector: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  intensityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIntensity: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  signOutButton: {
    marginBottom: 24,
  },
  versionText: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 16,
  },
});
