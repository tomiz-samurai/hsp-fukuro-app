/**
 * Authentication State Management
 * 
 * This file manages auth-related state using Zustand.
 * It complements the AuthProvider by storing non-sensitive user state.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@config/constants';
import { User } from '@lib/supabase/schema';

// Auth state interface
interface AuthState {
  // User information
  isAuthenticated: boolean;
  userPreferences: {
    notificationsEnabled: boolean;
    emailUpdatesEnabled: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    reducedAnimations: boolean;
    autoplayMedia: boolean;
    textSize: 'small' | 'medium' | 'large';
  };
  
  // Premium status
  isPremium: boolean;
  premiumFeatures: {
    unlimitedChat: boolean;
    allMeditations: boolean;
    allSounds: boolean;
    detailedAnalytics: boolean;
  };
  
  // Daily usage
  dailyUsage: {
    chatCount: number;
    lastChatDate: string | null;
    meditationMinutes: number;
    lastMeditationDate: string | null;
  };
  
  // Actions
  setAuthenticated: (isAuthenticated: boolean) => void;
  updateUserPreferences: (preferences: Partial<AuthState['userPreferences']>) => void;
  setPremiumStatus: (isPremium: boolean) => void;
  updatePremiumFeatures: (features: Partial<AuthState['premiumFeatures']>) => void;
  incrementChatCount: () => void;
  resetDailyChatCount: () => void;
  addMeditationMinutes: (minutes: number) => void;
  resetState: () => void;
}

// Initial state
const initialState = {
  isAuthenticated: false,
  userPreferences: {
    notificationsEnabled: true,
    emailUpdatesEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
    reducedAnimations: false,
    autoplayMedia: false,
    textSize: 'medium' as const,
  },
  isPremium: false,
  premiumFeatures: {
    unlimitedChat: false,
    allMeditations: false,
    allSounds: false,
    detailedAnalytics: false,
  },
  dailyUsage: {
    chatCount: 0,
    lastChatDate: null,
    meditationMinutes: 0,
    lastMeditationDate: null,
  },
};

// Create auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Set authentication status
      setAuthenticated: (isAuthenticated) => 
        set({ isAuthenticated }),
      
      // Update user preferences
      updateUserPreferences: (preferences) => 
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            ...preferences,
          },
        })),
      
      // Set premium status
      setPremiumStatus: (isPremium) => 
        set({ isPremium }),
      
      // Update premium features
      updatePremiumFeatures: (features) => 
        set((state) => ({
          premiumFeatures: {
            ...state.premiumFeatures,
            ...features,
          },
        })),
      
      // Increment chat count for free tier limitation
      incrementChatCount: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        const lastChatDate = state.dailyUsage.lastChatDate;
        
        // Reset count if it's a new day
        if (lastChatDate !== today) {
          set({
            dailyUsage: {
              ...state.dailyUsage,
              chatCount: 1,
              lastChatDate: today,
            },
          });
        } else {
          set({
            dailyUsage: {
              ...state.dailyUsage,
              chatCount: state.dailyUsage.chatCount + 1,
            },
          });
        }
      },
      
      // Reset daily chat count
      resetDailyChatCount: () => 
        set((state) => ({
          dailyUsage: {
            ...state.dailyUsage,
            chatCount: 0,
            lastChatDate: null,
          },
        })),
      
      // Add meditation minutes
      addMeditationMinutes: (minutes) => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        const lastMeditationDate = state.dailyUsage.lastMeditationDate;
        
        // Reset minutes if it's a new day
        if (lastMeditationDate !== today) {
          set({
            dailyUsage: {
              ...state.dailyUsage,
              meditationMinutes: minutes,
              lastMeditationDate: today,
            },
          });
        } else {
          set({
            dailyUsage: {
              ...state.dailyUsage,
              meditationMinutes: state.dailyUsage.meditationMinutes + minutes,
            },
          });
        }
      },
      
      // Reset state (for logout)
      resetState: () => set(initialState),
    }),
    {
      name: STORAGE_KEYS.USER_PROFILE,
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist sensitive information
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        isPremium: state.isPremium,
        premiumFeatures: state.premiumFeatures,
        dailyUsage: state.dailyUsage,
      }),
    }
  )
);

// Check if user reached free chat limit
export const useHasReachedChatLimit = () => {
  const { isPremium, premiumFeatures, dailyUsage } = useAuthStore();
  const isChatUnlimited = isPremium && premiumFeatures.unlimitedChat;
  const chatCount = dailyUsage.chatCount;
  
  // If premium with unlimited chat, never reaches limit
  if (isChatUnlimited) {
    return false;
  }
  
  // Free tier limit is 5 chats per day
  return chatCount >= 5;
};

// Get remaining free chat count
export const useRemainingChatCount = () => {
  const { isPremium, premiumFeatures, dailyUsage } = useAuthStore();
  const isChatUnlimited = isPremium && premiumFeatures.unlimitedChat;
  
  if (isChatUnlimited) {
    return Infinity;
  }
  
  return Math.max(0, 5 - dailyUsage.chatCount);
};

export default useAuthStore;
