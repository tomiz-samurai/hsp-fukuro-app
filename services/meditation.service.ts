/**
 * Meditation Service
 * 
 * This service manages meditation sessions, including fetching data,
 * tracking progress, and handling session-related operations.
 */

import supabase from '@lib/supabase/client';
import { MeditationSession, MeditationSessionInsert } from '@lib/supabase/schema';
import { MEDITATION_CONFIG } from '@lib/supabase/config';

// Meditation types
export enum MeditationType {
  BEGINNER = 'beginner',
  BREATHE = 'breathe',
  BODY_SCAN = 'body_scan',
  MINDFULNESS = 'mindfulness',
  SLEEP = 'sleep',
  ANXIETY = 'anxiety',
  GROUNDING = 'grounding',
}

// Meditation session data structure
export interface Meditation {
  id: string;
  title: string;
  description: string;
  type: MeditationType;
  durationMinutes: number;
  audioUrl: string;
  imageUrl: string;
  isPremium: boolean;
  order: number;
}

// Meditation service
export const MeditationService = {
  /**
   * Get available meditation sessions
   * @param isPremium Whether the user has premium access
   * @returns List of available meditation sessions
   */
  getMeditations: async (isPremium: boolean = false): Promise<Meditation[]> => {
    // For MVP, we'll use a hardcoded list of meditation sessions
    // In a production app, this would be fetched from Supabase
    const meditations: Meditation[] = [
      {
        id: 'beginner-1',
        title: 'HSP向け初心者マインドフルネス',
        description: '高感受性者向けに穏やかにマインドフルネスを導入する3分間の瞑想です。',
        type: MeditationType.BEGINNER,
        durationMinutes: 3,
        audioUrl: 'meditations/beginner-1.mp3',
        imageUrl: 'meditation-beginner.jpg',
        isPremium: false,
        order: 1,
      },
      {
        id: 'breathe-1',
        title: '4-7-8呼吸法',
        description: '呼吸をコントロールしてリラックスするための簡単なエクササイズです。',
        type: MeditationType.BREATHE,
        durationMinutes: 5,
        audioUrl: 'meditations/breathe-1.mp3',
        imageUrl: 'meditation-breathe.jpg',
        isPremium: false,
        order: 2,
      },
      {
        id: 'mindfulness-1',
        title: '現在に集中する',
        description: '今この瞬間に意識を向け、心を落ち着かせる瞑想です。',
        type: MeditationType.MINDFULNESS,
        durationMinutes: 10,
        audioUrl: 'meditations/mindfulness-1.mp3',
        imageUrl: 'meditation-mindfulness.jpg',
        isPremium: false,
        order: 3,
      },
      {
        id: 'anxiety-1',
        title: '不安を和らげる瞑想',
        description: '高感受性者の不安を緩和するための特別な瞑想法です。',
        type: MeditationType.ANXIETY,
        durationMinutes: 12,
        audioUrl: 'meditations/anxiety-1.mp3',
        imageUrl: 'meditation-anxiety.jpg',
        isPremium: true,
        order: 4,
      },
      {
        id: 'body-scan-1',
        title: 'ボディスキャン瞑想',
        description: '全身の感覚に意識を向け、緊張を解放します。',
        type: MeditationType.BODY_SCAN,
        durationMinutes: 15,
        audioUrl: 'meditations/body-scan-1.mp3',
        imageUrl: 'meditation-body-scan.jpg',
        isPremium: true,
        order: 5,
      },
      {
        id: 'sleep-1',
        title: '睡眠導入瞑想',
        description: '質の高い睡眠へと導く、HSP向けの穏やかな瞑想です。',
        type: MeditationType.SLEEP,
        durationMinutes: 20,
        audioUrl: 'meditations/sleep-1.mp3',
        imageUrl: 'meditation-sleep.jpg',
        isPremium: true,
        order: 6,
      },
      {
        id: 'grounding-1',
        title: 'グラウンディング瞑想',
        description: '感覚過敏状態から落ち着きを取り戻すための特別な瞑想です。',
        type: MeditationType.GROUNDING,
        durationMinutes: 8,
        audioUrl: 'meditations/grounding-1.mp3',
        imageUrl: 'meditation-grounding.jpg',
        isPremium: true,
        order: 7,
      },
    ];

    // Filter available meditations based on premium status
    return meditations.filter(m => !m.isPremium || isPremium);
  },

  /**
   * Get meditation by ID
   * @param id Meditation ID
   * @param isPremium Whether user has premium access
   * @returns Meditation session data
   */
  getMeditationById: async (id: string, isPremium: boolean = false): Promise<Meditation | null> => {
    const meditations = await MeditationService.getMeditations(isPremium);
    const meditation = meditations.find(m => m.id === id);
    
    if (!meditation) {
      return null;
    }
    
    // Check if user has access to premium content
    if (meditation.isPremium && !isPremium) {
      return null;
    }
    
    return meditation;
  },

  /**
   * Get meditations by type
   * @param type Meditation type
   * @param isPremium Whether user has premium access
   * @returns List of meditation sessions of the specified type
   */
  getMeditationsByType: async (type: MeditationType, isPremium: boolean = false): Promise<Meditation[]> => {
    const meditations = await MeditationService.getMeditations(isPremium);
    return meditations.filter(m => m.type === type);
  },

  /**
   * Get meditation session history for a user
   * @param userId User ID
   * @returns List of completed meditation sessions
   */
  getMeditationHistory: async (userId: string): Promise<MeditationSession[]> => {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching meditation history:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getMeditationHistory:', error);
      return [];
    }
  },

  /**
   * Record a completed meditation session
   * @param session Meditation session data
   * @returns Whether the session was recorded successfully
   */
  recordMeditationSession: async (session: MeditationSessionInsert): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('meditation_sessions')
        .insert(session);
      
      if (error) {
        console.error('Error recording meditation session:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in recordMeditationSession:', error);
      return false;
    }
  },

  /**
   * Get total meditation time for a user
   * @param userId User ID
   * @returns Total meditation time in minutes
   */
  getTotalMeditationTime: async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('duration')
        .eq('user_id', userId)
        .eq('completed', true);
      
      if (error) {
        console.error('Error fetching total meditation time:', error);
        return 0;
      }
      
      return data?.reduce((total, session) => total + (session.duration || 0), 0) || 0;
    } catch (error) {
      console.error('Error in getTotalMeditationTime:', error);
      return 0;
    }
  },

  /**
   * Get meditation streak for a user
   * @param userId User ID
   * @returns Current streak (consecutive days)
   */
  getMeditationStreak: async (userId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('meditation_sessions')
        .select('created_at')
        .eq('user_id', userId)
        .eq('completed', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching meditation streak:', error);
        return 0;
      }
      
      if (!data || data.length === 0) {
        return 0;
      }
      
      // Calculate streak
      let streak = 1;
      let currentDate = new Date(data[0].created_at);
      
      for (let i = 1; i < data.length; i++) {
        const sessionDate = new Date(data[i].created_at);
        const diffTime = Math.abs(currentDate.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak += 1;
          currentDate = sessionDate;
        } else if (diffDays > 1) {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error in getMeditationStreak:', error);
      return 0;
    }
  },
};

export default MeditationService;
