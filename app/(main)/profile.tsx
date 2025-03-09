/**
 * Profile Screen
 * 
 * User profile, settings, and accessibility options with HSP-friendly design.
 * Features user stats, preferences, and app customization.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
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
import { useAccessibilityStore, useThemeStore } from '@store/slices/uiSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Settings section interface
interface SettingsSection {
  title: string;
  items: {
    id: string;
    title: string;
    description?: string;
    icon: string;
    type: 'toggle' | 'button' | 'slider' | 'link';
    value?: boolean | number;
    onPress?: () => void;
    onToggle?: (value: boolean) => void;
    onValueChange?: (value: number) => void;
  }[];
}

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled, animationsEnabled, visualIntensity, setHapticsEnabled, setAnimationsEnabled, setVisualIntensity } = useAccessibilityStore();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  
  // User stats
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
      const totalTime = await MeditationService.getTotalMeditationTime(user!.id);
      setTotalMeditationMinutes(totalTime);
      
      // Get meditation streak
      const streak = await MeditationService.getMeditationStreak(user!.id);
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
            await signOut();
          } 
        },
      ]
    );
  };
  
  // Generate settings sections
  const settingsSections: SettingsSection[] = [
    {
      title: 'アカウント',
      items: [
        {
          id: 'subscription',
          title: isPremium ? 'プレミアム会員' : 'プレミアムにアップグレード',
          description: isPremium ? '有効期限: 2025年12月31日' : '全ての機能にアクセスできるようになります',
          icon: 'star',
          type: 'link',
          onPress: () => {
            router.push('/profile/subscription');
          },
        },
        {
          id: 'edit-profile',
          title: 'プロフィール編集',
          icon: 'person',
          type: 'link',
          onPress: () => {
            router.push('/profile/edit');
          },
        },
      ],
    },
    {
      title: 'アプリ設定',
      items: [
        {
          id: 'dark-mode',
          title: 'ダークモード',
          description: 'ダークテーマを使用する',
          icon: 'moon',
          type: 'toggle',
          value: isDarkTheme,
          onToggle: (value) => {
            toggleTheme();
          },
        },
        {
          id: 'haptics',
          title: '触覚フィードバック',
          description: 'ボタン操作時の触覚フィードバック',
          icon: 'vibrate',
          type: 'toggle',
          value: hapticsEnabled,
          onToggle: (value) => {
            setHapticsEnabled(value);
            
            // Demo haptic feedback
            if (value) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          },
        },
        {
          id: 'animations',
          title: 'アニメーション',
          description: 'アプリ内のアニメーション効果',
          icon: 'film',
          type: 'toggle',
          value: animationsEnabled,
          onToggle: (value) => {
            setAnimationsEnabled(value);
          },
        },
      ],
    },
    {
      title: 'HSP向け設定',
      items: [
        {
          id: 'visual-intensity',
          title: '視覚的強度',
          description: `現在: ${visualIntensity}%`,
          icon: 'contrast',
          type: 'slider',
          value: visualIntensity,
          onValueChange: (value) => {
            setVisualIntensity(value);
          },
        },
        {
          id: 'hsp-resources',
          title: 'HSPリソース',
          description: 'HSPに関する情報とリソース',
          icon: 'information-circle',
          type: 'link',
          onPress: () => {
            router.push('/profile/resources');
          },
        },
      ],
    },
    {
      title: 'サポート',
      items: [
        {
          id: 'help',
          title: 'ヘルプとフィードバック',
          icon: 'help-circle',
          type: 'link',
          onPress: () => {
            router.push('/profile/help');
          },
        },
        {
          id: 'about',
          title: 'Fukuroについて',
          icon: 'information',
          type: 'link',
          onPress: () => {
            router.push('/profile/about');
          },
        },
      ],
    },
  ];
  
  // Render settings item
  const renderSettingsItem = (item: SettingsSection['items'][0]) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingsItem}
        onPress={item.type === 'link' ? item.onPress : undefined}
        disabled={item.type !== 'link'}
      >
        <View style={styles.settingsItemContent}>
          <View 
            style={[
              styles.settingsItemIcon,
              { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
            ]}
          >
            <Ionicons 
              name={item.icon as any} 
              size={20} 
              color={theme.colors.primary} 
            />
          </View>
          
          <View style={styles.settingsItemText}>
            <Body1 weight="medium">{item.title}</Body1>
            {item.description && (
              <Body2 style={styles.settingsItemDescription}>
                {item.description}
              </Body2>
            )}
          </View>
          
          <View style={styles.settingsItemControl}>
            {item.type === 'toggle' && (
              <Switch
                value={item.value as boolean}
                onValueChange={item.onToggle}
                trackColor={{ 
                  false: theme.colors.surfaceVariant, 
                  true: theme.colors.primary 
                }}
                thumbColor={theme.colors.background}
              />
            )}
            
            {item.type === 'link' && (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
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
            <View style={styles.avatarContainer}>
              <Image
                source={require('@assets/images/default-avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
              
              {isPremium && (
                <View 
                  style={[
                    styles.premiumBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Ionicons name="star" size={12} color={theme.colors.background} />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <H3>{profile?.display_name || '名前未設定'}</H3>
              <Body1 style={styles.email}>{user?.email}</Body1>
              
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Body2 style={styles.statValue}>{totalMeditationMinutes}</Body2>
                  <Body2 style={styles.statLabel}>瞑想(分)</Body2>
                </View>
                
                <View style={styles.statItem}>
                  <Body2 style={styles.statValue}>{meditationStreak}</Body2>
                  <Body2 style={styles.statLabel}>連続日数</Body2>
                </View>
              </View>
            </View>
          </View>
        </Card>
        
        {/* Settings sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Subtitle1 style={styles.sectionTitle}>{section.title}</Subtitle1>
            </View>
            
            <Card elevation="low">
              {section.items.map((item) => renderSettingsItem(item))}
            </Card>
          </View>
        ))}
        
        {/* Sign out button */}
        <Button
          label="ログアウト"
          variant="outline"
          onPress={handleSignOut}
          fullWidth
          style={styles.signOutButton}
        />
        
        {/* Version info */}
        <Body2 style={styles.versionInfo}>
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
    marginBottom: 20,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileContent: {
    flexDirection: 'row',
    padding: 16,
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
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  email: {
    opacity: 0.7,
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    marginRight: 24,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'NotoSansJP-Medium',
  },
  statLabel: {
    opacity: 0.7,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginLeft: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    opacity: 0.8,
  },
  settingsItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  settingsItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemDescription: {
    opacity: 0.7,
    marginTop: 2,
  },
  settingsItemControl: {
    marginLeft: 16,
  },
  signOutButton: {
    marginBottom: 24,
  },
  versionInfo: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 24,
  },
});
