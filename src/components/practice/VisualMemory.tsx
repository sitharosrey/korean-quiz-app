'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Upload, 
  Search, 
  Loader2, 
  XCircle, 
  Eye,
  EyeOff,
  Download,
  ExternalLink
} from 'lucide-react';
import { WordPair } from '@/types';
import { StorageService } from '@/lib/storage';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualMemoryProps {
  word: WordPair;
  onImageChange: (imageUrl: string | undefined) => void;
}

export function VisualMemory({ word, onImageChange }: VisualMemoryProps) {
  const [imageUrl, setImageUrl] = useState(word.imageUrl || '');
  const [isFetching, setIsFetching] = useState(false);
  const [showImage, setShowImage] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const settings = StorageService.getSettings();

  // Sync state with prop changes
  useEffect(() => {
    setImageUrl(word.imageUrl || '');
  }, [word.imageUrl]);

  const handleManualInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    onImageChange(url || undefined);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file is too large. Please choose a file smaller than 5MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        onImageChange(base64);
        setIsUploading(false);
        toast.success('Image uploaded successfully!');
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error('Failed to read the image file.');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error('Failed to upload image.');
    }
  };

  const handleAutoFetch = async () => {
    if (!settings.enableImages) {
      toast.info("Image features are disabled in settings.");
      return;
    }

    setIsFetching(true);
    
    try {
      // For demo purposes, we'll use a placeholder service
      // In a real app, you'd integrate with Unsplash API
      const response = await fetch(`https://picsum.photos/400/300?random=${Date.now()}`);
      if (response.ok) {
        const fetchedUrl = response.url;
        setImageUrl(fetchedUrl);
        onImageChange(fetchedUrl);
        toast.success('Image fetched successfully!');
      } else {
        throw new Error('Failed to fetch image');
      }
    } catch (error) {
      console.error('Error fetching image:', error);
      toast.error('Failed to fetch image. Please try again.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageChange(undefined);
    toast.info('Image removed.');
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${word.korean}-image.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenImage = () => {
    if (!imageUrl) return;
    window.open(imageUrl, '_blank');
  };

  if (!settings.enableImages) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5 text-gray-400" />
            Visual Memory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-500">
              Image features are currently disabled in your settings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5 text-cyan-500" />
          Visual Memory
        </CardTitle>
        <p className="text-sm text-gray-600">
          Add a visual aid to help remember "{word.korean}"
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Image Display */}
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              {showImage ? (
                <img 
                  src={imageUrl} 
                  alt={`Visual aid for ${word.korean}`}
                  className="object-cover w-full h-full"
                  onError={() => {
                    toast.error('Failed to load image');
                    setImageUrl('');
                    onImageChange(undefined);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <EyeOff className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              {/* Image Controls */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setShowImage(!showImage)}
                  className="h-8 w-8 rounded-full"
                >
                  {showImage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleDownloadImage}
                  className="h-8 w-8 rounded-full"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleOpenImage}
                  className="h-8 w-8 rounded-full"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={handleRemoveImage}
                  className="h-8 w-8 rounded-full"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Image Info */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                {imageUrl.startsWith('data:') ? 'Uploaded image' : 'External image'}
              </span>
              <Badge variant="outline" className="text-xs">
                Visual Aid
              </Badge>
            </div>
          </motion.div>
        )}

        {/* Input Methods */}
        <div className="space-y-3">
          {/* URL Input */}
          <div className="space-y-2">
            <label htmlFor="image-url" className="text-sm font-medium text-gray-700">
              Image URL
            </label>
            <Input
              id="image-url"
              type="url"
              placeholder="Paste image URL here"
              value={imageUrl}
              onChange={handleManualInputChange}
              className="text-sm"
            />
          </div>

          {/* Upload and Fetch Buttons */}
          <div className="flex gap-2">
            {/* File Upload */}
            <div className="relative flex-1">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button 
                asChild 
                variant="outline" 
                className="w-full"
                disabled={isUploading}
              >
                <label htmlFor="image-upload" className="flex items-center justify-center cursor-pointer">
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </label>
              </Button>
            </div>

            {/* Auto Fetch */}
            {settings.autoFetchImages && (
              <Button
                onClick={handleAutoFetch}
                disabled={isFetching}
                variant="outline"
                className="flex-1"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Auto-fetch
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Upload images up to 5MB in size</p>
          <p>• Supported formats: JPG, PNG, GIF, WebP</p>
          {!settings.autoFetchImages && (
            <p>• Auto-fetch images is disabled in settings</p>
          )}
        </div>

        {/* No Image State */}
        {!imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg"
          >
            <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-2">
              No image attached to this word
            </p>
            <p className="text-xs text-gray-400">
              Add an image to improve visual memory
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
