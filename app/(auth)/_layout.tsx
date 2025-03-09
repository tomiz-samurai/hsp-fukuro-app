/**
 * Authentication Layout
 * 
 * This layout is used for all authentication-related screens.
 * It provides consistent styling and navigation options for the auth flow.
 */

import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { AppTheme } from '@config/theme';

export default function AuthLayout() {
  const theme = useTheme() as AppTheme;
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
        animation: 'fade',
      }}
    />
  );
}
