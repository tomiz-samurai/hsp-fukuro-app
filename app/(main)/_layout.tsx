/**
 * Main App Layout
 * 
 * This layout is used for the main authenticated app flow.
 * It provides the bottom tab navigation and common UI elements.
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { AppTheme } from '@config/theme';

// Tab navigation component
export default function AppLayout() {
  // Theme and accessibility settings
  const theme = useTheme() as AppTheme;
  const { visualIntensity } = useAccessibilityStore();
  
  // Adjust opacity for visual comfort of HSP users
  const getIconOpacity = () => {
    return visualIntensity / 100;
  };
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.surfaceVariant,
          elevation: 0,
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: theme.typography.fontFamily.regular,
          fontSize: 12,
        },
        tabBarItemStyle: {
          padding: 4,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'home' : 'home-outline'} 
              size={size} 
              color={color} 
              style={{ opacity: getIconOpacity() }}
            />
          ),
        }}
      />
      
      {/* Chat Tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'ミミ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'chatbubble' : 'chatbubble-outline'} 
              size={size} 
              color={color} 
              style={{ opacity: getIconOpacity() }}
            />
          ),
        }}
      />
      
      {/* Meditation Tab */}
      <Tabs.Screen
        name="meditation"
        options={{
          title: '瞑想',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'water' : 'water-outline'} 
              size={size} 
              color={color} 
              style={{ opacity: getIconOpacity() }}
            />
          ),
        }}
      />
      
      {/* Sounds Tab */}
      <Tabs.Screen
        name="sounds"
        options={{
          title: 'サウンド',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'musical-note' : 'musical-note-outline'} 
              size={size} 
              color={color} 
              style={{ opacity: getIconOpacity() }}
            />
          ),
        }}
      />
      
      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'プロフィール',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? 'person' : 'person-outline'} 
              size={size} 
              color={color} 
              style={{ opacity: getIconOpacity() }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
