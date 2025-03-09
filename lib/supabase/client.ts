/**
 * Supabase Client Configuration
 * 
 * This file initializes and exports the Supabase client for database operations.
 * It configures the client with proper error handling and authentication persistence.
 */

import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@config/env';

// Custom secure storage implementation for Supabase auth persistence
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

// Initialize the Supabase client with platform-specific configuration
const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: Platform.OS === 'web' 
        ? localStorage 
        : ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);

export default supabase;
