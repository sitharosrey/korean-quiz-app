export class ImageService {
  private static readonly UNSPLASH_ACCESS_KEY = 'your_unsplash_access_key'; // You'll need to get this from Unsplash
  private static readonly UNSPLASH_BASE_URL = 'https://api.unsplash.com';
  
  // Fallback to placeholder images if Unsplash is not available
  private static readonly PLACEHOLDER_BASE_URL = 'https://picsum.photos';

  static async fetchImageForWord(word: string, language: 'korean' | 'english' = 'english'): Promise<string> {
    try {
      // Try Unsplash first if API key is available
      if (this.UNSPLASH_ACCESS_KEY !== 'your_unsplash_access_key') {
        const unsplashUrl = await this.fetchFromUnsplash(word, language);
        if (unsplashUrl) return unsplashUrl;
      }
      
      // Fallback to placeholder service
      return this.getPlaceholderImage(word);
    } catch (error) {
      console.error('Error fetching image:', error);
      return this.getPlaceholderImage(word);
    }
  }

  private static async fetchFromUnsplash(word: string, language: 'korean' | 'english'): Promise<string | null> {
    try {
      const searchQuery = language === 'korean' ? word : word;
      const url = `${this.UNSPLASH_BASE_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Client-ID ${this.UNSPLASH_ACCESS_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }
      
      return null;
    } catch (error) {
      console.error('Unsplash fetch error:', error);
      return null;
    }
  }

  private static getPlaceholderImage(word: string): string {
    // Use a hash of the word to get consistent placeholder images
    const hash = this.simpleHash(word);
    const width = 400;
    const height = 300;
    
    return `${this.PLACEHOLDER_BASE_URL}/${width}/${height}?random=${hash}`;
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  static async fetchMultipleImages(words: string[], language: 'korean' | 'english' = 'english'): Promise<Record<string, string>> {
    const imagePromises = words.map(async (word) => {
      const imageUrl = await this.fetchImageForWord(word, language);
      return { word, imageUrl };
    });

    const results = await Promise.all(imagePromises);
    
    return results.reduce((acc, { word, imageUrl }) => {
      acc[word] = imageUrl;
      return acc;
    }, {} as Record<string, string>);
  }

  static validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  static getImageAltText(word: string, language: 'korean' | 'english' = 'english'): string {
    return `Image representing the word "${word}" in ${language}`;
  }
}
