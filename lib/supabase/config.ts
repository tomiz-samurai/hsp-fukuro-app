/**
 * Supabase Configuration
 * 
 * This file contains the Supabase configuration settings for different environments.
 * It provides API endpoints, keys, and other settings for Supabase services.
 */

// Supabase query settings
export const SUPABASE_QUERY_CONFIG = {
  DEFAULT_PAGE_SIZE: 20, 
  MAX_PAGE_SIZE: 100,
  CACHE_TIME: 1000 * 60 * 5, // 5 minutes
  STALE_TIME: 1000 * 60 * 2, // 2 minutes
  RETRY_DELAY: 1000 * 3,     // 3 seconds
  MAX_RETRIES: 3,
};

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  SOUNDS: 'sounds',
  MEDITATION: 'meditation',
  PUBLIC: 'public',
};

// RLS policy identifiers - helps with debugging
export const RLS_POLICIES = {
  USER_OWN_DATA: 'user_own_data',
  PUBLIC_READ: 'public_read',
  AUTHENTICATED_READ: 'authenticated_read',
  ADMIN_FULL_ACCESS: 'admin_full_access',
};

// Chat message limitations
export const CHAT_CONFIG = {
  FREE_DAILY_LIMIT: 5,
  MAX_MESSAGE_LENGTH: 500,
  MAX_HISTORY_CONTEXT: 10, // Number of previous messages to include for context
  MIN_TYPING_DELAY_MS: 500,
  MAX_TYPING_DELAY_MS: 1500,
};

// Meditation sessions limitations
export const MEDITATION_CONFIG = {
  FREE_MAX_SESSIONS: 3, // Number of free sessions
  FREE_MAX_DURATION: 10, // Maximum duration in minutes for free tier
};

// Sound limitations
export const SOUND_CONFIG = {
  FREE_MAX_SOUNDS: 5, // Number of free sounds
  MAX_FAVORITES: 20, // Maximum number of favorites
};

// Export all configurations
export const SUPABASE_CONFIG = {
  QUERY: SUPABASE_QUERY_CONFIG,
  STORAGE: STORAGE_BUCKETS,
  RLS: RLS_POLICIES,
  CHAT: CHAT_CONFIG,
  MEDITATION: MEDITATION_CONFIG,
  SOUND: SOUND_CONFIG,
};

export default SUPABASE_CONFIG;
