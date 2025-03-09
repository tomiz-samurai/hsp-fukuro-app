/**
 * UI State Management
 * 
 * This file manages UI-related state using Zustand.
 * It includes theme, toast notifications, and modal management.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@config/constants';

// Toast notification types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast notification interface
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Modal interface
export interface Modal {
  id: string;
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

// UI state interface
interface UIState {
  // Theme
  isDarkTheme: boolean;
  setTheme: (isDark: boolean) => void;
  toggleTheme: () => void;
  
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
  
  // Modals
  modals: Modal[];
  showModal: (id: string, component: React.ComponentType<any>, props?: Record<string, any>) => void;
  hideModal: (id: string) => void;
  hideAllModals: () => void;
  
  // Loading state
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  
  // Visual comfort settings for HSP users
  visualIntensity: number; // 0-100, where 0 is minimal and 100 is normal
  setVisualIntensity: (intensity: number) => void;
  
  // Animation settings
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  
  // Haptic feedback settings
  hapticsEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => void;
}

// Create UI store
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Theme state
      isDarkTheme: false,
      setTheme: (isDark) => set({ isDarkTheme: isDark }),
      toggleTheme: () => set((state) => ({ isDarkTheme: !state.isDarkTheme })),
      
      // Toast state
      toasts: [],
      showToast: (message, type, duration = 3000) => 
        set((state) => ({
          toasts: [
            ...state.toasts,
            { 
              id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              message,
              type,
              duration
            }
          ]
        })),
      hideToast: (id) => 
        set((state) => ({
          toasts: state.toasts.filter(toast => toast.id !== id)
        })),
      
      // Modal state
      modals: [],
      showModal: (id, component, props = {}) => 
        set((state) => ({
          modals: [...state.modals, { id, component, props }]
        })),
      hideModal: (id) => 
        set((state) => ({
          modals: state.modals.filter(modal => modal.id !== id)
        })),
      hideAllModals: () => set({ modals: [] }),
      
      // Loading state
      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),
      
      // Visual comfort settings for HSP users (default to 70% intensity)
      visualIntensity: 70,
      setVisualIntensity: (intensity) => set({ 
        visualIntensity: Math.max(0, Math.min(100, intensity)) 
      }),
      
      // Animation settings (default to enabled)
      animationsEnabled: true,
      setAnimationsEnabled: (enabled) => set({ animationsEnabled: enabled }),
      
      // Haptic feedback settings (default to enabled)
      hapticsEnabled: true,
      setHapticsEnabled: (enabled) => set({ hapticsEnabled: enabled }),
    }),
    {
      name: STORAGE_KEYS.THEME_PREFERENCE,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isDarkTheme: state.isDarkTheme,
        visualIntensity: state.visualIntensity,
        animationsEnabled: state.animationsEnabled,
        hapticsEnabled: state.hapticsEnabled,
      }),
    }
  )
);

// Theme related selectors
export const useThemeStore = () => {
  const isDarkTheme = useUIStore((state) => state.isDarkTheme);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  
  return { isDarkTheme, setTheme, toggleTheme };
};

// Toast related selectors
export const useToastStore = () => {
  const toasts = useUIStore((state) => state.toasts);
  const showToast = useUIStore((state) => state.showToast);
  const hideToast = useUIStore((state) => state.hideToast);
  
  return { toasts, showToast, hideToast };
};

// Modal related selectors
export const useModalStore = () => {
  const modals = useUIStore((state) => state.modals);
  const showModal = useUIStore((state) => state.showModal);
  const hideModal = useUIStore((state) => state.hideModal);
  const hideAllModals = useUIStore((state) => state.hideAllModals);
  
  return { modals, showModal, hideModal, hideAllModals };
};

// Accessibility related selectors
export const useAccessibilityStore = () => {
  const visualIntensity = useUIStore((state) => state.visualIntensity);
  const setVisualIntensity = useUIStore((state) => state.setVisualIntensity);
  const animationsEnabled = useUIStore((state) => state.animationsEnabled);
  const setAnimationsEnabled = useUIStore((state) => state.setAnimationsEnabled);
  const hapticsEnabled = useUIStore((state) => state.hapticsEnabled);
  const setHapticsEnabled = useUIStore((state) => state.setHapticsEnabled);
  
  return {
    visualIntensity,
    setVisualIntensity,
    animationsEnabled,
    setAnimationsEnabled,
    hapticsEnabled,
    setHapticsEnabled,
  };
};

export default useUIStore;
