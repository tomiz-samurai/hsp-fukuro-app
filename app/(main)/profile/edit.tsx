/**
 * Profile Edit Screen
 * 
 * Allows users to edit their profile information with HSP-friendly design.
 * Features gentle input fields, simple layout, and clear instructions.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import FormField from '@components/ui/molecules/FormField';
import Button from '@components/ui/atoms/Button';
import { H2, H3, Body1, Body2 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { UserUpdate } from '@lib/supabase/schema';
import supabase from '@lib/supabase/client';
import { STORAGE_BUCKETS } from '@lib/supabase/config';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@config/constants';
import { AppTheme } from '@config/theme';

// Form validation schema
const profileSchema = z.object({
  display_name: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
});

// Form data type
type ProfileFormData = z.infer<typeof profileSchema>;

// Profile edit screen component
export default function ProfileEditScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile, updateProfile } = useAuth();
  const { showToast } = useToastStore();
  const { hapticsEnabled } = useAccessibilityStore();
  
  // State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name || '',
    },
  });
  
  // Set initial form values
  useEffect(() => {
    if (profile) {
      setValue('display_name', profile.display_name || '');
    }
  }, [profile, setValue]);
  
  // Pick image from library
  const handleImagePick = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          '権限が必要です',
          '画像を選択するには、画像ライブラリへのアクセス許可が必要です。'
        );
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Upload image
        await uploadImage(result.assets[0].uri);
        
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      
      showToast(ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
    }
  };
  
  // Upload image to Supabase storage
  const uploadImage = async (uri: string) => {
    try {
      if (!user) return;
      
      setIsUploading(true);
      
      // Prepare file
      const fileName = `avatar-${user.id}-${Date.now()}`;
      const fileExt = uri.split('.').pop();
      const filePath = `${fileName}.${fileExt}`;
      
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .upload(filePath, blob);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKETS.AVATARS)
        .getPublicUrl(filePath);
      
      // Set avatar URL
      const publicUrl = urlData.publicUrl;
      setAvatarUrl(publicUrl);
      
      // Update profile
      if (profile) {
        await updateProfile({
          avatar_url: publicUrl,
        });
      }
      
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      
      setIsUploading(false);
      showToast(ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
    }
  };
  
  // Remove avatar
  const handleRemoveAvatar = async () => {
    try {
      if (!user || !profile?.avatar_url) return;
      
      // Confirm removal
      Alert.alert(
        'アバター削除',
        'アバター画像を削除してもよろしいですか？',
        [
          { 
            text: 'キャンセル', 
            style: 'cancel',
          },
          {
            text: '削除',
            onPress: async () => {
              setIsUploading(true);
              
              // Extract file path from URL
              const filePathMatch = profile.avatar_url?.match(/\/([^/]+)$/);
              const filePath = filePathMatch ? filePathMatch[1] : null;
              
              if (filePath) {
                // Delete from storage
                await supabase.storage
                  .from(STORAGE_BUCKETS.AVATARS)
                  .remove([filePath]);
              }
              
              // Update profile
              await updateProfile({
                avatar_url: null,
              });
              
              // Clear avatar URL
              setAvatarUrl(null);
              
              setIsUploading(false);
              
              // Haptic feedback
              if (hapticsEnabled) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              
              showToast('アバターを削除しました。', 'success');
            },
            style: 'destructive',
          },
        ]
      );
    } catch (error) {
      console.error('Error removing avatar:', error);
      
      setIsUploading(false);
      showToast(ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
    }
  };
  
  // Save profile
  const handleSaveProfile = async (data: ProfileFormData) => {
    try {
      if (!user) return;
      
      setIsSaving(true);
      
      // Prepare update
      const updates: UserUpdate = {
        display_name: data.display_name,
      };
      
      // Update profile
      const { error } = await updateProfile(updates);
      
      if (error) {
        throw error;
      }
      
      setIsSaving(false);
      
      // Haptic feedback
      if (hapticsEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      showToast(SUCCESS_MESSAGES.PROFILE_UPDATE_SUCCESS, 'success');
      
      // Go back to profile
      router.back();
    } catch (error) {
      console.error('Error saving profile:', error);
      
      setIsSaving(false);
      showToast(ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
    }
  };
  
  return (
    <ScreenWrapper>
      <Stack.Screen 
        options={{ 
          title: 'プロフィール編集',
          headerShown: true,
          headerBackTitle: '戻る',
        }} 
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {isUploading ? (
                <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <ActivityIndicator color={theme.colors.primary} />
                </View>
              ) : avatarUrl ? (
                <Image 
                  source={{ uri: avatarUrl }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={[styles.defaultAvatar, { backgroundColor: theme.colors.primary }]}>
                  <H2 style={{ color: theme.colors.background }}>
                    {profile?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </H2>
                </View>
              )}
              
              {/* Avatar actions */}
              <View style={styles.avatarActions}>
                <TouchableOpacity
                  style={[styles.avatarButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleImagePick}
                  disabled={isUploading}
                >
                  <Ionicons name="image-outline" size={18} color={theme.colors.background} />
                </TouchableOpacity>
                
                {avatarUrl && (
                  <TouchableOpacity
                    style={[styles.avatarButton, { backgroundColor: theme.colors.error }]}
                    onPress={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <Ionicons name="trash-outline" size={18} color={theme.colors.background} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
            
            <Body1 style={styles.avatarHelp}>
              タップしてプロフィール画像を変更
            </Body1>
          </View>
          
          {/* Form */}
          <View style={styles.formSection}>
            <FormField
              control={control}
              name="display_name"
              label="表示名"
              placeholder="表示名を入力"
              autoCapitalize="words"
              testID="display-name-input"
              rules={{ required: true }}
            />
            
            {/* Email (read-only) */}
            <View style={styles.readOnlyField}>
              <Body1 style={styles.fieldLabel}>メールアドレス</Body1>
              <Body1 style={styles.fieldValue}>{user?.email}</Body1>
              <Body2 style={styles.fieldNote}>メールアドレスは変更できません</Body2>
            </View>
          </View>
          
          {/* Save button */}
          <Button
            label="保存"
            onPress={handleSubmit(handleSaveProfile)}
            isLoading={isSaving}
            fullWidth
            style={styles.saveButton}
            testID="save-profile-button"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarActions: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  avatarHelp: {
    marginTop: 8,
    opacity: 0.7,
  },
  formSection: {
    marginBottom: 24,
  },
  readOnlyField: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  fieldValue: {
    marginBottom: 4,
  },
  fieldNote: {
    opacity: 0.5,
  },
  saveButton: {
    marginBottom: 16,
  },
});
