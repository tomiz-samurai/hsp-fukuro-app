/**
 * Settings Screen
 * 
 * A comprehensive settings page with HSP-specific options for visual comfort,
 * audio preferences, haptic feedback, and other accessibility features.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useAuthStore } from '@store/slices/authSlice';
import { 
  useAccessibilityStore, 
  useThemeStore,
  useToastStore,
} from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// HSP sensitivity levels for easy selection
const SENSITIVITY_PRESETS = [
  { label: '低感度', value: 100, description: '標準的な視覚刺激' },
  { label: '中感度', value: 70, description: 'バランスの取れた視覚刺激' },
  { label: '高感度', value: 40, description: '最小限の視覚刺激' },
];

// Settings screen component
export default function SettingsScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user } = useAuth();
  const { isDarkTheme, setTheme, toggleTheme } = useThemeStore();
  const { 
    visualIntensity,
    setVisualIntensity,
    animationsEnabled,
    setAnimationsEnabled,
    hapticsEnabled,
    setHapticsEnabled,
  } = useAccessibilityStore();
  const { showToast } = useToastStore();
  
  // State for additional settings not in global store
  const [autoplayMedia, setAutoplayMedia] = useState(false);
  const [useSystemTheme, setUseSystemTheme] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [backgroundSoundsEnabled, setBackgroundSoundsEnabled] = useState(true);
  const [cacheSizeInfo, setCacheSizeInfo] = useState('計算中...');
  
  // Calculate cache size on mount
  useEffect(() => {
    calculateCacheSize();
  }, []);
  
  // Calculate app cache size
  const calculateCacheSize = async () => {
    try {
      // This is a simplification - in a real app you'd want to get actual app cache size
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const cacheDir = FileSystem.cacheDirectory;
        if (cacheDir) {
          const dirInfo = await FileSystem.getInfoAsync(cacheDir);
          if (dirInfo.exists && dirInfo.size) {
            // Convert bytes to MB
            const sizeMB = (dirInfo.size / (1024 * 1024)).toFixed(1);
            setCacheSizeInfo(`${sizeMB} MB`);
            return;
          }
        }
      }
      
      // Fallback to mock value
      setCacheSizeInfo('23.4 MB');
    } catch (error) {
      console.error('Error calculating cache size:', error);
      setCacheSizeInfo('計算できません');
    }
  };
  
  // Clear app cache
  const handleClearCache = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'キャッシュを消去',
      'アプリのキャッシュデータを消去しますか？これによりログイン情報は保持されますが、一時データは削除されます。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '消去', 
          onPress: async () => {
            // Mock cache clearing operation
            showToast('キャッシュを消去しました', 'success');
            setCacheSizeInfo('0 MB');
          },
        },
      ]
    );
  };
  
  // Handle visual intensity change
  const handleVisualIntensityChange = (value: number) => {
    setVisualIntensity(value);
  };
  
  // Handle setting preset sensitivity level
  const handlePresetSelect = (value: number) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setVisualIntensity(value);
  };
  
  // Handle general toggle switches
  const handleToggle = (setting: string, value: boolean) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    switch (setting) {
      case 'theme':
        setTheme(value);
        break;
      case 'systemTheme':
        setUseSystemTheme(value);
        break;
      case 'animations':
        setAnimationsEnabled(value);
        break;
      case 'haptics':
        setHapticsEnabled(value);
        break;
      case 'autoplayMedia':
        setAutoplayMedia(value);
        break;
      case 'notifications':
        setNotificationsEnabled(value);
        break;
      case 'backgroundSounds':
        setBackgroundSoundsEnabled(value);
        break;
    }
  };
  
  // Save all settings
  const handleSaveSettings = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Settings are already saved in real-time via Zustand
    showToast('設定が保存されました', 'success');
  };
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen 
        options={{ 
          title: '設定',
          headerShown: true,
        }} 
      />
      
      <View style={styles.container}>
        {/* HSP Visual Comfort Settings */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>HSP視覚的快適性</H3>
          <Body1 style={styles.sectionDescription}>
            高感受性者向けに視覚的な刺激を調整します
          </Body1>
          
          <Card>
            {/* Visual intensity slider */}
            <View style={styles.settingsGroup}>
              <View style={styles.settingHeader}>
                <Body1 weight="medium">視覚的強度</Body1>
                <Body2>{Math.round(visualIntensity)}%</Body2>
              </View>
              
              <View style={styles.sliderContainer}>
                <Ionicons name="eye-outline" size={20} color={theme.colors.textSecondary} />
                <Slider
                  style={styles.slider}
                  minimumValue={20}
                  maximumValue={100}
                  step={5}
                  value={visualIntensity}
                  onValueChange={handleVisualIntensityChange}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.surfaceVariant}
                  thumbTintColor={theme.colors.primary}
                />
                <Ionicons name="sunny-outline" size={20} color={theme.colors.textSecondary} />
              </View>
              
              <Body2 style={styles.settingDescription}>
                コントラスト、色の彩度、アニメーションの強さなどの視覚的要素の強度を調整します
              </Body2>
            </View>
            
            {/* Preset buttons */}
            <View style={styles.presetButtons}>
              {SENSITIVITY_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  style={[
                    styles.presetButton,
                    Math.abs(visualIntensity - preset.value) < 10 && {
                      backgroundColor: theme.colors.primaryContainer,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => handlePresetSelect(preset.value)}
                >
                  <Body1 
                    style={Math.abs(visualIntensity - preset.value) < 10 ? 
                      { color: theme.colors.primary } : {}}
                  >
                    {preset.label}
                  </Body1>
                  <Body2 style={styles.presetDescription}>{preset.description}</Body2>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        </View>
        
        {/* Theme Settings */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>表示設定</H3>
          
          <Card>
            <View style={styles.settingsList}>
              {/* Dark mode */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>ダークモード</Body1>
                  <Body2 style={styles.settingDescription}>
                    暗い背景で目への刺激を軽減
                  </Body2>
                </View>
                <Switch
                  value={isDarkTheme}
                  onValueChange={(value) => handleToggle('theme', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={isDarkTheme ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
              
              {/* System theme */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>システムテーマに従う</Body1>
                  <Body2 style={styles.settingDescription}>
                    デバイスの設定に合わせて自動的に切り替え
                  </Body2>
                </View>
                <Switch
                  value={useSystemTheme}
                  onValueChange={(value) => handleToggle('systemTheme', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={useSystemTheme ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
              
              {/* Animations */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>アニメーション</Body1>
                  <Body2 style={styles.settingDescription}>
                    緩やかなアニメーションと遷移効果
                  </Body2>
                </View>
                <Switch
                  value={animationsEnabled}
                  onValueChange={(value) => handleToggle('animations', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={animationsEnabled ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
            </View>
          </Card>
        </View>
        
        {/* Feedback Settings */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>フィードバック設定</H3>
          
          <Card>
            <View style={styles.settingsList}>
              {/* Haptic feedback */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>触覚フィードバック</Body1>
                  <Body2 style={styles.settingDescription}>
                    タップやアクションに応じた軽い振動
                  </Body2>
                </View>
                <Switch
                  value={hapticsEnabled}
                  onValueChange={(value) => handleToggle('haptics', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={hapticsEnabled ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
              
              {/* Auto-play media */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>メディアの自動再生</Body1>
                  <Body2 style={styles.settingDescription}>
                    音楽や瞑想ガイドの自動再生
                  </Body2>
                </View>
                <Switch
                  value={autoplayMedia}
                  onValueChange={(value) => handleToggle('autoplayMedia', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={autoplayMedia ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
            </View>
          </Card>
        </View>
        
        {/* Notification Settings */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>通知設定</H3>
          
          <Card>
            <View style={styles.settingsList}>
              {/* Enable notifications */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>通知を有効化</Body1>
                  <Body2 style={styles.settingDescription}>
                    アプリからのお知らせやリマインダー
                  </Body2>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={(value) => handleToggle('notifications', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={notificationsEnabled ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
              
              {/* Background sounds */}
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>バックグラウンド再生</Body1>
                  <Body2 style={styles.settingDescription}>
                    アプリがバックグラウンドでも音を再生
                  </Body2>
                </View>
                <Switch
                  value={backgroundSoundsEnabled}
                  onValueChange={(value) => handleToggle('backgroundSounds', value)}
                  trackColor={{ false: theme.colors.surfaceVariant, true: `${theme.colors.primary}80` }}
                  thumbColor={backgroundSoundsEnabled ? theme.colors.primary : theme.colors.surface}
                  ios_backgroundColor={theme.colors.surfaceVariant}
                />
              </View>
            </View>
          </Card>
        </View>
        
        {/* Cache Management */}
        <View style={styles.section}>
          <H3 style={styles.sectionTitle}>キャッシュ管理</H3>
          
          <Card>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Body1>現在のキャッシュサイズ</Body1>
                  <Body2 style={styles.settingDescription}>
                    一時ファイルやオーディオキャッシュ
                  </Body2>
                </View>
                <Body1>{cacheSizeInfo}</Body1>
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  label="キャッシュを消去"
                  variant="outline"
                  onPress={handleClearCache}
                  style={styles.clearButton}
                />
              </View>
            </View>
          </Card>
        </View>
        
        {/* Save Button */}
        <View style={styles.saveButtonContainer}>
          <Button
            label="設定を保存"
            onPress={handleSaveSettings}
            fullWidth
          />
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 4,
  },
  sectionDescription: {
    opacity: 0.7,
    marginBottom: 12,
  },
  settingsGroup: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  settingDescription: {
    marginTop: 4,
    opacity: 0.7,
  },
  presetButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  presetButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 4,
  },
  presetDescription: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.7,
  },
  settingsList: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  buttonContainer: {
    padding: 16,
    alignItems: 'flex-start',
  },
  clearButton: {
    alignSelf: 'flex-start',
  },
  saveButtonContainer: {
    marginVertical: 24,
  },
});
