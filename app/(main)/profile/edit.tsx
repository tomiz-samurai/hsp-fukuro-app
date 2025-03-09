/**
 * Profile Edit Screen
 * 
 * Allows users to update their profile information with HSP-friendly design.
 * Features gentle transitions, clear form fields, and visual comfort.
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import FormField from '@components/ui/molecules/FormField';
import Button from '@components/ui/atoms/Button';
import { H2, Body1, Body2 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@config/constants';
import { AppTheme } from '@config/theme';

// Form validation schema
const profileSchema = z.object({
  displayName: z.string().min(1, ERROR_MESSAGES.FIELD_REQUIRED),
  email: z.string().email(ERROR_MESSAGES.INVALID_EMAIL),
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
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  
  // Form
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.display_name || '',
      email: user?.email || '',
    },
  });
  
  // Set default values when profile changes
  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.display_name || '',
        email: user?.email || '',
      });
      
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile, user]);
  
  // Pick image from library
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('権限エラー', '画像を選択するには写真へのアクセス許可が必要です。');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        // Set avatar file
        setAvatarFile(result.assets[0].uri);
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('画像の選択中にエラーが発生しました。', 'error');
    }
  };
  
  // Take photo with camera
  const takePhoto = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('権限エラー', '写真を撮影するにはカメラへのアクセス許可が必要です。');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Haptic feedback
        if (hapticsEnabled) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        // Set avatar file
        setAvatarFile(result.assets[0].uri);
        setAvatarUrl(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showToast('写真の撮影中にエラーが発生しました。', 'error');
    }
  };
  
  // Show image options
  const showImageOptions = () => {
    Alert.alert(
      'プロフィール画像',
      '画像を選択してください',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'カメラで撮影', onPress: takePhoto },
        { text: 'ライブラリから選択', onPress: pickImage },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: () => {
            setAvatarUrl(null);
            setAvatarFile(null);
            
            // Haptic feedback
            if (hapticsEnabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        },
      ]
    );
  };
  
  // Submit form
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      
      // Upload avatar if changed
      let finalAvatarUrl = profile?.avatar_url || null;
      
      if (avatarFile) {
        // In a real app, we would upload the image to a storage service
        // and get the URL. For now, we'll just use the local URL.
        finalAvatarUrl = avatarUrl;
      } else if (avatarUrl === null && profile?.avatar_url) {
        // Avatar was removed
        finalAvatarUrl = null;
      }
      
      // Update profile
      const { error } = await updateProfile({
        display_name: data.displayName,
        avatar_url: finalAvatarUrl,
      });
      
      if (error) {
        console.error('Error updating profile:', error);
        showToast(error.message || 'プロフィールの更新中にエラーが発生しました。', 'error');
        setLoading(false);
        return;
      }
      
      // Success
      showToast('プロフィールが更新されました。', 'success');
      
      // Go back
      router.back();
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('プロフィールの更新中にエラーが発生しました。', 'error');
      setLoading(false);
    }
  };
  
  return (
    <ScreenWrapper scrollable>
      <Stack.Screen 
        options={{ 
          headerTitle: 'プロフィール編集',
          headerBackTitle: '戻る',
        }} 
      />
      
      <View style={styles.container}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={showImageOptions}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View 
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <H2 style={styles.avatarText}>
                  {profile?.display_name?.[0] || user?.email?.[0] || 'U'}
                </H2>
              </View>
            )}
            
            <View 
              style={[
                styles.editBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          
          <Body2 style={styles.avatarHelpText}>
            タップして画像を変更
          </Body2>
        </View>
        
        {/* Form */}
        <View style={styles.form}>
          <FormField
            control={control}
            name="displayName"
            label="表示名"
            placeholder="あなたの名前を入力"
            rules={{ required: true }}
            testID="profile-name"
          />
          
          <FormField
            control={control}
            name="email"
            label="メールアドレス"
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            rules={{ required: true }}
            disabled={true}
            testID="profile-email"
          />
          
          <Body2 style={styles.emailNote}>
            メールアドレスは変更できません
          </Body2>
          
          {/* Submit button */}
          <Button
            label="保存"
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting || loading}
            fullWidth
            style={styles.submitButton}
            testID="profile-submit"
          />
          
          {/* Cancel button */}
          <Button
            label="キャンセル"
            onPress={() => router.back()}
            variant="ghost"
            fullWidth
            style={styles.cancelButton}
            disabled={isSubmitting || loading}
            testID="profile-cancel"
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarHelpText: {
    opacity: 0.7,
  },
  form: {
    marginBottom: 24,
  },
  emailNote: {
    marginTop: -8,
    marginLeft: 8,
    opacity: 0.7,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 16,
  },
});
