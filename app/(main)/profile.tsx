/**
 * Profile Screen
 * 
 * User profile management with HSP-friendly design.
 * Features user info, app settings, statistics, and premium features.
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
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { useThemeStore, useAccessibilityStore } from '@store/slices/uiSlice';
import { useAuthStore } from '@store/slices/authSlice';
import { MeditationService } from '@services/meditation.service';
import { AppTheme } from '@config/theme';

// Premium features
const PREMIUM_FEATURES = [
  { 
    title: '無制限チャット', 
    description: 'フクロウAIカウンセラーと無制限に会話できます', 
    icon: 'chatbubbles-outline',
  },
  { 
    title: 'すべての瞑想', 
    description: 'プレミアム瞑想セッションが利用可能になります', 
    icon: 'water-outline',
  },
  { 
    title: 'すべてのサウンド', 
    description: 'プレミアムサウンドが利用可能になります', 
    icon: 'musical-notes-outline',
  },
  { 
    title: '詳細な分析', 
    description: '感情や睡眠の詳細な分析が行えます', 
    icon: 'analytics-outline',
  },
];

// Profile screen component
export default function ProfileScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const { showToast } = useToastStore();
  const { isDarkTheme, toggleTheme } = useThemeStore();
  const { 
    visualIntensity, setVisualIntensity,
    animationsEnabled, setAnimationsEnabled,
    hapticsEnabled, setHapticsEnabled,
  } = useAccessibilityStore();
  const isPremium = useAuthStore((state) => state.isPremium);
  const setPremiumStatus = useAuthStore((state) => state.setPremiumStatus);
  
  // State
  const [totalMeditationTime, setTotalMeditationTime] = useState(0);
  const [meditationStreak, setMeditationStreak] = useState(0);
  const [joinDate, setJoinDate] = useState<Date | null>(null);
  
  // Load user stats
  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
    
    // Mock join date for demo
    setJoinDate(new Date(2025, 0, 15)); // January 15, 2025
  }, [user?.id]);
  
  // Load user statistics
  const loadUserStats = async () => {
    try {
      // Get total meditation time
      const totalTime = await MeditationService.getTotalMeditationTime(user!.id);
      setTotalMeditationTime(totalTime);
      
      // Get meditation streak
      const streak = await MeditationService.getMeditationStreak(user!.id);
      setMeditationStreak(streak);
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
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
              showToast('ログアウトしました', 'success');
            } catch (error) {
              console.error('Error signing out:', error);
              showToast('ログアウトに失敗しました', 'error');
            }
          }
        },
      ]
    );
  };
  
  // Toggle premium status (for demo only)
  const togglePremium = () => {
    if (Haptics.isAvailableAsync()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setPremiumStatus(!isPremium);
    showToast(
      isPremium 
        ? 'プレミアムステータスを解除しました (デモのみ)' 
        : 'プレミアムステータスを有効にしました (デモのみ)',
      'info'
    );
  };
  
  // Format meditation time
  const formatMeditationTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}分`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
  };
  
  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <H2>プロフィール</H2>
        </View>
        
        {/* User Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <Image
                source={require('@assets/images/default-avatar.png')}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            
            {/* User Info */}
            <View style={styles.userInfo}>
              <H3>{profile?.display_name || user?.email}</H3>
              <Body2 style={styles.emailText}>{user?.email}</Body2>
              
              {joinDate && (
                <Body2 style={styles.joinDateText}>
                  {format(joinDate, 'yyyy年MM月dd日')}に参加
                </Body2>
              )}
              
              {/* Premium Badge */}
              {isPremium && (
                <View 
                  style={[
                    styles.premiumBadge,
                    { backgroundColor: theme.colors.secondary }
                  ]}
                >
                  <Body2 style={{ color: theme.colors.background }}>
                    プレミアム会員
                  </Body2>
                </View>
              )}
            </View>
          </View>
        </Card>
        
        {/* Stats Card */}
        <Card style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <H3>統計</H3>
          </View>
          
          <View style={styles.statsGrid}>
            {/* Meditation Time */}
            <View style={styles.statItem}>
              <Ionicons
                name="time-outline"
                size={24}
                color={theme.colors.primary}
                style={styles.statIcon}
              />
              <Subtitle1 style={styles.statValue}>
                {formatMeditationTime(totalMeditationTime)}
              </Subtitle1>
              <Body2 style={styles.statLabel}>
                合計瞑想時間
              </Body2>
            </View>
            
            {/* Streak */}
            <View style={styles.statItem}>
              <Ionicons
                name="flame-outline"
                size={24}
                color={theme.colors.error}
                style={styles.statIcon}
              />
              <Subtitle1 style={styles.statValue}>
                {meditationStreak}日
              </Subtitle1>
              <Body2 style={styles.statLabel}>
                連続記録
              </Body2>
            </View>
            
            {/* Completed Sessions */}
            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={theme.colors.success}
                style={styles.statIcon}
              />
              <Subtitle1 style={styles.statValue}>
                {Math.floor(totalMeditationTime / 10)}回
              </Subtitle1>
              <Body2 style={styles.statLabel}>
                完了セッション
              </Body2>
            </View>
            
            {/* Chat Count */}
            <View style={styles.statItem}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={24}
                color={theme.colors.secondary}
                style={styles.statIcon}
              />
              <Subtitle1 style={styles.statValue}>
                {Math.floor(totalMeditationTime / 5)}回
              </Subtitle1>
              <Body2 style={styles.statLabel}>
                会話回数
              </Body2>
            </View>
          </View>
        </Card>
        
        {/* Settings Card */}
        <Card style={styles.settingsCard}>
          <View style={styles.settingsHeader}>
            <H3>アプリ設定</H3>
          </View>
          
          {/* Dark Mode Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name={isDarkTheme ? 'moon' : 'sunny'}
                size={22}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Body1>ダークモード</Body1>
            </View>
            <Switch
              value={isDarkTheme}
              onValueChange={toggleTheme}
              trackColor={{ 
                false: theme.colors.surfaceVariant, 
                true: theme.colors.primaryContainer
              }}
              thumbColor={isDarkTheme ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          {/* Visual Intensity Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="contrast"
                size={22}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <View>
                <Body1>視覚的強度</Body1>
                <Body2 style={styles.settingDescription}>
                  コントラストと視覚効果の強さを調整します
                </Body2>
              </View>
            </View>
            <Body2 style={styles.intensityValue}>{visualIntensity}%</Body2>
          </View>
          
          <View style={styles.intensitySlider}>
            <TouchableOpacity 
              style={styles.intensityButton}
              onPress={() => setVisualIntensity(Math.max(30, visualIntensity - 10))}
            >
              <Body1>-</Body1>
            </TouchableOpacity>
            
            <View style={styles.intensityTrack}>
              <View 
                style={[
                  styles.intensityFill,
                  { 
                    width: `${visualIntensity}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
            
            <TouchableOpacity 
              style={styles.intensityButton}
              onPress={() => setVisualIntensity(Math.min(100, visualIntensity + 10))}
            >
              <Body1>+</Body1>
            </TouchableOpacity>
          </View>
          
          {/* Animation Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="aperture"
                size={22}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Body1>アニメーション</Body1>
            </View>
            <Switch
              value={animationsEnabled}
              onValueChange={setAnimationsEnabled}
              trackColor={{ 
                false: theme.colors.surfaceVariant, 
                true: theme.colors.primaryContainer
              }}
              thumbColor={animationsEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
          
          {/* Haptic Feedback Setting */}
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons
                name="phone-portrait"
                size={22}
                color={theme.colors.text}
                style={styles.settingIcon}
              />
              <Body1>触覚フィードバック</Body1>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ 
                false: theme.colors.surfaceVariant, 
                true: theme.colors.primaryContainer
              }}
              thumbColor={hapticsEnabled ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </Card>
        
        {/* Premium Section */}
        {!isPremium ? (
          <Card style={styles.premiumCard}>
            <View style={styles.premiumHeader}>
              <H3>プレミアムにアップグレード</H3>
            </View>
            
            <View style={styles.premiumFeatures}>
              {PREMIUM_FEATURES.map((feature, index) => (
                <View key={`feature-${index}`} style={styles.premiumFeature}>
                  <Ionicons
                    name={feature.icon as any}
                    size={24}
                    color={theme.colors.secondary}
                    style={styles.featureIcon}
                  />
                  <View style={styles.featureText}>
                    <Body1 weight="medium">{feature.title}</Body1>
                    <Body2>{feature.description}</Body2>
                  </View>
                </View>
              ))}
            </View>
            
            <View style={styles.premiumPricing}>
              <View style={styles.pricingOption}>
                <Subtitle1 style={styles.pricingTitle}>月額プラン</Subtitle1>
                <H3 style={styles.price}>¥980</H3>
                <Body2>毎月</Body2>
                <Button
                  label="月額プランを選択"
                  onPress={togglePremium}
                  style={styles.premiumButton}
                />
              </View>
              
              <View 
                style={[
                  styles.pricingOption,
                  styles.bestValue,
                  { backgroundColor: theme.colors.primaryContainer },
                ]}
              >
                <View 
                  style={[
                    styles.bestValueBadge,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Body2 style={{ color: theme.colors.background }}>
                    ベストバリュー
                  </Body2>
                </View>
                
                <Subtitle1 style={styles.pricingTitle}>年額プラン</Subtitle1>
                <H3 style={styles.price}>¥7,800</H3>
                <Body2>年間 (2ヶ月分無料)</Body2>
                <Button
                  label="年額プランを選択"
                  variant="primary"
                  onPress={togglePremium}
                  style={styles.premiumButton}
                />
              </View>
            </View>
          </Card>
        ) : (
          <Card style={styles.premiumStatusCard}>
            <View 
              style={[
                styles.premiumStatusContent,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
            >
              <Ionicons
                name="star"
                size={32}
                color={theme.colors.secondary}
                style={styles.premiumStatusIcon}
              />
              
              <View style={styles.premiumStatusInfo}>
                <H3>プレミアム会員</H3>
                <Body1>すべての機能にアクセスできます</Body1>
                <Body2 style={styles.premiumExpiry}>
                  2025年12月31日まで有効
                </Body2>
                
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={togglePremium}
                >
                  <Body2 color={theme.colors.error}>解約する (デモのみ)</Body2>
                </TouchableOpacity>
              </View>
            </View>
          </Card>
        )}
        
        {/* Logout Button */}
        <Button
          label="ログアウト"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
        
        {/* Version Info */}
        <Body2 style={styles.versionInfo}>
          Fukuro App v0.1.0
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
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flex: 1,
  },
  emailText: {
    marginTop: 4,
    opacity: 0.7,
  },
  joinDateText: {
    marginTop: 8,
    opacity: 0.7,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  statsCard: {
    marginBottom: 16,
  },
  statsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  statItem: {
    width: '50%',
    padding: 8,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    marginBottom: 4,
  },
  statLabel: {
    opacity: 0.7,
  },
  settingsCard: {
    marginBottom: 16,
  },
  settingsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  intensityValue: {
    marginLeft: 8,
  },
  intensitySlider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  intensityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityTrack: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  intensityFill: {
    height: 8,
    borderRadius: 4,
  },
  premiumCard: {
    marginBottom: 16,
  },
  premiumHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  premiumFeatures: {
    padding: 16,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  premiumPricing: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  pricingOption: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bestValue: {
    position: 'relative',
    paddingTop: 24,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pricingTitle: {
    marginBottom: 8,
  },
  price: {
    marginBottom: 4,
  },
  premiumButton: {
    marginTop: 16,
    width: '100%',
  },
  premiumStatusCard: {
    marginBottom: 16,
  },
  premiumStatusContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
  },
  premiumStatusIcon: {
    marginRight: 16,
  },
  premiumStatusInfo: {
    flex: 1,
  },
  premiumExpiry: {
    marginTop: 8,
    opacity: 0.7,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  logoutButton: {
    marginBottom: 20,
  },
  versionInfo: {
    textAlign: 'center',
    opacity: 0.5,
    marginBottom: 16,
  },
});
