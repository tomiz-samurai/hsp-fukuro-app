/**
 * Profile Screen
 * 
 * User profile, settings, and account management with HSP-friendly design.
 * Includes accessibility options, subscription management, and app preferences.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Image,
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
import { useAccessibilityStore, useThemeStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// Section type
interface Section {
  title: string;
  items: SectionItem[];
}

// Section item type
interface SectionItem {
  id: string;
  icon: string;
  label: string;
  value?: string | boolean;
  type: 'toggle' | 'navigation' | 'slider' | 'button';
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  onValueChange?: (value: number) => void;
  color?: string;
  sliderValue?: number;
  sliderMin?: number;
  sliderMax?: number;
  premium?: boolean;
}

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { hapticsEnabled, visualIntensity, animationsEnabled, setHapticsEnabled, setVisualIntensity, setAnimationsEnabled } = useAccessibilityStore();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const resetState = useAuthStore((state) => state.resetState);
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Show confirmation
      Alert.alert(
        'ログアウト',
        'ログアウトしてもよろしいですか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { 
            text: 'ログアウト', 
            style: 'destructive',
            onPress: async () => {
              // Reset state
              resetState();
              
              // Sign out
              await signOut();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Handle premium upgrade
  const handleUpgrade = () => {
    Alert.alert(
      'プレミアム機能',
      '現在、購入機能はデモバージョンでは利用できません。',
      [
        { text: 'OK' },
      ]
    );
  };
  
  // Settings sections
  const settingsSections: Section[] = [
    {
      title: 'アクセシビリティ',
      items: [
        {
          id: 'visual-intensity',
          icon: 'contrast',
          label: '視覚的な強さ',
          type: 'slider',
          sliderValue: visualIntensity,
          sliderMin: 50,
          sliderMax: 100,
          onValueChange: (value) => setVisualIntensity(value),
        },
        {
          id: 'dark-mode',
          icon: 'moon-outline',
          label: 'ダークモード',
          value: isDarkTheme,
          type: 'toggle',
          onToggle: toggleTheme,
        },
        {
          id: 'animations',
          icon: 'film-outline',
          label: 'アニメーション',
          value: animationsEnabled,
          type: 'toggle',
          onToggle: setAnimationsEnabled,
        },
        {
          id: 'haptic-feedback',
          icon: 'hand-left-outline',
          label: '触覚フィードバック',
          value: hapticsEnabled,
          type: 'toggle',
          onToggle: setHapticsEnabled,
        },
      ],
    },
    {
      title: 'アカウント',
      items: [
        {
          id: 'edit-profile',
          icon: 'person-outline',
          label: 'プロフィール編集',
          type: 'navigation',
          onPress: () => router.push('/profile/edit'),
        },
        {
          id: 'notifications',
          icon: 'notifications-outline',
          label: '通知設定',
          type: 'navigation',
          onPress: () => router.push('/profile/notifications'),
        },
        {
          id: 'premium',
          icon: 'star-outline',
          label: isPremium ? 'プレミアム会員' : 'プレミアムにアップグレード',
          value: isPremium ? '有効' : undefined,
          type: isPremium ? 'navigation' : 'button',
          onPress: isPremium ? () => router.push('/profile/subscription') : handleUpgrade,
          color: theme.colors.secondary,
        },
      ],
    },
    {
      title: 'サポート',
      items: [
        {
          id: 'help',
          icon: 'help-circle-outline',
          label: 'ヘルプとサポート',
          type: 'navigation',
          onPress: () => router.push('/profile/help'),
        },
        {
          id: 'feedback',
          icon: 'chatbubble-outline',
          label: 'フィードバック',
          type: 'navigation',
          onPress: () => router.push('/profile/feedback'),
        },
        {
          id: 'about',
          icon: 'information-circle-outline',
          label: 'このアプリについて',
          type: 'navigation',
          onPress: () => router.push('/profile/about'),
        },
        {
          id: 'signout',
          icon: 'log-out-outline',
          label: 'ログアウト',
          type: 'button',
          onPress: handleSignOut,
          color: theme.colors.error,
        },
      ],
    },
  ];
  
  // Render setting item
  const renderSettingItem = (item: SectionItem) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.type === 'toggle' ? undefined : item.onPress}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingLeft}>
          <Ionicons
            name={item.icon as any}
            size={22}
            color={item.color || theme.colors.text}
            style={styles.settingIcon}
          />
          <Body1 
            style={[
              styles.settingLabel,
              item.color ? { color: item.color } : undefined,
            ]}
          >
            {item.label}
          </Body1>
        </View>
        
        <View style={styles.settingRight}>
          {item.type === 'toggle' && (
            <Switch
              value={item.value as boolean}
              onValueChange={(value) => item.onToggle?.(value)}
              trackColor={{ 
                false: theme.colors.surfaceVariant, 
                true: theme.colors.primary 
              }}
              thumbColor={
                Platform.OS === 'ios' 
                  ? undefined 
                  : (item.value ? theme.colors.background : theme.colors.background)
              }
            />
          )}
          
          {item.type === 'navigation' && item.value && (
            <Body2 style={styles.settingValue}>{item.value}</Body2>
          )}
          
          {(item.type === 'navigation' || item.type === 'button') && (
            <Ionicons
              name={item.type === 'navigation' ? 'chevron-forward' : undefined}
              size={18}
              color={theme.colors.text}
              style={styles.chevron}
            />
          )}
          
          {item.type === 'slider' && (
            <View style={styles.sliderContainer}>
              <View 
                style={[
                  styles.slider,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <View 
                  style={[
                    styles.sliderFill,
                    { 
                      width: `${((item.sliderValue || 0) - (item.sliderMin || 0)) / ((item.sliderMax || 100) - (item.sliderMin || 0)) * 100}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              </View>
              <Body2 style={styles.sliderValue}>{Math.round(item.sliderValue || 0)}%</Body2>
            </View>
          )}
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
          <View style={styles.profileContainer}>
            {/* Avatar */}
            <View 
              style={[
                styles.avatarContainer, 
                { backgroundColor: theme.colors.primary }
              ]}
            >
              {profile?.avatar_url ? (
                <Image
                  source={{ uri: profile.avatar_url }}
                  style={styles.avatar}
                />
              ) : (
                <H2 style={styles.avatarText}>
                  {profile?.display_name?.[0] || user?.email?.[0] || 'U'}
                </H2>
              )}
            </View>
            
            {/* User info */}
            <View style={styles.userInfo}>
              <H3 style={styles.userName}>
                {profile?.display_name || '名称未設定'}
              </H3>
              <Body2 style={styles.userEmail}>
                {user?.email}
              </Body2>
              
              {/* Premium badge */}
              {isPremium && (
                <View 
                  style={[
                    styles.premiumBadge, 
                    { backgroundColor: theme.colors.secondary }
                  ]}
                >
                  <Ionicons
                    name="star"
                    size={12}
                    color={theme.colors.background}
                    style={styles.premiumIcon}
                  />
                  <Body2 style={styles.premiumText}>プレミアム</Body2>
                </View>
              )}
            </View>
            
            {/* Edit button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/profile/edit')}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* Settings sections */}
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Subtitle1 style={styles.sectionTitle}>{section.title}</Subtitle1>
            <Card style={styles.sectionCard}>
              {section.items.map(renderSettingItem)}
            </Card>
          </View>
        ))}
        
        {/* App version */}
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
    marginBottom: 16,
  },
  profileCard: {
    marginBottom: 24,
  },
  profileContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    color: 'white',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  premiumIcon: {
    marginRight: 4,
  },
  premiumText: {
    color: 'white',
    fontSize: 12,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 8,
    marginLeft: 8,
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    marginRight: 8,
    opacity: 0.7,
  },
  chevron: {
    marginLeft: 4,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  slider: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: 4,
  },
  sliderValue: {
    marginLeft: 8,
    width: 36,
    textAlign: 'right',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  versionText: {
    opacity: 0.7,
  },
});
