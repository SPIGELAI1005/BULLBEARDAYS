/**
 * Custom hook for managing chart image upload state and logic
 */
import { useState, useCallback } from "react";

export interface UseChartUploadReturn {
  // Single image mode
  uploadedImage: string | null;
  handleImageUpload: (image: string) => void;
  handleClearImage: () => void;

  // Multi image mode
  uploadedImages: string[];
  handleMultiImagesUpload: (images: string[]) => void;
  handleClearAllImages: () => void;
  handleClearOneImage: (index: number) => void;

  // Mode state
  isMultiChartMode: boolean;
  setIsMultiChartMode: (value: boolean) => void;
  isChatMode: boolean;
  setIsChatMode: (value: boolean) => void;

  // Chat context
  chatContext: string;
  setChatContext: (value: string) => void;

  // Analysis state
  resetAnalysisState: () => void;
}

export function useChartUpload(): UseChartUploadReturn {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isMultiChartMode, setIsMultiChartMode] = useState(false);
  const [isChatMode, setIsChatMode] = useState(true); // Default to chat mode
  const [chatContext, setChatContext] = useState<string>("");

  const handleImageUpload = useCallback((image: string) => {
    setUploadedImage(image);
  }, []);

  const handleClearImage = useCallback(() => {
    setUploadedImage(null);
  }, []);

  const handleMultiImagesUpload = useCallback((images: string[]) => {
    setUploadedImages(images);
  }, []);

  const handleClearAllImages = useCallback(() => {
    setUploadedImages([]);
  }, []);

  const handleClearOneImage = useCallback((index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const resetAnalysisState = useCallback(() => {
    // Reset all image-related state when analysis completes or fails
    // This is called from useAnalysisFlow
  }, []);

  return {
    uploadedImage,
    handleImageUpload,
    handleClearImage,
    uploadedImages,
    handleMultiImagesUpload,
    handleClearAllImages,
    handleClearOneImage,
    isMultiChartMode,
    setIsMultiChartMode,
    isChatMode,
    setIsChatMode,
    chatContext,
    setChatContext,
    resetAnalysisState,
  };
}
