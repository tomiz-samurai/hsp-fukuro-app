/**
 * Root Layout
 * 
 * This is the root layout component for Expo Router.
 * It sets up global providers, theme, fonts, and navigation structure.
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Slot, SplashScreen } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from '@store/slices/uiSlice';
import { lightTheme, darkTheme } from '@config/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@components/providers/AuthProvider';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

// Create query client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { isDarkTheme } = useThemeStore();
  const theme = isDarkTheme ? darkTheme : lightTheme;

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    'NotoSansJP-Light': require('@assets/fonts/NotoSansJP-Light.ttf'),
    'NotoSansJP-Regular': require('@assets/fonts/NotoSansJP-Regular.ttf'),
    'NotoSansJP-Medium': require('@assets/fonts/NotoSansJP-Medium.ttf'),
  });

  // Hide splash screen when resources are loaded
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Show splash screen while loading fonts
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <AuthProvider>
            <PaperProvider theme={theme}>
              <StatusBar style={isDarkTheme ? 'light' : 'dark'} />
              <Slot />
            </PaperProvider>
          </AuthProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
