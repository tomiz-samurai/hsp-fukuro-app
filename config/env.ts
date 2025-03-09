/**
 * Environment Variables Configuration
 * 
 * This file manages environment variables for different build environments.
 * It uses Expo Constants to access variables from app.config.ts extra.
 */

import Constants from 'expo-constants';

// Define the structure of our environment variables
interface Env {
  // Supabase
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  
  // OpenAI
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  
  // App configuration
  APP_ENV: 'development' | 'staging' | 'production';
  API_URL: string;
  
  // Features
  ENABLE_ANALYTICS: boolean;
  PREMIUM_FEATURES_ENABLED: boolean;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}

// Default fallback values for development (should be overridden in production)
const DEFAULT_ENV: Env = {
  SUPABASE_URL: 'https://your-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key',
  OPENAI_API_KEY: 'your-openai-key',
  OPENAI_MODEL: 'gpt-4o',
  APP_ENV: 'development',
  API_URL: 'https://api.fukuro-app.com',
  ENABLE_ANALYTICS: false,
  PREMIUM_FEATURES_ENABLED: true, // Enable premium features in development
  LOG_LEVEL: 'debug',
};

// Get values from Expo Constants
const getExpoConstants = () => {
  try {
    return Constants.expoConfig?.extra || {};
  } catch (error) {
    console.warn('Failed to load Expo Constants:', error);
    return {};
  }
};

// Merge default values with values from Expo Constants
const expoConstants = getExpoConstants();
const ENV: Env = {
  ...DEFAULT_ENV,
  ...(expoConstants as Partial<Env>),
};

// Helper function to get environment variables
export const getEnv = <K extends keyof Env>(key: K): Env[K] => {
  if (ENV[key] === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return ENV[key];
};

// Export individual environment variables for convenience
export const SUPABASE_URL = getEnv('SUPABASE_URL');
export const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY');
export const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');
export const OPENAI_MODEL = getEnv('OPENAI_MODEL');
export const APP_ENV = getEnv('APP_ENV');
export const API_URL = getEnv('API_URL');
export const ENABLE_ANALYTICS = getEnv('ENABLE_ANALYTICS');
export const PREMIUM_FEATURES_ENABLED = getEnv('PREMIUM_FEATURES_ENABLED');
export const LOG_LEVEL = getEnv('LOG_LEVEL');

// Helper function for checking environment
export const isDevelopment = APP_ENV === 'development';
export const isStaging = APP_ENV === 'staging';
export const isProduction = APP_ENV === 'production';

export default ENV;
