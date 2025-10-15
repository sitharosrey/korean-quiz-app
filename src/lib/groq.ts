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