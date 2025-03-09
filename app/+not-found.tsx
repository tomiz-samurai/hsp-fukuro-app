/**
 * Not Found Screen
 * 
 * Displayed when a route is not found, with HSP-friendly design.
 * Features a calming design and easy navigation back.
 */

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H2, Body1 } from '@components/ui/atoms/Typography';
import { AppTheme } from '@config/theme';

// Not found screen component
export default function NotFoundScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  
  // Navigate back to home
  const handleGoHome = () => {
    router.replace('/');
  };
  
  return (
    <ScreenWrapper
      padding="medium"
      safeAreaProps={{
        edges: ['top', 'bottom'],
      }}
    >
      <View style={styles.container}>
        <Card style={styles.card} elevation="low">
          <View style={styles.content}>
            {/* Owl image */}
            <Image
              source={require('@assets/images/owl-confused.png')}
              style={styles.image}
              resizeMode="contain"
            />
            
            <H2 style={styles.title}>ページが見つかりません</H2>
            
            <Body1 style={styles.message}>
              お探しのページはありません。お手数ですが、ホーム画面にお戻りください。
            </Body1>
            
            <Button
              label="ホームに戻る"
              onPress={handleGoHome}
              style={styles.button}
            />
          </View>
        </Card>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    minWidth: 150,
  },
});
