/**
 * Application Constants
 * 
 * This file contains global constants used throughout the application.
 * It centralizes important values for easy access and modification.
 */

// Secure storage keys
export const SECURE_STORE_KEYS = {
  AUTH_TOKEN: 'fukuro.auth.token',
  REFRESH_TOKEN: 'fukuro.auth.refresh_token',
  USER_PROFILE: 'fukuro.user.profile',
  SETTINGS: 'fukuro.user.settings',
  CHAT_HISTORY: 'fukuro.chat.history',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME_PREFERENCE: 'fukuro.ui.theme',
  LANGUAGE_PREFERENCE: 'fukuro.ui.language',
  LAST_MEDITATION: 'fukuro.meditation.last_session',
  SOUND_PREFERENCES: 'fukuro.sound.preferences',
  ONBOARDING_COMPLETED: 'fukuro.onboarding.completed',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  CHAT: '/chat',
  MEDITATION: '/meditation',
  SOUNDS: '/sounds',
};

// Navigation routes
export const ROUTES = {
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
  },
  MAIN: {
    HOME: '/',
    CHAT: '/chat',
    MEDITATION: '/meditation',
    SOUNDS: '/sounds',
    PROFILE: '/profile',
    SETTINGS: '/profile/settings',
  },
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'ネットワーク接続を確認してください。',
  AUTH_ERROR: '認証に失敗しました。メールアドレスとパスワードを確認してください。',
  SERVER_ERROR: 'サーバーエラーが発生しました。後でもう一度お試しください。',
  UNKNOWN_ERROR: '予期せぬエラーが発生しました。後でもう一度お試しください。',
  FIELD_REQUIRED: 'このフィールドは必須です。',
  INVALID_EMAIL: '有効なメールアドレスを入力してください。',
  PASSWORD_TOO_SHORT: 'パスワードは8文字以上である必要があります。',
  PASSWORDS_NOT_MATCH: 'パスワードが一致しません。',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'ログインに成功しました。',
  REGISTER_SUCCESS: '登録が完了しました。メールアドレスの確認をお願いします。',
  PASSWORD_RESET_EMAIL: 'パスワードリセット用のメールを送信しました。',
  PROFILE_UPDATE_SUCCESS: 'プロフィールが更新されました。',
  SETTINGS_SAVED: '設定が保存されました。',
};

// Sound categories
export const SOUND_CATEGORIES = {
  NATURE: '自然',
  AMBIENT: '環境',
  MUSIC: '音楽',
  BINAURAL: 'バイノーラル',
  WHITE_NOISE: 'ホワイトノイズ',
};

// Meditation types
export const MEDITATION_TYPES = {
  BREATHING: '呼吸法',
  BODY_SCAN: 'ボディスキャン',
  MINDFULNESS: 'マインドフルネス',
  GUIDED: 'ガイド付き',
  SLEEP: '睡眠誘導',
};

// Premium features
export const PREMIUM_FEATURES = {
  UNLIMITED_CHAT: '無制限チャット',
  ALL_MEDITATIONS: '全瞑想コンテンツ',
  ALL_SOUNDS: '全サウンド',
  DETAILED_ANALYTICS: '詳細な分析',
  CUSTOMIZATION: 'カスタマイズ機能',
};

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'fukuro.subscription.monthly',
    price: '¥980',
    period: '月額',
  },
  YEARLY: {
    id: 'fukuro.subscription.yearly',
    price: '¥7,800',
    period: '年額',
    savings: '2ヶ月分無料',
  },
};

// App-wide timing constants
export const TIMING = {
  ANIMATION_DURATION: 300, // ms
  DEBOUNCE_TIME: 300, // ms
  API_TIMEOUT: 10000, // ms
  AUTO_DISMISS_TOAST: 3000, // ms
  AUTO_LOGOUT: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
};

// Export all constants as default
export default {
  SECURE_STORE_KEYS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  ROUTES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  SOUND_CATEGORIES,
  MEDITATION_TYPES,
  PREMIUM_FEATURES,
  SUBSCRIPTION_PLANS,
  TIMING,
};
