/**
 * Authentication Provider
 * 
 * This component provides authentication context and handles user session management.
 * It integrates with Supabase Auth and provides auth state to the component tree.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { router, useSegments, usePathname } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import supabase from '@lib/supabase/client';
import { SECURE_STORE_KEYS } from '@config/constants';
import { User as AppUser } from '@lib/supabase/schema';

// Define the auth context state type
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: AppUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: Error | null; data: AppUser | null }>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true,
  signIn: async () => ({ error: new Error('AuthProvider not initialized') }),
  signUp: async () => ({ error: new Error('AuthProvider not initialized') }),
  signOut: async () => {},
  resetPassword: async () => ({ error: new Error('AuthProvider not initialized') }),
  updateProfile: async () => ({ error: new Error('AuthProvider not initialized'), data: null }),
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const pathname = usePathname();

  // Check if the user is authenticated and redirect accordingly
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!session && !inAuthGroup) {
      // If no session but trying to access protected routes, redirect to login
      router.replace('/login');
    } else if (session && inAuthGroup) {
      // If session exists but still in auth group, redirect to main app
      router.replace('/');
    }
  }, [session, segments, isLoading]);

  // Load session from Supabase on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile data from database
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else {
      setProfile(data);
      // Store latest profile in secure storage for offline access
      SecureStore.setItemAsync(
        SECURE_STORE_KEYS.USER_PROFILE,
        JSON.stringify(data)
      );
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.USER_PROFILE);
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'fukuro://reset-password',
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) {
      return { error: new Error('User not authenticated'), data: null };
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
        await SecureStore.setItemAsync(
          SECURE_STORE_KEYS.USER_PROFILE,
          JSON.stringify(data)
        );
      }

      return { error, data };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
