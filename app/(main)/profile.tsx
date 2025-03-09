/**
 * Profile Screen
 * 
 * User profile and settings screen with HSP-friendly design.
 * Features account management, preferences, and accessibility options.
 */

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Switch, 
  Alert,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { 
  useAccessibilityStore, 
  useThemeStore,
} from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';
import { MeditationService } from '@services/meditation.service';

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled, setHapticsEnabled, visualIntensity, setVisualIntensity, animationsEnabled, setAnimationsEnabled } = useAccessibilityStore();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const setPremiumStatus = useAuthStore((state) => state.setPremiumStatus);
  
  // Stats state (would normally be fetched from backend)
  const [stats, setStats] = useState({
    meditationMinutes: 143,
    meditationSessions: 12,
    streak: 3,
    favoriteType: '呼吸法',
  });
  
  // Handle sign out
  const handleSignOut = async () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: () => signOut()
        },
      ]
    );
  };
  
  // Toggle premium status (for demo purposes)
  const togglePremium = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setPremiumStatus(!isPremium);
    
    Alert.alert(
      isPremium ? 'プレミアム解除' : 'プレミアム有効化',
      isPremium ? 'プレミアム機能が無効になりました。' : 'プレミアム機能が有効になりました！',
      [{ text: 'OK' }]
    );
  };
  
  // Get display name
  const getDisplayName = () => {
    if (profile?.display_name) {
      return profile.display_name;
    }
    
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'ユーザー';
  };
  
  // Render setting item with switch
  const renderSwitchItem = (
    icon: string,
    label: string,
    value: boolean,
    onToggle: () => void
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIconLabel}>
        <Ionicons 
          name={icon as any} 
          size={22} 
          color={theme.colors.text} 
          style={styles.settingIcon}
        />
        <Body1>{label}</Body1>
      </View>
      <Switch
        value={value}
        onValueChange={() => {
          if (hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          onToggle();
        }}
        trackColor={{ 
          false: theme.colors.surfaceVariant, 
          true: theme.colors.primary,
        }}
        thumbColor={theme.colors.background}
      />
    </View>
  );
  
  // Render setting item with chevron
  const renderChevronItem = (
    icon: string,
    label: string,
    onPress: () => void
  ) => (
    <TouchableOpacity 
      style={styles.settingItem}
      onPress={() => {
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
      }}
    >
      <View style={styles.settingIconLabel}>
        <Ionicons 
          name={icon as any} 
          size={22} 
          color={theme.colors.text} 
          style={styles.settingIcon}
        />
        <Body1>{label}</Body1>
      </View>
      <Ionicons name="chevron-forward" size={22} color={theme.colors.text} />
    </TouchableOpacity>
  );
  
  // Handle opening of visual intensity settings
  const handleVisualIntensitySettings = () => {
    Alert.alert(
      '視覚強度の設定',
      '現在の視覚強度: ' + visualIntensity + '%',
      [
        { text: '弱くする', onPress: () => setVisualIntensity(Math.max(30, visualIntensity - 10)) },
        { text: '強くする', onPress: () => setVisualIntensity(Math.min(100, visualIntensity + 10)) },
        { text: 'キャンセル', style: 'cancel' },
      ]
    );
  };
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
        </View>
        
        {/* Profile card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={require('@assets/images/default-avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: theme.colors.secondary }]}>
                  <Ionicons name="star" size={12} color="white" />
                </View>
              )}
            </View>
            
            {/* User info */}
            <View style={styles.userInfo}>
              <H3>{getDisplayName()}</H3>
              <Body2 style={styles.userEmail}>{user?.email}</Body2>
              
              {/* Membership status */}
              <View 
                style={[
                  styles.membershipStatus,
                  { 
                    backgroundColor: isPremium 
                      ? `${theme.colors.secondary}33` 
                      : `${theme.colors.surfaceVariant}99`,
                  },
                ]}
              >
                <Body2 
                  color={isPremium ? theme.colors.secondary : undefined}
                  weight={isPremium ? 'medium' : 'regular'}
                >
                  {isPremium ? 'プレミアム会員' : '無料会員'}
                </Body2>
              </View>
            </View>
            
            {/* Premium toggle (for demo only) */}
            <TouchableOpacity
              style={styles.premiumToggle}
              onPress={togglePremium}
            >
              <Body2 color={theme.colors.primary}>切替</Body2>
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* Stats card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Subtitle1 weight="medium">瞑想の記録</Subtitle1>
          </View>
          
          <View style={styles.statsGrid}>
            {/* Total minutes */}
            <View style={styles.statItem}>
              <H3>{stats.meditationMinutes}</H3>
              <Body2>合計時間（分）</Body2>
            </View>
            
            {/* Sessions */}
            <View style={styles.statItem}>
              <H3>{stats.meditationSessions}</H3>
              <Body2>セッション数</Body2>
            </View>
            
            {/* Streak */}
            <View style={styles.statItem}>
              <H3>{stats.streak}</H3>
              <Body2>連続日数</Body2>
            </View>
            
            {/* Favorite */}
            <View style={styles.statItem}>
              <H3 style={styles.favoriteText}>{stats.favoriteType}</H3>
              <Body2>よく使うタイプ</Body2>
            </View>
          </View>
        </Card>
        
        {/* Settings sections */}
        <View style={styles.settingsSection}>
          <Subtitle1 weight="medium" style={styles.sectionTitle}>
            アクセシビリティと表示
          </Subtitle1>
          
          <Card style={styles.settingsCard}>
            {/* Dark mode */}
            {renderSwitchItem(
              'moon-outline',
              'ダークモード',
              isDarkTheme,
              toggleTheme
            )}
            
            {/* Visual intensity */}
            {renderChevronItem(
              'contrast-outline',
              '視覚強度: ' + visualIntensity + '%',
              handleVisualIntensitySettings
            )}
            
            {/* Haptic feedback */}
            {renderSwitchItem(
              'phone-portrait-outline',
              '触覚フィードバック',
              hapticsEnabled,
              () => setHapticsEnabled(!hapticsEnabled)
            )}
            
            {/* Animations */}
            {renderSwitchItem(
              'pulse-outline',
              'アニメーション',
              animationsEnabled,
              () => setAnimationsEnabled(!animationsEnabled)
            )}
          </Card>
        </View>
        
        <View style={styles.settingsSection}>
          <Subtitle1 weight="medium" style={styles.sectionTitle}>
            アカウント
          </Subtitle1>
          
          <Card style={styles.settingsCard}>
            {/* Subscription */}
            {renderChevronItem(
              'card-outline',
              'サブスクリプション管理',
              () => Alert.alert('サブスクリプション', 'サブスクリプション管理画面へ')
            )}
            
            {/* Notifications */}
            {renderChevronItem(
              'notifications-outline',
              '通知設定',
              () => Alert.alert('通知設定', '通知設定画面へ')
            )}
            
            {/* Password */}
            {renderChevronItem(
              'lock-closed-outline',
              'パスワード変更',
              () => Alert.alert('パスワード変更', 'パスワード変更画面へ')
            )}
            
            {/* Sign out */}
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={handleSignOut}
            >
              <View style={styles.settingIconLabel}>
                <Ionicons 
                  name="log-out-outline"
                  size={22} 
                  color={theme.colors.error} 
                  style={styles.settingIcon}
                />
                <Body1 color={theme.colors.error}>ログアウト</Body1>
              </View>
            </TouchableOpacity>
          </Card>
        </View>
        
        {/* App info */}
        <View style={styles.appInfo}>
          <Body2 style={styles.appVersion}>Fukuro v0.1.0</Body2>
          <Body2 style={styles.copyright}>© 2025 Fukuro App Team</Body2>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userEmail: {
    marginTop: 4,
    opacity: 0.7,
  },
  membershipStatus: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  premiumToggle: {
    padding: 8,
  },
  statsCard: {
    marginBottom: 24,
  },
  statsHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  statItem: {
    width: '50%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 16,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  appInfo: {
    alignItems: 'center',
    marginVertical: 24,
  },
  appVersion: {
    opacity: 0.7,
  },
  copyright: {
    marginTop: 4,
    opacity: 0.5,
  },
});
