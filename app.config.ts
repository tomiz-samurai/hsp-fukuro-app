import { ExpoConfig, ConfigContext } from 'expo/config';

/**
 * Expo Configuration File
 * 
 * This file defines the configuration for the Expo application,
 * including app name, version, splash screen, and other settings.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'Fukuro',
  slug: 'fukuro-hsp-app',
  version: '0.1.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#F8F3E6'
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.fukuro.hspapp',
    buildNumber: '1',
    infoPlist: {
      UIBackgroundModes: [
        'audio'
      ]
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#F8F3E6'
    },
    package: 'com.fukuro.hspapp',
    versionCode: 1,
    permissions: [
      'VIBRATE'
    ]
  },
  web: {
    favicon: './assets/images/favicon.png'
  },
  extra: {
    eas: {
      projectId: 'your-project-id'
    }
  },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-image',
      {
        'photosPermission': 'Allow $(PRODUCT_NAME) to access your photos for profile picture selection.'
      }
    ],
    [
      'expo-av',
      {
        'microphonePermission': 'Allow $(PRODUCT_NAME) to access your microphone.'
      }
    ]
  ]
});
