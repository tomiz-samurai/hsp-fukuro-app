/**
 * Login Screen
 * 
 * The login screen for user authentication with HSP-friendly design.
 * It includes email/password login form with validation and error handling.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from 'expo-router';
import { useTheme } from 'react-native-paper';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import FormField from '@components/ui/molecules/FormField';
import Button from '@components/ui/atoms/Button';
import { H1, H3, Body1, Body2 } from '@components/ui/atoms/Typography';
import Card from '@components/ui/molecules/Card';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { ERROR_MESSAGES } from '@config/constants';
import { AppTheme } from '@config/theme';

// Form validation schema
const loginSchema = z.object({
  email: z.string()
    .min(1, ERROR_MESSAGES.FIELD_REQUIRED)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z.string()
    .min(1, ERROR_MESSAGES.FIELD_REQUIRED),
});

// Form data type
type LoginFormData = z.infer<typeof loginSchema>;

// Login screen component
export default function LoginScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { signIn } = useAuth();
  const { showToast } = useToastStore();
  
  // Form state
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Error state
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Handle login submission
  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginError(null);
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        setLoginError(error.message || ERROR_MESSAGES.AUTH_ERROR);
        return;
      }
      
      // Success - navigation is handled by AuthProvider
    } catch (error: any) {
      setLoginError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };
  
  return (
    <ScreenWrapper 
      scrollable
      safeAreaProps={{
        edges: ['top', 'bottom'],
      }}
    >
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('@assets/images/app-logo-placeholder.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <H1 style={styles.appName}>Fukuro</H1>
          <Body1 align="center" style={styles.subtitle}>
            HSPのためのマインドフルネスパートナー
          </Body1>
        </View>
        
        {/* Login Form Card */}
        <Card style={styles.formCard} elevation="low">
          <H3 style={styles.formTitle}>ログイン</H3>
          
          {/* Error message */}
          {loginError && (
            <Body2 
              style={[styles.errorText, { color: theme.colors.error }]}
              align="center"
            >
              {loginError}
            </Body2>
          )}
          
          {/* Form fields */}
          <FormField
            control={control}
            name="email"
            label="メールアドレス"
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            rules={{ required: true }}
            testID="login-email"
          />
          
          <FormField
            control={control}
            name="password"
            label="パスワード"
            placeholder="パスワードを入力"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            rules={{ required: true }}
            testID="login-password"
          />
          
          {/* Submit button */}
          <Button
            label="ログイン"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            fullWidth
            style={styles.submitButton}
            testID="login-submit"
          />
          
          {/* Forgot password link */}
          <Link href="/forgot-password" asChild>
            <TouchableOpacity style={styles.forgotPassword}>
              <Body2 color={theme.colors.primary}>パスワードをお忘れですか？</Body2>
            </TouchableOpacity>
          </Link>
        </Card>
        
        {/* Register link */}
        <View style={styles.registerContainer}>
          <Body1>アカウントをお持ちでないですか？</Body1>
          <Link href="/register" asChild>
            <TouchableOpacity style={styles.registerLink}>
              <Body1 color={theme.colors.primary} weight="medium">新規登録</Body1>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  appName: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    opacity: 0.8,
  },
  formCard: {
    width: '100%',
    padding: 24,
    marginBottom: 24,
  },
  formTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  errorText: {
    marginBottom: 16,
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(229, 115, 115, 0.1)',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'center',
    padding: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerLink: {
    marginLeft: 8,
    padding: 4,
  },
});
