export class PronunciationService {
  private static instance: PronunciationService;
  private synth!: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private koreanVoice: SpeechSynthesisVoice | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      // Load voices when they become available
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  static getInstance(): PronunciationService {
    if (!PronunciationService.instance) {
      PronunciationService.instance = new PronunciationService();
    }
    return PronunciationService.instance;
  }

  private loadVoices(): void {
    if (!this.synth) return;
    
    this.voices = this.synth.getVoices();
    
    // Find Korean voice (prefer native Korean voices)
    this.koreanVoice = this.voices.find(voice => 
      voice.lang.startsWith('ko') || 
      voice.name.toLowerCase().includes('korean') ||
      voice.name.toLowerCase().includes('한국') ||
      voice.name.toLowerCase().includes('yuna') || // Samsung Korean voice
      voice.name.toLowerCase().includes('sora') || // Samsung Korean voice
      voice.name.toLowerCase().includes('hyun')    // Samsung Korean voice
    ) || null;

    // If no Korean voice found, use the first available voice
    if (!this.koreanVoice && this.voices.length > 0) {
      this.koreanVoice = this.voices[0];
    }
  }

  speak(text: string, language: 'korean' | 'english' = 'korean'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (language === 'korean' && this.koreanVoice) {
        utterance.voice = this.koreanVoice;
        utterance.lang = 'ko-KR';
      } else if (language === 'english') {
        utterance.lang = 'en-US';
      }

      // Optimized settings for Korean pronunciation
      if (language === 'korean') {
        utterance.rate = 0.7; // Slower for better clarity
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 1.0; // Full volume
      } else {
        // Configure speech parameters for English
        utterance.rate = 0.8; // Slightly slower for better comprehension
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  speakKorean(text: string): Promise<void> {
    return this.speak(text, 'korean');
  }

  speakEnglish(text: string): Promise<void> {
    return this.speak(text, 'english');
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  getKoreanVoice(): SpeechSynthesisVoice | null {
    return this.koreanVoice;
  }

  stop(): void {
    if (typeof window !== 'undefined' && this.synth) {
      this.synth.cancel();
    }
  }
}

// Export singleton instance (only create on client side)
export const pronunciationService = typeof window !== 'undefined' ? PronunciationService.getInstance() : null;
