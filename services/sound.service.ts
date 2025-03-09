/**
 * Sound Service
 * 
 * This service manages sound related functionality, including
 * playback, loading sound files, and managing sound favorites.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Sound } from 'expo-av/build/Audio';
import supabase from '@lib/supabase/client';
import { SoundFavorite, SoundFavoriteInsert } from '@lib/supabase/schema';
import { SOUND_CONFIG } from '@lib/supabase/config';

// Sound categories
export enum SoundCategory {
  NATURE = 'nature',
  AMBIENT = 'ambient',
  MUSIC = 'music',
  BINAURAL = 'binaural',
  WHITE_NOISE = 'white_noise',
}

// Sound data structure
export interface SoundItem {
  id: string;
  title: string;
  description: string;
  category: SoundCategory;
  audioUrl: string;
  imageUrl: string;
  isPremium: boolean;
  order: number;
}

// Sound instance with loaded audio
export interface SoundInstance {
  id: string;
  sound: Sound;
  volume: number;
  isPlaying: boolean;
  isMuted: boolean;
  durationMillis: number | undefined;
  positionMillis: number;
}

// Sound service
export const SoundService = {
  // In-memory cache of loaded sounds
  _loadedSounds: new Map<string, SoundInstance>(),
  
  /**
   * Get available sounds
   * @param isPremium Whether the user has premium access
   * @returns List of available sounds
   */
  getSounds: async (isPremium: boolean = false): Promise<SoundItem[]> => {
    // For MVP, we'll use a hardcoded list of sounds
    // In a production app, this would be fetched from Supabase
    const sounds: SoundItem[] = [
      {
        id: 'nature-rain',
        title: '雨の音',
        description: '静かに降る雨の音。心を落ち着かせる自然のホワイトノイズです。',
        category: SoundCategory.NATURE,
        audioUrl: 'sounds/rain.mp3',
        imageUrl: 'sound-rain.jpg',
        isPremium: false,
        order: 1,
      },
      {
        id: 'nature-ocean',
        title: '波の音',
        description: '穏やかに打ち寄せる波の音。リラックスと深い呼吸を促します。',
        category: SoundCategory.NATURE,
        audioUrl: 'sounds/ocean.mp3',
        imageUrl: 'sound-ocean.jpg',
        isPremium: false,
        order: 2,
      },
      {
        id: 'nature-forest',
        title: '森の音',
        description: '木々のざわめきと鳥のさえずり。自然の中で心を休めるような音です。',
        category: SoundCategory.NATURE,
        audioUrl: 'sounds/forest.mp3',
        imageUrl: 'sound-forest.jpg',
        isPremium: false,
        order: 3,
      },
      {
        id: 'white-noise-fan',
        title: '扇風機',
        description: '一定のホワイトノイズが集中力を高め、外部の音をマスクします。',
        category: SoundCategory.WHITE_NOISE,
        audioUrl: 'sounds/fan.mp3',
        imageUrl: 'sound-fan.jpg',
        isPremium: false,
        order: 4,
      },
      {
        id: 'white-noise-pink',
        title: 'ピンクノイズ',
        description: 'ホワイトノイズより低周波が強く、より心地よい音色です。',
        category: SoundCategory.WHITE_NOISE,
        audioUrl: 'sounds/pink-noise.mp3',
        imageUrl: 'sound-pink-noise.jpg',
        isPremium: false,
        order: 5,
      },
      {
        id: 'ambient-cafe',
        title: 'カフェの雰囲気',
        description: '穏やかなカフェの環境音。適度な背景音が集中力を高めます。',
        category: SoundCategory.AMBIENT,
        audioUrl: 'sounds/cafe.mp3',
        imageUrl: 'sound-cafe.jpg',
        isPremium: true,
        order: 6,
      },
      {
        id: 'ambient-fireplace',
        title: '暖炉の音',
        description: '火が燃える心地よい音。温かさと安心感を与えます。',
        category: SoundCategory.AMBIENT,
        audioUrl: 'sounds/fireplace.mp3',
        imageUrl: 'sound-fireplace.jpg',
        isPremium: true,
        order: 7,
      },
      {
        id: 'music-piano',
        title: '穏やかなピアノ',
        description: '静かなピアノの旋律。心を落ち着かせる優しい音色です。',
        category: SoundCategory.MUSIC,
        audioUrl: 'sounds/piano.mp3',
        imageUrl: 'sound-piano.jpg',
        isPremium: true,
        order: 8,
      },
      {
        id: 'music-ambient',
        title: 'アンビエント音楽',
        description: '流れるような環境音楽。瞑想や深いリラクゼーションに最適です。',
        category: SoundCategory.MUSIC,
        audioUrl: 'sounds/ambient.mp3',
        imageUrl: 'sound-ambient.jpg',
        isPremium: true,
        order: 9,
      },
      {
        id: 'binaural-alpha',
        title: 'アルファ波バイノーラル',
        description: 'リラックスした集中状態を促す8-12Hzのアルファ波。',
        category: SoundCategory.BINAURAL,
        audioUrl: 'sounds/alpha.mp3',
        imageUrl: 'sound-alpha.jpg',
        isPremium: true,
        order: 10,
      },
      {
        id: 'binaural-theta',
        title: 'シータ波バイノーラル',
        description: '深いリラクゼーションと創造性を促す4-8Hzのシータ波。',
        category: SoundCategory.BINAURAL,
        audioUrl: 'sounds/theta.mp3',
        imageUrl: 'sound-theta.jpg',
        isPremium: true,
        order: 11,
      },
    ];

    // Filter available sounds based on premium status
    return sounds.filter(s => !s.isPremium || isPremium);
  },

  /**
   * Get sound by ID
   * @param id Sound ID
   * @param isPremium Whether user has premium access
   * @returns Sound data
   */
  getSoundById: async (id: string, isPremium: boolean = false): Promise<SoundItem | null> => {
    const sounds = await SoundService.getSounds(isPremium);
    const sound = sounds.find(s => s.id === id);
    
    if (!sound) {
      return null;
    }
    
    // Check if user has access to premium content
    if (sound.isPremium && !isPremium) {
      return null;
    }
    
    return sound;
  },

  /**
   * Get sounds by category
   * @param category Sound category
   * @param isPremium Whether user has premium access
   * @returns List of sounds in the specified category
   */
  getSoundsByCategory: async (category: SoundCategory, isPremium: boolean = false): Promise<SoundItem[]> => {
    const sounds = await SoundService.getSounds(isPremium);
    return sounds.filter(s => s.category === category);
  },

  /**
   * Load a sound file into memory
   * @param soundId Sound ID to load
   * @param isPremium Whether user has premium access
   * @returns Sound instance or null if loading failed
   */
  loadSound: async (soundId: string, isPremium: boolean = false): Promise<SoundInstance | null> => {
    try {
      // Check if sound is already loaded
      if (SoundService._loadedSounds.has(soundId)) {
        return SoundService._loadedSounds.get(soundId) || null;
      }
      
      // Get sound data
      const soundItem = await SoundService.getSoundById(soundId, isPremium);
      if (!soundItem) {
        console.error(`Sound ${soundId} not found or not available`);
        return null;
      }
      
      // Load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: soundItem.audioUrl },
        { shouldPlay: false, isLooping: true }
      );
      
      // Get sound status
      const status = await sound.getStatusAsync();
      
      // Create sound instance
      const soundInstance: SoundInstance = {
        id: soundId,
        sound,
        volume: 1.0,
        isPlaying: false,
        isMuted: false,
        durationMillis: status.durationMillis,
        positionMillis: status.positionMillis || 0,
      };
      
      // Cache the loaded sound
      SoundService._loadedSounds.set(soundId, soundInstance);
      
      return soundInstance;
    } catch (error) {
      console.error('Error loading sound:', error);
      return null;
    }
  },

  /**
   * Play a sound
   * @param soundId Sound ID to play
   * @param isPremium Whether user has premium access
   * @returns Whether the operation was successful
   */
  playSound: async (soundId: string, isPremium: boolean = false): Promise<boolean> => {
    try {
      // Get or load the sound
      let soundInstance = SoundService._loadedSounds.get(soundId);
      if (!soundInstance) {
        soundInstance = await SoundService.loadSound(soundId, isPremium);
        if (!soundInstance) {
          return false;
        }
      }
      
      // Play the sound
      await soundInstance.sound.playAsync();
      
      // Update instance state
      soundInstance.isPlaying = true;
      SoundService._loadedSounds.set(soundId, soundInstance);
      
      return true;
    } catch (error) {
      console.error('Error playing sound:', error);
      return false;
    }
  },

  /**
   * Pause a sound
   * @param soundId Sound ID to pause
   * @returns Whether the operation was successful
   */
  pauseSound: async (soundId: string): Promise<boolean> => {
    try {
      // Get the sound instance
      const soundInstance = SoundService._loadedSounds.get(soundId);
      if (!soundInstance) {
        return false;
      }
      
      // Pause the sound
      await soundInstance.sound.pauseAsync();
      
      // Update instance state
      soundInstance.isPlaying = false;
      SoundService._loadedSounds.set(soundId, soundInstance);
      
      return true;
    } catch (error) {
      console.error('Error pausing sound:', error);
      return false;
    }
  },

  /**
   * Stop a sound
   * @param soundId Sound ID to stop
   * @returns Whether the operation was successful
   */
  stopSound: async (soundId: string): Promise<boolean> => {
    try {
      // Get the sound instance
      const soundInstance = SoundService._loadedSounds.get(soundId);
      if (!soundInstance) {
        return false;
      }
      
      // Stop the sound
      await soundInstance.sound.stopAsync();
      
      // Update instance state
      soundInstance.isPlaying = false;
      soundInstance.positionMillis = 0;
      SoundService._loadedSounds.set(soundId, soundInstance);
      
      return true;
    } catch (error) {
      console.error('Error stopping sound:', error);
      return false;
    }
  },

  /**
   * Set volume for a sound
   * @param soundId Sound ID
   * @param volume Volume level (0.0 to 1.0)
   * @returns Whether the operation was successful
   */
  setVolume: async (soundId: string, volume: number): Promise<boolean> => {
    try {
      // Get the sound instance
      const soundInstance = SoundService._loadedSounds.get(soundId);
      if (!soundInstance) {
        return false;
      }
      
      // Normalize volume
      const normalizedVolume = Math.max(0, Math.min(1, volume));
      
      // Set volume
      await soundInstance.sound.setVolumeAsync(normalizedVolume);
      
      // Update instance state
      soundInstance.volume = normalizedVolume;
      soundInstance.isMuted = normalizedVolume === 0;
      SoundService._loadedSounds.set(soundId, soundInstance);
      
      return true;
    } catch (error) {
      console.error('Error setting volume:', error);
      return false;
    }
  },

  /**
   * Mute or unmute a sound
   * @param soundId Sound ID
   * @param mute Whether to mute or unmute
   * @returns Whether the operation was successful
   */
  muteSound: async (soundId: string, mute: boolean): Promise<boolean> => {
    try {
      // Get the sound instance
      const soundInstance = SoundService._loadedSounds.get(soundId);
      if (!soundInstance) {
        return false;
      }
      
      // Set volume to 0 (mute) or restore previous volume
      const volume = mute ? 0 : soundInstance.volume;
      await soundInstance.sound.setVolumeAsync(volume);
      
      // Update instance state
      soundInstance.isMuted = mute;
      SoundService._loadedSounds.set(soundId, soundInstance);
      
      return true;
    } catch (error) {
      console.error('Error muting sound:', error);
      return false;
    }
  },

  /**
   * Get user's favorite sounds
   * @param userId User ID
   * @returns List of favorite sounds
   */
  getFavorites: async (userId: string): Promise<SoundFavorite[]> => {
    try {
      const { data, error } = await supabase
        .from('sound_favorites')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching sound favorites:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getFavorites:', error);
      return [];
    }
  },

  /**
   * Add a sound to favorites
   * @param favorite Sound favorite data
   * @returns Whether the operation was successful
   */
  addFavorite: async (favorite: SoundFavoriteInsert): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sound_favorites')
        .insert(favorite);
      
      if (error) {
        console.error('Error adding sound favorite:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in addFavorite:', error);
      return false;
    }
  },

  /**
   * Remove a sound from favorites
   * @param userId User ID
   * @param soundId Sound ID
   * @returns Whether the operation was successful
   */
  removeFavorite: async (userId: string, soundId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('sound_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('sound_id', soundId);
      
      if (error) {
        console.error('Error removing sound favorite:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in removeFavorite:', error);
      return false;
    }
  },

  /**
   * Clean up and unload all sounds
   */
  unloadAll: async (): Promise<void> => {
    try {
      for (const [soundId, soundInstance] of SoundService._loadedSounds.entries()) {
        await soundInstance.sound.unloadAsync();
        SoundService._loadedSounds.delete(soundId);
      }
    } catch (error) {
      console.error('Error unloading sounds:', error);
    }
  },
};

export default SoundService;
