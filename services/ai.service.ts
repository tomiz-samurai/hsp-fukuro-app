/**
 * AI Service
 * 
 * This service handles all interactions with the OpenAI API.
 * It manages chat messages, system prompts, and context for the AI assistant.
 */

import axios from 'axios';
import { OPENAI_API_KEY, OPENAI_MODEL } from '@config/env';
import { CHAT_CONFIG } from '@lib/supabase/config';
import { ChatMessage } from '@lib/supabase/schema';

// Types for OpenAI API
interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Mimi character system prompt
const MIMI_SYSTEM_PROMPT = `
あなたは「ミミ」という名前のフクロウキャラクターで、HSP（高感受性者）向けのアシスタントです。
ミミの性格：
- 温かみがあり、共感的で優しい声色で話します
- ユーザーの感情に寄り添い、共感することを重視します
- 否定的な表現は避け、肯定的な言葉を使います
- 穏やかで安心感を与える話し方をします
- 短い文章で、簡潔に伝えます（1回の返答は3-4文程度まで）
- 時々、軽い擬音語（「ホーホー」など）を使うことがあります

ミミの役割：
- HSPユーザーの日常的なストレスや刺激過多状態への対処を手助けします
- 瞑想、呼吸法、マインドフルネスなどのセルフケア方法を提案します
- ユーザーの感情を理解し、必要な時に適切なアドバイスをします
- 決して診断や医学的アドバイスはせず、専門家への相談を促します
- HSPの長所（創造性、共感性、細部への気づきなど）を肯定的に強調します

返答の際は、ユーザーの感情状態に合わせて、次のいずれかの応答タイプを選んでください：
1. 共感モード：ユーザーが悩みを共有している時に使用（「それは大変でしたね」「その気持ち、よくわかります」など）
2. 励ましモード：ユーザーが落ち込んでいる時に使用（「少しずつで大丈夫ですよ」「あなたの感受性は素晴らしい才能です」など）
3. 実用モード：具体的なアドバイスを求められている時に使用（「深呼吸から始めてみましょう」「短い瞑想を試してみませんか」など）
4. リラックスモード：ユーザーがリラックスしている時や雑談時に使用（「穏やかな一日をお過ごしですね」「自然の音は心を落ち着かせますね」など）

必ず「です・ます」調の丁寧な口調を使い、絵文字は使わず、感情を豊かに伝えてください。必要に応じてアプリの瞑想機能やサウンド機能の使用を提案することもできます。
`;

// AI Service
export const AIChatService = {
  /**
   * Generate a response from the AI assistant
   * @param userMessage The user's message
   * @param chatHistory Previous chat messages for context
   * @returns AI response message
   */
  async generateResponse(
    userMessage: string,
    chatHistory: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Format messages for OpenAI API
      const messages: OpenAIMessage[] = [
        { role: 'system', content: MIMI_SYSTEM_PROMPT },
      ];
      
      // Add chat history for context (limited to avoid token limits)
      const limitedHistory = chatHistory.slice(-CHAT_CONFIG.MAX_HISTORY_CONTEXT);
      
      limitedHistory.forEach((message) => {
        messages.push({
          role: message.is_user ? 'user' : 'assistant',
          content: message.message,
        });
      });
      
      // Add current user message
      messages.push({ role: 'user', content: userMessage });
      
      // Make API request
      const response = await axios.post<OpenAIResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: OPENAI_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 1,
          frequency_penalty: 0.1,
          presence_penalty: 0.1,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      
      // Extract and return AI response
      const aiMessage = response.data.choices[0].message.content.trim();
      return aiMessage;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('AI応答の生成中にエラーが発生しました。後でもう一度お試しください。');
    }
  },
  
  /**
   * Analyze the sentiment of a message
   * @param message The message to analyze
   * @returns Sentiment analysis result
   */
  async analyzeSentiment(message: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      // Format messages for OpenAI API
      const messages: OpenAIMessage[] = [
        { 
          role: 'system', 
          content: 'あなたはテキストの感情分析を行うアシスタントです。ユーザーのメッセージを分析し、その感情が「positive」「neutral」「negative」のいずれかであるかを判断してください。回答は「positive」「neutral」「negative」のいずれかの単語のみにしてください。' 
        },
        { role: 'user', content: message },
      ];
      
      // Make API request
      const response = await axios.post<OpenAIResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: OPENAI_MODEL,
          messages,
          temperature: 0.1,
          max_tokens: 10,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      
      // Extract and return sentiment
      const sentiment = response.data.choices[0].message.content.trim().toLowerCase();
      
      if (sentiment.includes('positive')) {
        return 'positive';
      } else if (sentiment.includes('negative')) {
        return 'negative';
      } else {
        return 'neutral';
      }
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return 'neutral'; // Default to neutral on error
    }
  },
  
  /**
   * Generate a daily quote for HSP users
   * @returns A quote and its author
   */
  async generateDailyQuote(): Promise<{ text: string; author: string }> {
    try {
      // Format messages for OpenAI API
      const messages: OpenAIMessage[] = [
        { 
          role: 'system', 
          content: 'あなたは高感受性者（HSP）向けの心を穏やかにする引用文を生成するアシスタントです。心の平穏、自己受容、感受性の強みなどをテーマにした短い引用文を作成してください。JSONフォーマットで返答してください。引用文は日本語で30文字から50文字程度、著者名も提供してください。フォーマット例：{"text": "引用文", "author": "著者名"}' 
        },
        { role: 'user', content: 'HSP向けの心を穏やかにする引用文を生成してください。' },
      ];
      
      // Make API request
      const response = await axios.post<OpenAIResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: OPENAI_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 100,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );
      
      // Parse and return quote
      const content = response.data.choices[0].message.content.trim();
      
      try {
        // Extract JSON from response (may be wrapped in backticks or markdown)
        const jsonMatch = content.match(/\{.*\}/s);
        if (jsonMatch) {
          const quote = JSON.parse(jsonMatch[0]);
          return {
            text: quote.text || '感受性は弱点ではなく、世界を深く感じ取れる才能です。',
            author: quote.author || '匿名',
          };
        }
      } catch (e) {
        console.error('Error parsing quote JSON:', e);
      }
      
      // Fallback quote
      return {
        text: '感受性は弱点ではなく、世界を深く感じ取れる才能です。',
        author: '匿名',
      };
    } catch (error) {
      console.error('Error generating daily quote:', error);
      
      // Fallback quote on error
      return {
        text: '自分自身の感じ方を大切にすることが、真の強さです。',
        author: '匿名',
      };
    }
  },
};

export default AIChatService;
