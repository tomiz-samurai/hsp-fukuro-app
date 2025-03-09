/**
 * Forgot Password Screen
 * 
 * Allows users to request a password reset with HSP-friendly design.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, Link } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import FormField from '@components/ui/molecules/FormField';
import Button from '@components/ui/atoms/Button';
import { H2, Body1 } from '@components/ui/atoms/Typography';
import Card from '@components/ui/molecules/Card';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@config/constants';
import { AppTheme } from '@config/theme';

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, ERROR_MESSAGES.FIELD_REQUIRED)
    .email(ERROR_MESSAGES.INVALID_EMAIL),
});

// Form data type
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Forgot password screen component
export default function ForgotPasswordScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { resetPassword } = useAuth();
  const { showToast } = useToastStore();
  
  // Form state
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
  
  // Error and success state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setError(null);
      
      // Call reset password function
      const { error } = await resetPassword(data.email);
      
      if (error) {
        setError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
        return;
      }
      
      // Show success message
      setSuccess(true);
      showToast(SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL, 'success');
    } catch (error: any) {
      setError(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  };
  
  // Go back to login
  const handleGoBack = () => {
    router.back();
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <H2 style={styles.title}>パスワードをリセット</H2>
          
          <Body1 style={styles.subtitle}>
            登録したメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
          </Body1>
        </View>
        
        {/* Form card */}
        <Card style={styles.formCard} elevation="low">
          {/* Success message */}
          {success ? (
            <View style={styles.successContainer}>
              <View 
                style={[
                  styles.successIcon,
                  { backgroundColor: theme.colors.success },
                ]}
              >
                <Ionicons name="checkmark" size={40} color="white" />
              </View>
              
              <H2 style={styles.successTitle}>メールを送信しました</H2>
              
              <Body1 style={styles.successText}>
                パスワードリセット用のリンクをメールでお送りしました。メールの指示に従ってパスワードを再設定してください。
              </Body1>
              
              <Link href="/login" asChild>
                <Button
                  label="ログイン画面へ戻る"
                  style={styles.loginButton}
                />
              </Link>
            </View>
          ) : (
            <>
              {/* Error message */}
              {error && (
                <View 
                  style={[
                    styles.errorContainer,
                    { backgroundColor: `${theme.colors.errorContainer}66` },
                  ]}
                >
                  <Ionicons 
                    name="alert-circle" 
                    size={20} 
                    color={theme.colors.error}
                    style={styles.errorIcon}
                  />
                  <Body1 style={{ color: theme.colors.error }}>
                    {error}
                  </Body1>
                </View>
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
                testID="forgot-password-email"
              />
              
              {/* Submit button */}
              <Button
                label="リセットリンクを送信"
                onPress={handleSubmit(onSubmit)}
                isLoading={isSubmitting}
                fullWidth
                style={styles.submitButton}
                testID="forgot-password-submit"
              />
            </>
          )}
        </Card>
        
        {/* Login link */}
        {!success && (
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginLink}>
              <Body1 color={theme.colors.primary}>ログイン画面へ戻る</Body1>
            </TouchableOpacity>
          </Link>
        )}
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    opacity: 0.8,
  },
  formCard: {
    padding: 24,
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorIcon: {
    marginRight: 8,
  },
  submitButton: {
    marginTop: 8,
  },
  loginLink: {
    alignSelf: 'center',
    padding: 16,
  },
  successContainer: {
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    marginBottom: 16,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  loginButton: {
    marginTop: 16,
  },
});
