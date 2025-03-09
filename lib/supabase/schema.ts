/**
 * Supabase Database Schema Types
 * 
 * This file defines TypeScript interfaces for the Supabase database schema.
 * It provides type safety when interacting with the database.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          display_name: string | null
          avatar_url: string | null
          settings: Json | null
          premium_status: 'free' | 'monthly' | 'yearly' | null
          premium_until: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          display_name?: string | null
          avatar_url?: string | null
          settings?: Json | null
          premium_status?: 'free' | 'monthly' | 'yearly' | null
          premium_until?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          display_name?: string | null
          avatar_url?: string | null
          settings?: Json | null
          premium_status?: 'free' | 'monthly' | 'yearly' | null
          premium_until?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          created_at: string
          user_id: string
          message: string
          is_user: boolean
          sentiment: 'positive' | 'neutral' | 'negative' | null
          context: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          message: string
          is_user: boolean
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          context?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          message?: string
          is_user?: boolean
          sentiment?: 'positive' | 'neutral' | 'negative' | null
          context?: Json | null
        }
      }
      meditation_sessions: {
        Row: {
          id: string
          created_at: string
          user_id: string
          duration: number
          session_type: string
          completed: boolean
          notes: string | null
          mood_before: number | null
          mood_after: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          duration: number
          session_type: string
          completed: boolean
          notes?: string | null
          mood_before?: number | null
          mood_after?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          duration?: number
          session_type?: string
          completed?: boolean
          notes?: string | null
          mood_before?: number | null
          mood_after?: number | null
        }
      }
      sound_favorites: {
        Row: {
          id: string
          created_at: string
          user_id: string
          sound_id: string
          custom_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          sound_id: string
          custom_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          sound_id?: string
          custom_name?: string | null
        }
      }
      mood_logs: {
        Row: {
          id: string
          created_at: string
          user_id: string
          mood_score: number
          notes: string | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          mood_score: number
          notes?: string | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          mood_score?: number
          notes?: string | null
          tags?: string[] | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Derived types for easier use in the application
export type User = Database['public']['Tables']['users']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type MeditationSession = Database['public']['Tables']['meditation_sessions']['Row']
export type SoundFavorite = Database['public']['Tables']['sound_favorites']['Row']
export type MoodLog = Database['public']['Tables']['mood_logs']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']
export type MeditationSessionInsert = Database['public']['Tables']['meditation_sessions']['Insert']
export type SoundFavoriteInsert = Database['public']['Tables']['sound_favorites']['Insert']
export type MoodLogInsert = Database['public']['Tables']['mood_logs']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type ChatMessageUpdate = Database['public']['Tables']['chat_messages']['Update']
export type MeditationSessionUpdate = Database['public']['Tables']['meditation_sessions']['Update']
export type SoundFavoriteUpdate = Database['public']['Tables']['sound_favorites']['Update']
export type MoodLogUpdate = Database['public']['Tables']['mood_logs']['Update']
