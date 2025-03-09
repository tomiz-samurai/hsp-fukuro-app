/**
 * Error Screen
 * 
 * Global error boundary screen with HSP-friendly design.
 * Provides gentle error feedback and recovery options.
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { H2, Body1 } from '@components/ui/atoms/Typography';
import Button from '@components/ui/atoms/Button';
import { AppTheme } from '@config/theme';

interface ErrorScreenProps {
  error: Error;
  resetError: () => void;
}

export default function ErrorScreen({ error, resetError }: ErrorScreenProps) {
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  
  const handleReset = () => {
    // Try to reset the error
    resetError();
  };
  
  const handleGoHome = () => {
    // Navigate to the home screen
    router.replace('/');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.error}20` }]}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        </View>
        
        {/* Message */}
        <H2 style={styles.title}>問題が発生しました</H2>
        <Body1 style={styles.message}>
          申し訳ありませんが、アプリでエラーが発生しました。リラックスして、もう一度お試しください。
        </Body1>
        
        {/* Error details for development only */}
        {__DEV__ && (
          <View style={[styles.errorDetails, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Body1 style={{ fontFamily: 'monospace' }}>{error.message}</Body1>
          </View>
        )}
        
        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="再試行"
            onPress={handleReset}
            style={styles.button}
            variant="primary"
          />
          <Button
            label="ホームに戻る"
            onPress={handleGoHome}
            style={styles.button}
            variant="outline"
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
    maxWidth: 400,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  errorDetails: {
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 24,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    marginHorizontal: 8,
    minWidth: 120,
  },
});
