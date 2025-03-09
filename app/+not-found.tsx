/**
 * Not Found Screen
 * 
 * HSP-friendly not found screen that displays when a route doesn't exist.
 * Features calming design, clear instructions, and navigation options.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';

import Button from '@components/ui/atoms/Button';
import { H2, Body1 } from '@components/ui/atoms/Typography';
import { AppTheme } from '@config/theme';

export default function NotFoundScreen() {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.content}>
        <Image
          source={require('@assets/images/owl-not-found.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        
        <H2 style={styles.title}>ページが見つかりません</H2>
        
        <Body1 style={styles.message}>
          お探しのページは見つかりませんでした。
          URLを確認するか、ホームに戻って再度お試しください。
        </Body1>
        
        <View style={styles.buttonsContainer}>
          <Button
            label="ホームに戻る"
            onPress={() => router.replace('/')}
            style={styles.button}
          />
          
          <Button
            label="戻る"
            onPress={() => router.back()}
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
