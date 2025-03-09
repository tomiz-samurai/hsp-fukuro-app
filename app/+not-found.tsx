/**
 * Not Found Screen
 * 
 * This is the global 404 screen for the application.
 * It shows a friendly message with HSP-friendly design when a route is not found.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Link } from 'expo-router';

import { H2, Body1 } from '@components/ui/atoms/Typography';
import Button from '@components/ui/atoms/Button';
import { AppTheme } from '@config/theme';

export default function NotFoundScreen() {
  const theme = useTheme() as AppTheme;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('@assets/images/owl-surprised.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <H2 style={styles.title}>ページが見つかりません</H2>
        
        <Body1 style={styles.message}>
          お探しのページが見つかりませんでした。リラックスして、ホーム画面に戻りましょう。
        </Body1>
        
        <Link href="/" asChild>
          <Button
            label="ホームに戻る"
            style={styles.button}
          />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  button: {
    marginBottom: 12,
  },
});
