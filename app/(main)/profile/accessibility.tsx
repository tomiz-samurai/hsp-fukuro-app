/**
 * Accessibility Settings Screen
 * 
 * A screen for HSP-specific accessibility settings to customize the app experience
 * according to individual sensory needs and preferences.
 */

import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Switch, 
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// Accessibility settings screen component
export default function AccessibilityScreen() {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  
  // Get accessibility settings from store
  const { 
    visualIntensity, 
    setVisualIntensity,
    animationsEnabled,
    setAnimationsEnabled,
    hapticsEnabled,
    setHapticsEnabled,
  } = useAccessibilityStore();
  
  // Format visual intensity as percentage
  const formatIntensityPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };
  
  // Test haptic feedback
  const testHapticFeedback = () => {
    if (hapticsEnabled) {
      // Provide all feedback types as a demo
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light), 0);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), 500);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 1000);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 1500);
    }
  };
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen 
        options={{ 
          title: 'アクセシビリティ', 
          headerBackTitle: '戻る',
        }} 
      />
      
      <View style={styles.container}>
        {/* Header and description */}
        <View style={styles.header}>
          <H2>アクセシビリティ設定</H2>
          <Body1 style={styles.description}>
            HSPの方向けに、感覚的な刺激を調節するための設定です。あなたの感覚の特性に合わせてカスタマイズしてください。
          </Body1>
        </View>
        
        {/* Visual Settings */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="eye-outline" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
              <H3>視覚設定</H3>
            </View>
            <Body2>視覚的な刺激を調節します</Body2>
          </View>
          
          {/* Visual Intensity Slider */}
          <View style={styles.setting}>
            <View style={styles.settingLabelContainer}>
              <Body1 weight="medium">視覚的な強度</Body1>
              <Body1>{formatIntensityPercentage(visualIntensity)}</Body1>
            </View>
            
            <View style={styles.sliderContainer}>
              <Ionicons name="remove" size={20} color={theme.colors.textSecondary} />
              <Slider
                style={styles.slider}
                minimumValue={30}
                maximumValue={100}
                step={5}
                value={visualIntensity}
                onValueChange={setVisualIntensity}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surfaceVariant}
                thumbTintColor={theme.colors.primary}
              />
              <Ionicons name="add" size={20} color={theme.colors.textSecondary} />
            </View>
            
            <Body2 style={styles.settingDescription}>
              色の彩度や明るさ、アニメーションの強さなどを調整します。低い値に設定すると視覚的な刺激が少なくなります。
            </Body2>
          </View>
          
          {/* Animations Toggle */}
          <View style={styles.setting}>
            <View style={styles.settingLabelContainer}>
              <Body1 weight="medium">アニメーション</Body1>
              <Switch
                value={animationsEnabled}
                onValueChange={setAnimationsEnabled}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : 'white'}
                ios_backgroundColor={theme.colors.surfaceVariant}
              />
            </View>
            
            <Body2 style={styles.settingDescription}>
              アニメーションをオフにすると、画面の動きが少なくなり、目の負担が軽減されます。
            </Body2>
          </View>
          
          {/* Dark Mode Info */}
          <View style={styles.setting}>
            <View style={styles.settingLabelContainer}>
              <Body1 weight="medium">ダークモード</Body1>
              <TouchableOpacity onPress={() => router.push('/profile/settings')}>
                <Body1 color={theme.colors.primary}>設定へ</Body1>
              </TouchableOpacity>
            </View>
            
            <Body2 style={styles.settingDescription}>
              ダークモードは目の疲れを軽減し、夜間の使用に適しています。テーマ設定から変更できます。
            </Body2>
          </View>
        </Card>
        
        {/* Haptic Settings */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="hand-left-outline" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
              <H3>触覚設定</H3>
            </View>
            <Body2>触覚的なフィードバックを調節します</Body2>
          </View>
          
          {/* Haptic Feedback Toggle */}
          <View style={styles.setting}>
            <View style={styles.settingLabelContainer}>
              <Body1 weight="medium">触覚フィードバック</Body1>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: theme.colors.surfaceVariant, true: theme.colors.primary }}
                thumbColor={Platform.OS === 'ios' ? undefined : 'white'}
                ios_backgroundColor={theme.colors.surfaceVariant}
              />
            </View>
            
            <Body2 style={styles.settingDescription}>
              ボタンを押した時などに、軽い振動フィードバックを提供します。触覚に敏感な方はオフにすることをおすすめします。
            </Body2>
            
            {/* Test Haptic Feedback Button */}
            {hapticsEnabled && (
              <Button
                label="触覚フィードバックをテスト"
                variant="outline"
                onPress={testHapticFeedback}
                style={styles.testButton}
              />
            )}
          </View>
        </Card>
        
        {/* Audio Settings */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="volume-medium-outline" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
              <H3>音声設定</H3>
            </View>
            <Body2>音声的な刺激を調節します</Body2>
          </View>
          
          {/* Sound Settings Info */}
          <View style={styles.setting}>
            <Body2 style={styles.settingDescription}>
              各画面で再生される音声の音量は、その画面内のコントロールで調整できます。
              システム音量は、デバイスの設定から調整してください。
            </Body2>
            
            <TouchableOpacity 
              style={[styles.infoButton, { backgroundColor: theme.colors.infoContainer }]}
              onPress={() => router.push('/sounds')}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.colors.info} style={styles.infoIcon} />
              <Body2 color={theme.colors.info}>サウンド画面では、さまざまな環境音や自然音を試すことができます。</Body2>
            </TouchableOpacity>
          </View>
        </Card>
        
        {/* HSP Resources */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="heart-outline" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
              <H3>HSPリソース</H3>
            </View>
            <Body2>役立つ情報</Body2>
          </View>
          
          <View style={styles.setting}>
            <Body2 style={styles.settingDescription}>
              高感受性者（HSP）のための追加リソースと情報が必要な場合は、以下をご覧ください。
            </Body2>
            
            {/* HSP Resources Button */}
            <Button
              label="HSPリソースを表示"
              variant="outline"
              onPress={() => router.push('/profile/hsp-resources')}
              style={styles.resourceButton}
            />
          </View>
        </Card>
        
        {/* Reset Settings */}
        <Button
          label="設定をリセット"
          variant="outline"
          onPress={() => {
            // Reset all settings to defaults
            setVisualIntensity(70);
            setAnimationsEnabled(true);
            setHapticsEnabled(true);
            
            // Provide feedback
            if (hapticsEnabled) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          }}
          style={styles.resetButton}
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
    marginBottom: 24,
  },
  description: {
    marginTop: 8,
    opacity: 0.8,
  },
  section: {
    marginBottom: 20,
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionIcon: {
    marginRight: 8,
  },
  setting: {
    marginBottom: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingDescription: {
    opacity: 0.7,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  testButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  resourceButton: {
    marginTop: 12,
  },
  resetButton: {
    marginVertical: 20,
  },
});
