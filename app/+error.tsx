/**
 * Error Screen
 * 
 * This is the global error screen for the application.
 * It shows a friendly error message with HSP-friendly design.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Link, ErrorBoundaryProps } from 'expo-router';

import { H2, Body1 } from '@components/ui/atoms/Typography';
import Button from '@components/ui/atoms/Button';
import { AppTheme } from '@config/theme';

export default function ErrorScreen(props: ErrorBoundaryProps) {
  const theme = useTheme() as AppTheme;
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Image
          source={require('@assets/images/owl-sad.png')}
          style={styles.image}
          resizeMode="contain"
        />
        
        <H2 style={styles.title}>問題が発生しました</H2>
        
        <Body1 style={styles.message}>
          申し訳ありませんが、予期せぬエラーが発生しました。リラックスして、もう一度試してみてください。
        </Body1>
        
        <View style={styles.actions}>
          <Button
            label="ホームに戻る"
            onPress={() => props.retry()}
            style={styles.button}
          />
          
          <Link href="/" asChild>
            <Button
              label="アプリを再起動"
              variant="outline"
              style={styles.button}
            />
          </Link>
        </View>
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
  actions: {
    width: '100%',
  },
  button: {
    marginBottom: 12,
  },
});
