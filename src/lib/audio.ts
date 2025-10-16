export interface AudioSettings {
  rate: number; // 0.1 to 10
  pitch: number; // 0 to 2
  volume: number; // 0 to 1
  voice?: string; // Voice name
}

export class AudioService {
  private static instance: AudioService;
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private koreanVoice: SpeechSynthesisVoice | null = null;
  private settings: AudioSettings = {
    rate: 0.8,
    pitch: 1.0,
    volume: 1.0,
  };

  private constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
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

  /**
   * Speak Korean text with current settings
   */
  speakKorean(text: string): Promise<void> {
    return this.speak(text, 'ko-KR');
  }

  /**
   * Speak English text with current settings
   */
  speakEnglish(text: string): Promise<void> {
    return this.speak(text, 'en-US');
  }

  /**
   * Generic speak function
   */
  private speak(text: string, lang: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !this.synth) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language and voice
      utterance.lang = lang;
      if (lang === 'ko-KR' && this.koreanVoice) {
        utterance.voice = this.koreanVoice;
      }

      // Optimized settings for Korean pronunciation
      if (lang === 'ko-KR') {
        utterance.rate = 0.7; // Slower for better clarity
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 1.0; // Full volume
      } else {
        // Apply user settings for other languages
        utterance.rate = this.settings.rate;
        utterance.pitch = this.settings.pitch;
        utterance.volume = this.settings.volume;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synth.speak(utterance);
    });
  }

  /**
   * Stop current speech
   */
  stop(): void {
    if (typeof window !== 'undefined' && this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * Check if speech synthesis is supported
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  /**
   * Get Korean voice
   */
  getKoreanVoice(): SpeechSynthesisVoice | null {
    return this.koreanVoice;
  }

  /**
   * Update audio settings
   */
  updateSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Set playback speed
   */
  setSpeed(rate: number): void {
    this.settings.rate = Math.max(0.1, Math.min(10, rate));
  }

  /**
   * Set pitch
   */
  setPitch(pitch: number): void {
    this.settings.pitch = Math.max(0, Math.min(2, pitch));
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
  }
}

// Export singleton instance (only create on client side)
export const audioService = typeof window !== 'undefined' ? AudioService.getInstance() : null;
