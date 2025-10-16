import OpenAI from "openai";
import { GroqOCRResponse } from '@/types';

export class GroqService {
  private client: OpenAI;

  constructor(apiKey?: string) {
    // Use environment variable directly if no API key is provided
    const finalApiKey = apiKey || process.env.NEXT_PUBLIC_GROQ_API_KEY || process.env.GROQ_API_KEY;
    
    console.log('GroqService constructor - API Key source:', 
      apiKey ? 'Provided parameter' : 
      process.env.NEXT_PUBLIC_GROQ_API_KEY ? 'NEXT_PUBLIC_GROQ_API_KEY env var' :
      process.env.GROQ_API_KEY ? 'GROQ_API_KEY env var' : 'None found');
    
    if (!finalApiKey || finalApiKey === 'your_groq_api_key_here') {
      throw new Error('Invalid API key: Please set your actual Groq API key in the .env.local file');
    }
    
    this.client = new OpenAI({
      apiKey: finalApiKey,
      baseURL: "https://api.groq.com/openai/v1",
      dangerouslyAllowBrowser: true, // Required for client-side usage
    });
  }

  async extractTextAndTranslate(imageFile: File): Promise<GroqOCRResponse> {
    // Groq API doesn't support vision models, so we'll provide a helpful error message
    throw new Error('Image OCR is not supported with Groq API. Groq models are text-only and don\'t support image analysis. Please use the manual entry feature to add Korean words, or consider using a different service that supports vision models like OpenAI GPT-4V.');
  }

  async translateText(text: string, fromLang: string = 'ko', toLang: string = 'en'): Promise<string> {
    try {
      const prompt = `Translate the following ${fromLang} text to ${toLang}. Only return the translation, nothing else: ${text}`;
      
      const response = await this.client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const translation = response.choices[0]?.message?.content;
      return translation || text;
    } catch (error) {
      console.error('Translation Error:', error);
      throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateContextSentence(koreanWord: string, englishTranslation: string): Promise<string> {
    try {
      const prompt = `Create a simple, natural Korean sentence using the word "${koreanWord}" (which means "${englishTranslation}" in English). 
      
      Requirements:
      - Use the Korean word naturally in context
      - Keep the sentence simple and easy to understand
      - Make it appropriate for Korean language learners
      - Only return the Korean sentence, nothing else
      - Do not include the English translation in your response`;
      
      const response = await this.client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      const sentence = response.choices[0]?.message?.content?.trim();
      return sentence || '';
    } catch (error) {
      console.error('Context Sentence Generation Error:', error);
      throw new Error(`Failed to generate context sentence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateMultipleContextSentences(koreanWord: string, englishTranslation: string, count: number = 3): Promise<string[]> {
    try {
      const prompt = `Create ${count} different simple, natural Korean sentences using the word "${koreanWord}" (which means "${englishTranslation}" in English). 
      
      Requirements:
      - Each sentence should use the Korean word naturally in different contexts
      - Keep all sentences simple and easy to understand
      - Make them appropriate for Korean language learners
      - Return each sentence on a new line
      - Do not include the English translation in your response
      - Do not number the sentences`;
      
      const response = await this.client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 400,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) return [];
      
      // Split by newlines and filter out empty lines
      const sentences = content
        .split('\n')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      return sentences.slice(0, count);
    } catch (error) {
      console.error('Multiple Context Sentences Generation Error:', error);
      throw new Error(`Failed to generate context sentences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateKoreanSentencesWithTranslations(koreanWord: string, englishTranslation: string, count: number = 3): Promise<Array<{korean: string, english: string, difficulty: 'easy' | 'medium' | 'hard'}>> {
    try {
      const prompt = `Create ${count} different Korean sentences using the word "${koreanWord}" (which means "${englishTranslation}" in English).

      Requirements:
      - Each sentence should use the Korean word naturally in different contexts
      - Provide both Korean sentence and English translation
      - Vary the difficulty: some easy, some medium, some hard
      - Keep sentences appropriate for Korean language learners
      - Format each sentence as: "Korean sentence | English translation | difficulty"
      - Do not number the sentences
      
      Example format:
      학교에 가요. | I go to school. | easy
      학교에서 친구를 만났어요. | I met a friend at school. | medium
      학교 생활이 즐거워요. | School life is enjoyable. | easy`;
      
      const response = await this.client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 600,
        temperature: 0.8,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) return [];
      
      // Parse the response
      const sentences = content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          const parts = line.split(' | ');
          if (parts.length >= 2) {
            const korean = parts[0].trim();
            const english = parts[1].trim();
            const difficulty = parts[2]?.trim() as 'easy' | 'medium' | 'hard' || 'easy';
            return { korean, english, difficulty };
          }
          return null;
        })
        .filter(sentence => sentence !== null) as Array<{korean: string, english: string, difficulty: 'easy' | 'medium' | 'hard'}>;
      
      return sentences.slice(0, count);
    } catch (error) {
      console.error('Korean Sentences with Translations Generation Error:', error);
      throw new Error(`Failed to generate Korean sentences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateMnemonic(koreanWord: string, englishTranslation: string): Promise<string> {
    try {
      const prompt = `Create a simple mnemonic to help remember the Korean word "${koreanWord}" which means "${englishTranslation}" in English.

      Requirements:
      - Make it memorable and easy to understand
      - Use visual or sound associations
      - Keep it short and simple
      - Make it appropriate for Korean language learners
      - Only return the mnemonic, nothing else`;
      
      const response = await this.client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.9,
      });

      const mnemonic = response.choices[0]?.message?.content?.trim();
      return mnemonic || '';
    } catch (error) {
      console.error('Mnemonic Generation Error:', error);
      throw new Error(`Failed to generate mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
}

// Utility function to create Groq service instance
export function createGroqService(apiKey?: string): GroqService {
  return new GroqService(apiKey);
}