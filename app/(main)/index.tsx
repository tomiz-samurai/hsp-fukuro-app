/**
 * Home Screen
 * 
 * The main dashboard screen of the app that shows a summary of the user's
 * data, daily insights, and quick access to key features.
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

import ScreenWrapper from '@components/layout/ScreenWrapper';
import Card from '@components/ui/molecules/Card';
import Button from '@components/ui/atoms/Button';
import { H1, H3, Body1, Body2, Subtitle1 } from '@components/ui/atoms/Typography';
import { useAuth } from '@components/providers/AuthProvider';
import { useToastStore } from '@store/slices/uiSlice';
import { useRemainingChatCount } from '@store/slices/authSlice';
import { AppTheme } from '@config/theme';

// Home screen component
export default function HomeScreen() {
  // Hooks
  const theme = useTheme() as AppTheme;
  const router = useRouter();
  const { user, profile } = useAuth();
  const { showToast } = useToastStore();
  const remainingChats = useRemainingChatCount();
  
  // State
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState({
    text: '呼吸を整えることで、心も整います。',
    author: '禅の教え'
  });
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      setGreeting('おはようございます');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('こんにちは');
    } else {
      setGreeting('こんばんは');
    }
  }, []);
  
  // Navigate to chat with Mimi
  const handleChatWithMimi = () => {
    router.push('/chat');
  };
  
  // Navigate to meditation
  const handleStartMeditation = () => {
    router.push('/meditation');
  };
  
  // Display date in Japanese format
  const formattedDate = format(new Date(), 'yyyy年MM月dd日 (EEEE)', { locale: ja });
  
  return (
    <ScreenWrapper 
      scrollable
      padding="none"
      safeAreaProps={{
        edges: ['top'],
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greetingContainer}>
            <H1>{greeting}、{profile?.display_name || user?.email}</H1>
            <Body1 style={styles.dateText}>{formattedDate}</Body1>
          </View>
        </View>
        
        {/* Owl Character Card */}
        <Card
          style={styles.owlCard}
          onPress={handleChatWithMimi}
          elevation="low"
          backgroundColor={theme.colors.primary}
        >
          <View style={styles.owlCardContent}>
            <View style={styles.owlInfo}>
              <H3 style={[styles.owlTitle, { color: theme.colors.background }]}>ミミと話す</H3>
              <Body1 style={{ color: theme.colors.background }}>
                {remainingChats === Infinity 
                  ? 'いつでも話しかけてください' 
                  : `今日残り ${remainingChats} 回の会話ができます`}
              </Body1>
              <Button
                label="会話を始める"
                variant="outline"
                style={styles.owlButton}
                textStyle={{ color: theme.colors.background }}
                onPress={handleChatWithMimi}
              />
            </View>
            <View style={styles.owlImageContainer}>
              <Image
                source={require('@assets/images/owl-character.png')}
                style={styles.owlImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Card>
        
        {/* Daily Quote Card */}
        <Card style={styles.quoteCard} elevation="low">
          <View style={styles.quoteContainer}>
            <Ionicons name="quote" size={24} color={theme.colors.primary} />
            <Subtitle1 style={styles.quoteText}>
              {quote.text}
            </Subtitle1>
            <Body2 style={styles.quoteAuthor}>
              {quote.author}
            </Body2>
          </View>
        </Card>
        
        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {/* Meditation Card */}
          <Card
            style={styles.featureCard}
            onPress={handleStartMeditation}
            elevation="low"
          >
            <View style={styles.featureContent}>
              <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(98, 165, 191, 0.1)' }]}>
                <Ionicons name="water" size={24} color={theme.colors.primary} />
              </View>
              <Body1 weight="medium" style={styles.featureTitle}>瞑想</Body1>
              <Body2 style={styles.featureDescription}>
                HSP向けガイド付き瞑想で心を静めましょう
              </Body2>
            </View>
          </Card>
          
          {/* Sounds Card */}
          <Card
            style={styles.featureCard}
            onPress={() => router.push('/sounds')}
            elevation="low"
          >
            <View style={styles.featureContent}>
              <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(155, 126, 107, 0.1)' }]}>
                <Ionicons name="musical-note" size={24} color={theme.colors.secondary} />
              </View>
              <Body1 weight="medium" style={styles.featureTitle}>サウンド</Body1>
              <Body2 style={styles.featureDescription}>
                自然音や環境音で心地よい音環境を作りましょう
              </Body2>
            </View>
          </Card>
          
          {/* Breathing Card */}
          <Card
            style={styles.featureCard}
            onPress={() => router.push('/meditation?type=breathing')}
            elevation="low"
          >
            <View style={styles.featureContent}>
              <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(244, 162, 97, 0.1)' }]}>
                <Ionicons name="pulse" size={24} color={theme.colors.accent} />
              </View>
              <Body1 weight="medium" style={styles.featureTitle}>呼吸法</Body1>
              <Body2 style={styles.featureDescription}>
                ストレスを和らげる効果的な呼吸エクササイズ
              </Body2>
            </View>
          </Card>
          
          {/* Mood Tracking Card */}
          <Card
            style={styles.featureCard}
            onPress={() => router.push('/profile/mood')}
            elevation="low"
          >
            <View style={styles.featureContent}>
              <View style={[styles.featureIconContainer, { backgroundColor: 'rgba(127, 182, 133, 0.1)' }]}>
                <Ionicons name="analytics" size={24} color={theme.colors.success} />
              </View>
              <Body1 weight="medium" style={styles.featureTitle}>気分記録</Body1>
              <Body2 style={styles.featureDescription}>
                日々の気分を記録して心の変化を見つめましょう
              </Body2>
            </View>
          </Card>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greetingContainer: {
    marginBottom: 8,
  },
  dateText: {
    opacity: 0.7,
    marginTop: 4,
  },
  owlCard: {
    marginBottom: 20,
    padding: 0,
    overflow: 'hidden',
  },
  owlCardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  owlInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  owlTitle: {
    marginBottom: 8,
  },
  owlButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderColor: 'white',
  },
  owlImageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  owlImage: {
    width: 100,
    height: 100,
  },
  quoteCard: {
    marginBottom: 20,
  },
  quoteContainer: {
    padding: 16,
    alignItems: 'center',
  },
  quoteText: {
    textAlign: 'center',
    marginVertical: 8,
    lineHeight: 24,
  },
  quoteAuthor: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  featureCard: {
    width: '48%',
    marginBottom: 16,
  },
  featureContent: {
    padding: 16,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
