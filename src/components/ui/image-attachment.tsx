'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageService } from '@/lib/image-service';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ImageAttachmentProps {
  word: string;
  language?: 'korean' | 'english';
  currentImageUrl?: string;
  onImageChange: (imageUrl: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function ImageAttachment({
  word,
  language = 'english',
  currentImageUrl,
  onImageChange,
  className,
  disabled = false,
}: ImageAttachmentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file must be smaller than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Convert file to data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onImageChange(dataUrl);
        setIsUploading(false);
        toast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setError('Failed to upload image');
      setIsUploading(false);
    }
  };

  const handleAutoFetch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await ImageService.fetchImageForWord(word, language);
      onImageChange(imageUrl);
      toast.success('Image fetched successfully!');
    } catch (error) {
      setError('Failed to fetch image');
      toast.error('Failed to fetch image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
    toast.success('Image removed');
  };

  const handleRetry = () => {
    setError(null);
    if (currentImageUrl) {
      handleAutoFetch();
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Current Image Display */}
          <AnimatePresence>
            {currentImageUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={currentImageUrl}
                    alt={ImageService.getImageAltText(word, language)}
                    className="w-full h-full object-cover"
                    onError={() => setError('Failed to load image')}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-6 w-6 p-0"
                    onClick={handleRemoveImage}
                    disabled={disabled}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRetry}
                className="ml-auto h-6 px-2 text-red-600 hover:text-red-700"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoFetch}
              disabled={disabled || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Auto Fetch
                </>
              )}
            </Button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={disabled}
          />

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center">
            Upload your own image or auto-fetch a relevant image for "{word}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
