/**
 * Register Screen
 * 
 * The user registration screen with HSP-friendly design.
 * It includes a form for creating a new account with validation.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from 'expo-router';
import { useTheme } from 'react-native-paper';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import FormField from '@components/ui/molecules/FormField';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2 } from '@components/ui/atoms/Typography';
import Card from '@components/ui/molecules/Card';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@config/constants';
import { AppTheme } from '@config/theme';

// Form validation schema
const registerSchema = z.object({
  email: z.string()
    .min(1, ERROR_MESSAGES.FIELD_REQUIRED)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
  password: z.string()
    .min(8, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
  confirmPassword: z.string()
    .min(1, ERROR_MESSAGES.FIELD_REQUIRED),
}).refine((data) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.PASSWORDS_NOT_MATCH,
  path: ['confirmPassword'],
});

// Form data type
type RegisterFormData = z.infer<typeof registerSchema>;

// Register screen component
export default function RegisterScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { signUp } = useAuth();
  const { showToast } = useToastStore();
  
  // Form state
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  // Error state
  const [registerError, setRegisterError] = useState<string | null>(null);
  
  // Handle registration submission
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setRegisterError(null);
      const { error } = await signUp(data.email, data.password);
      
      if (error) {
        setRegisterError(error.message || ERROR_MESSAGES.AUTH_ERROR);
        return;
      }
      
      // Show success toast
      showToast(SUCCESS_MESSAGES.REGISTER_SUCCESS, 'success');
      
      // Navigate to login page
      router.replace('/login');
    } catch (error: any) {
      setRegisterError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
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
        {/* Header */}
        <View style={styles.header}>
          <H2 style={styles.title}>新規アカウント登録</H2>
          <Body1 align="center" style={styles.subtitle}>
            HSP向けマインドフルネスアプリで穏やかな日常を
          </Body1>
        </View>
        
        {/* Registration Form Card */}
        <Card style={styles.formCard} elevation="low">
          <H3 style={styles.formTitle}>ユーザー情報</H3>
          
          {/* Error message */}
          {registerError && (
            <Body2 
              style={[styles.errorText, { color: theme.colors.error }]}
              align="center"
            >
              {registerError}
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
            testID="register-email"
          />
          
          <FormField
            control={control}
            name="password"
            label="パスワード (8文字以上)"
            placeholder="パスワードを入力"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            rules={{ required: true, minLength: { value: 8, message: ERROR_MESSAGES.PASSWORD_TOO_SHORT } }}
            testID="register-password"
          />
          
          <FormField
            control={control}
            name="confirmPassword"
            label="パスワード (確認)"
            placeholder="パスワードを再入力"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            rules={{ required: true }}
            testID="register-confirm-password"
          />
          
          {/* Submit button */}
          <Button
            label="アカウント作成"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            fullWidth
            style={styles.submitButton}
            testID="register-submit"
          />
        </Card>
        
        {/* Privacy notice */}
        <View style={styles.privacyNotice}>
          <Body2 align="center" style={styles.privacyText}>
            アカウントを作成することで、当社の利用規約およびプライバシーポリシーに同意したことになります。
          </Body2>
        </View>
        
        {/* Login link */}
        <View style={styles.loginContainer}>
          <Body1>すでにアカウントをお持ちですか？</Body1>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginLink}>
              <Body1 color={theme.colors.primary} weight="medium">ログイン</Body1>
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.8,
  },
  formCard: {
    width: '100%',
    padding: 24,
    marginBottom: 16,
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
    marginTop: 16,
  },
  privacyNotice: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  privacyText: {
    opacity: 0.7,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    marginLeft: 8,
    padding: 4,
  },
});
