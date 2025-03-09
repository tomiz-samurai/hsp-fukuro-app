/**
 * Chat Screen
 * 
 * The main chat interface for communicating with Mimi, the AI owl character.
 * Features HSP-friendly design with gentle animations and calming visuals.
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Animated,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';

import ChatBubble from '@components/ui/molecules/ChatBubble';
import { H2, Body1, Body2 } from '@components/ui/atoms/Typography';
import supabase from '@lib/supabase/client';
import { ChatMessage } from '@lib/supabase/schema';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { useAccessibilityStore } from '@store/slices/uiSlice';
import { useHasReachedChatLimit, useAuthStore } from '@store/slices/authSlice';
import { AIChatService } from '@services/ai.service';
import { ERROR_MESSAGES, CHAT_CONFIG } from '@config/constants';
import { AppTheme } from '@config/theme';

// Owl character expression states
type OwlExpression = 'neutral' | 'happy' | 'thinking' | 'sad' | 'surprised';

// Chat screen component
export default function ChatScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const { user } = useAuth();
  const { showToast } = useToastStore();
  const { hapticsEnabled, animationsEnabled } = useAccessibilityStore();
  const hasReachedLimit = useHasReachedChatLimit();
  const incrementChatCount = useAuthStore((state) => state.incrementChatCount);
  
  // Refs
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Input state
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  
  // Owl expression state
  const [owlExpression, setOwlExpression] = useState<OwlExpression>('neutral');
  const owlScale = useRef(new Animated.Value(1)).current;
  
  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      const initialMessages: ChatMessage[] = [
        {
          id: 'welcome-1',
          created_at: new Date().toISOString(),
          user_id: user?.id || '',
          message: 'こんにちは！ミミです。今日はどんなことでお話ししましょうか？何か気になることや、お話ししたいことがあれば、お聞かせください。ホーホー 🦉',
          is_user: false,
          sentiment: 'positive',
          context: null,
        },
      ];
      
      setMessages(initialMessages);
    }
  }, [user?.id]);
  
  // Load chat history from Supabase
  useEffect(() => {
    if (user?.id) {
      loadChatHistory();
    }
  }, [user?.id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [messages]);
  
  // Animate owl when expression changes
  useEffect(() => {
    if (animationsEnabled) {
      // Pulse animation
      Animated.sequence([
        Animated.timing(owlScale, {
          toValue: 1.05,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(owlScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [owlExpression, animationsEnabled]);
  
  // Load chat history from Supabase
  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) {
        console.error('Error loading chat history:', error);
        return;
      }
      
      if (data && data.length > 0) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };
  
  // Save message to Supabase
  const saveMessage = async (newMessage: ChatMessage) => {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert(newMessage);
      
      if (error) {
        console.error('Error saving message:', error);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };
  
  // Handle sending a message
  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    // Check if user has reached free tier limit
    if (hasReachedLimit) {
      showToast('無料版では1日5回までの会話が可能です。プレミアムにアップグレードすると無制限に会話できます。', 'info');
      return;
    }
    
    // Haptic feedback
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    const userMessageText = message.trim();
    setMessage('');
    
    // Create user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      user_id: user?.id || '',
      message: userMessageText,
      is_user: true,
      sentiment: null,
      context: null,
    };
    
    // Update UI
    setMessages((prev) => [...prev, userMessage]);
    
    // Start typing indicator
    setIsLoading(true);
    setTypingIndicator(true);
    setOwlExpression('thinking');
    
    try {
      // Save user message to Supabase
      await saveMessage(userMessage);
      
      // Increment chat count for free tier tracking
      incrementChatCount();
      
      // Random typing delay for natural feel
      const typingDelay = Math.floor(
        Math.random() * 
        (CHAT_CONFIG.MAX_TYPING_DELAY_MS - CHAT_CONFIG.MIN_TYPING_DELAY_MS) + 
        CHAT_CONFIG.MIN_TYPING_DELAY_MS
      );
      
      // Wait for typing delay
      await new Promise((resolve) => setTimeout(resolve, typingDelay));
      
      // Generate AI response
      const aiResponse = await AIChatService.generateResponse(
        userMessageText,
        messages
      );
      
      // Analyze sentiment of user message
      const sentiment = await AIChatService.analyzeSentiment(userMessageText);
      
      // Update user message with sentiment
      userMessage.sentiment = sentiment;
      
      // Set owl expression based on sentiment
      if (sentiment === 'positive') {
        setOwlExpression('happy');
      } else if (sentiment === 'negative') {
        setOwlExpression('sad');
      } else {
        setOwlExpression('neutral');
      }
      
      // Create AI message
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        created_at: new Date().toISOString(),
        user_id: user?.id || '',
        message: aiResponse,
        is_user: false,
        sentiment: 'neutral',
        context: null,
      };
      
      // Update UI
      setTypingIndicator(false);
      setMessages((prev) => [...prev, aiMessage]);
      
      // Save AI message to Supabase
      await saveMessage(aiMessage);
      
      // Reset to neutral expression after a delay
      setTimeout(() => {
        setOwlExpression('neutral');
      }, 2000);
    } catch (error) {
      console.error('Error in chat flow:', error);
      setTypingIndicator(false);
      setOwlExpression('surprised');
      
      // Show error toast
      showToast(ERROR_MESSAGES.UNKNOWN_ERROR, 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get owl image based on expression
  const getOwlImage = () => {
    switch (owlExpression) {
      case 'happy':
        return require('@assets/images/owl-happy.png');
      case 'thinking':
        return require('@assets/images/owl-thinking.png');
      case 'sad':
        return require('@assets/images/owl-sad.png');
      case 'surprised':
        return require('@assets/images/owl-surprised.png');
      default:
        return require('@assets/images/owl-neutral.png');
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm');
  };
  
  // Render chat message
  const renderMessage = ({ item }: { item: ChatMessage }) => {
    // AI avatar component
    const owlAvatar = (
      <View style={styles.avatarContainer}>
        <Image
          source={require('@assets/images/owl-avatar.png')}
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>
    );
    
    return (
      <ChatBubble
        message={item.message}
        isUser={item.is_user}
        showAvatar={true}
        avatar={!item.is_user ? owlAvatar : undefined}
        timestamp={formatTime(item.created_at)}
        testID={`chat-message-${item.id}`}
      />
    );
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Owl character header */}
      <View style={styles.owlHeader}>
        <Animated.Image
          source={getOwlImage()}
          style={[
            styles.owlImage,
            { transform: [{ scale: owlScale }] }
          ]}
          resizeMode="contain"
        />
        <H2 style={styles.owlName}>ミミ</H2>
        <Body2 style={styles.owlDescription}>
          HSP向けカウンセラー
        </Body2>
      </View>
      
      {/* Chat message list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Typing indicator */}
      {typingIndicator && (
        <ChatBubble
          message="..."
          isUser={false}
          showAvatar={true}
          isTyping={true}
          avatar={
            <View style={styles.avatarContainer}>
              <Image
                source={require('@assets/images/owl-avatar.png')}
                style={styles.avatar}
                resizeMode="contain"
              />
            </View>
          }
        />
      )}
      
      {/* Input area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={120}
        style={styles.inputContainer}
      >
        <View style={[styles.inputWrapper, { backgroundColor: theme.colors.surfaceVariant }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.colors.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="メッセージを入力..."
            placeholderTextColor={theme.colors.placeholder}
            multiline
            maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!isLoading && !hasReachedLimit}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: theme.colors.primary,
                opacity: message.trim() && !isLoading ? 1 : 0.5 
              }
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isLoading || hasReachedLimit}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* Message length indicator */}
        {message.length > 0 && (
          <Body2 
            style={[
              styles.messageLength,
              message.length > CHAT_CONFIG.MAX_MESSAGE_LENGTH * 0.8 ? { color: theme.colors.error } : {}
            ]}
          >
            {message.length}/{CHAT_CONFIG.MAX_MESSAGE_LENGTH}
          </Body2>
        )}
        
        {/* Chat limit warning */}
        {hasReachedLimit && (
          <View style={[styles.limitWarning, { backgroundColor: theme.colors.errorContainer }]}>
            <Body1 style={{ color: theme.colors.error }}>
              無料版では1日5回までの会話が可能です。プレミアムにアップグレードすると無制限に会話できます。
            </Body1>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3E6',
  },
  owlHeader: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  owlImage: {
    width: 80,
    height: 80,
  },
  owlName: {
    marginTop: 8,
  },
  owlDescription: {
    opacity: 0.7,
  },
  chatList: {
    padding: 16,
    paddingBottom: 80,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: '#F8F3E6',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarContainer: {
    width: 36,
    height: 36,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  messageLength: {
    alignSelf: 'flex-end',
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
  limitWarning: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
