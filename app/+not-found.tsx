/**
 * Not Found Screen
 * 
 * This screen is displayed when a route is not found.
 * It provides a gentle HSP-friendly error experience.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Button from '@components/ui/atoms/Button';
import { H2, Body1 } from '@components/ui/atoms/Typography';
import { AppTheme } from '@config/theme';

export default function NotFoundScreen() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="search-outline"
            size={80}
            color={theme.colors.primary}
            style={styles.icon}
          />
        </View>
        
        <H2 style={styles.title}>ページが見つかりません</H2>
        
        <Body1 style={styles.message}>
          お探しのページが見つかりませんでした。別のページをお試しください。
        </Body1>
        
        <Button
          label="ホームに戻る"
          onPress={() => router.replace('/')}
          style={styles.button}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  icon: {
    opacity: 0.8,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 32,
  },
  button: {
    minWidth: 200,
  },
});
