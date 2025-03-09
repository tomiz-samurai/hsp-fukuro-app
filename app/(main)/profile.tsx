/**
 * Profile Screen
 * 
 * User profile and settings with HSP-friendly design.
 * Features account management, preferences, and statistics.
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
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { useAccessibilityStore, useToastStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut, updateProfile } = useAuth();
  const { hapticsEnabled, setHapticsEnabled } = useAccessibilityStore();
  const { visualIntensity, setVisualIntensity } = useAccessibilityStore();
  const { animationsEnabled, setAnimationsEnabled } = useAccessibilityStore();
  const { showToast } = useToastStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const resetAuthState = useAuthStore((state) => state.resetState);
  
  // State
  const [loading, setLoading] = useState(false);
  const [totalMeditationMinutes, setTotalMeditationMinutes] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  
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
      const totalMinutes = await MeditationService.getTotalMeditationTime(user!.id);
      setTotalMeditationMinutes(totalMinutes);
      
      // Get meditation streak
      const streak = await MeditationService.getMeditationStreak(user!.id);
      setMeditationStreak(streak);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      setLoading(true);
      
      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Sign out
      await signOut();
      
      // Reset auth state
      resetAuthState();
      
      // Show toast
      showToast('ログアウトしました', 'success');
      
      // Navigate to login
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('ログアウトに失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle profile picture update
  const handleUpdateProfilePicture = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          '権限が必要です',
          '画像を選択するには、写真へのアクセス権限が必要です。',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // For demo purposes, we'll just show a success toast
        // In a real app, you would upload the image to Supabase Storage
        showToast('プロフィール画像が更新されました', 'success');
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      showToast('プロフィール画像の更新に失敗しました', 'error');
    }
  };
  
  // Handle haptic feedback toggle
  const handleHapticsToggle = (value: boolean) => {
    setHapticsEnabled(value);
    
    // Provide haptic feedback when enabling
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle animations toggle
  const handleAnimationsToggle = (value: boolean) => {
    setAnimationsEnabled(value);
    
    // Provide haptic feedback if enabled
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle visual intensity change
  const handleVisualIntensityChange = (value: number) => {
    setVisualIntensity(value);
    
    // Provide haptic feedback if enabled
    if (hapticsEnabled && (value === 50 || value === 100)) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Section item component
  const SectionItem = ({ 
    icon, 
    title, 
    subtitle, 
    right,
    onPress,
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string;
    right?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      style={styles.sectionItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.sectionItemIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
        <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
      </View>
      
      <View style={styles.sectionItemContent}>
        <Body1 weight="medium">{title}</Body1>
        {subtitle && <Body2 style={styles.sectionItemSubtitle}>{subtitle}</Body2>}
      </View>
      
      {right ? (
        <View style={styles.sectionItemRight}>
          {right}
        </View>
      ) : onPress ? (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
      ) : null}
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
        
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            {/* Profile Picture */}
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={handleUpdateProfilePicture}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.profilePicture}
                />
              ) : (
                <View style={[styles.profilePicturePlaceholder, { backgroundColor: theme.colors.primary }]}>
                  <H3 style={styles.profilePictureLetter}>
                    {profile?.display_name ? profile.display_name[0].toUpperCase() : 
                     user?.email ? user.email[0].toUpperCase() : '?'}
                  </H3>
                </View>
              )}
              <View style={[styles.editIconContainer, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={14} color="white" />
              </View>
            </TouchableOpacity>
            
            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <H3>{profile?.display_name || '名前未設定'}</H3>
              <Body1 style={styles.profileEmail}>{user?.email}</Body1>
              
              {/* Membership Status */}
              <View style={[
                styles.membershipBadge,
                { 
                  backgroundColor: isPremium ? theme.colors.secondary : theme.colors.surfaceVariant,
                },
              ]}>
                <Body2 style={{ 
                  color: isPremium ? theme.colors.background : theme.colors.text,
                  fontFamily: theme.typography.fontFamily.medium,
                }}>
                  {isPremium ? 'プレミアム会員' : '無料会員'}
                </Body2>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsContent}>
            {/* Meditation Time */}
            <View style={styles.statItem}>
              <H3>{totalMeditationMinutes}</H3>
              <Body2>瞑想時間 (分)</Body2>
            </View>
            
            {/* Streak */}
            <View style={[styles.statItem, styles.statItemMiddle]}>
              <H3>{meditationStreak}</H3>
              <Body2>連続日数</Body2>
            </View>
            
            {/* Mood Score */}
            <View style={styles.statItem}>
              <H3>--</H3>
              <Body2>気分スコア</Body2>
            </View>
          </View>
        </Card>
        
        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Subtitle1 style={styles.sectionTitle}>アカウント設定</Subtitle1>
          
          <Card style={styles.settingsCard}>
            <SectionItem
              icon="person-outline"
              title="プロフィール編集"
              onPress={() => router.push('/profile/edit')}
            />
            <View style={styles.divider} />
            <SectionItem
              icon="notifications-outline"
              title="通知設定"
              onPress={() => router.push('/profile/notifications')}
            />
            <View style={styles.divider} />
            <SectionItem
              icon="star-outline"
              title="プレミアム会員について"
              subtitle={isPremium ? '現在プレミアム会員です' : '無料会員から機能を拡張'}
              onPress={() => router.push('/profile/premium')}
            />
          </Card>
        </View>
        
        <View style={styles.settingsSection}>
          <Subtitle1 style={styles.sectionTitle}>アクセシビリティ</Subtitle1>
          
          <Card style={styles.settingsCard}>
            <SectionItem
              icon="eye-outline"
              title="視覚強度"
              subtitle={`${visualIntensity}%`}
              right={
                <View style={styles.sliderContainer}>
                  {/* This would be a custom slider component in a real app */}
                  <View 
                    style={[
                      styles.sliderTrack,
                      { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                  >
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
                </View>
              }
              onPress={() => {
                // In a real app, this would open a slider dialog
                // For demo, we'll just cycle through 50%, 70%, 100%
                const nextValue = visualIntensity === 50 ? 70 : visualIntensity === 70 ? 100 : 50;
                handleVisualIntensityChange(nextValue);
              }}
            />
            <View style={styles.divider} />
            <SectionItem
              icon="hand-left-outline"
              title="触覚フィードバック"
              right={
                <Switch
                  value={hapticsEnabled}
                  onValueChange={handleHapticsToggle}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={hapticsEnabled ? theme.colors.primary : theme.colors.background}
                />
              }
            />
            <View style={styles.divider} />
            <SectionItem
              icon="pulse-outline"
              title="アニメーション"
              right={
                <Switch
                  value={animationsEnabled}
                  onValueChange={handleAnimationsToggle}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={animationsEnabled ? theme.colors.primary : theme.colors.background}
                />
              }
            />
          </Card>
        </View>
        
        <View style={styles.settingsSection}>
          <Subtitle1 style={styles.sectionTitle}>その他</Subtitle1>
          
          <Card style={styles.settingsCard}>
            <SectionItem
              icon="help-circle-outline"
              title="ヘルプ・サポート"
              onPress={() => router.push('/profile/help')}
            />
            <View style={styles.divider} />
            <SectionItem
              icon="information-circle-outline"
              title="アプリについて"
              onPress={() => router.push('/profile/about')}
            />
            <View style={styles.divider} />
            <SectionItem
              icon="shield-outline"
              title="プライバシーポリシー"
              onPress={() => router.push('/profile/privacy')}
            />
          </Card>
        </View>
        
        {/* Sign Out Button */}
        <Button
          label="ログアウト"
          variant="outline"
          fullWidth
          onPress={handleSignOut}
          isLoading={loading}
          style={styles.signOutButton}
        />
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
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  profilePictureContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profilePicturePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureLetter: {
    color: 'white',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  profileEmail: {
    marginTop: 4,
    opacity: 0.7,
  },
  membershipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsContent: {
    flexDirection: 'row',
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItemMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  settingsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionItemContent: {
    flex: 1,
  },
  sectionItemSubtitle: {
    marginTop: 2,
    opacity: 0.7,
  },
  sectionItemRight: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginHorizontal: 16,
  },
  sliderContainer: {
    width: 100,
    height: 24,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    borderRadius: 2,
  },
  sliderFill: {
    height: 4,
    borderRadius: 2,
  },
  signOutButton: {
    marginVertical: 20,
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
