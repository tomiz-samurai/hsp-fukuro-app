/**
 * Error Screen
 * 
 * HSP-friendly error screen that displays when a route fails to load.
 * Features calming design, clear instructions, and recovery options.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';

import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1 } from '@components/ui/atoms/Typography';
import { AppTheme } from '@config/theme';

export default function ErrorScreen() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <Image
          source={require('@assets/images/owl-error.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        
        <H2 style={styles.title}>問題が発生しました</H2>
        
        <Body1 style={styles.message}>
          申し訳ありませんが、エラーが発生しました。
          深呼吸をして、少し落ち着いてから再試行してください。
          問題が解決しない場合は、サポートにお問い合わせください。
        </Body1>
        
        <View style={styles.buttonsContainer}>
          <Button
            label="ホームに戻る"
            onPress={() => router.replace('/')}
            style={styles.button}
          />
          
          <Button
            label="再試行"
            onPress={() => router.reload()}
            variant="outline"
            style={styles.button}
          />
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
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 500,
  },
  illustration: {
    width: 200,
    height: 200,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.8,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  button: {
    minWidth: 120,
    margin: 8,
  },
});
