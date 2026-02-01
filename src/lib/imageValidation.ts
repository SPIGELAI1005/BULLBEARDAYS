/**
 * Image validation and readability checks for chart uploads
 *
 * Validates images before sending to AI to prevent wasted API calls
 * and provide better user feedback.
 */

// ============================================================================
// Constants
// ============================================================================

export const IMAGE_VALIDATION_RULES = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  minWidth: 400,
  minHeight: 300,
  maxWidth: 4096,
  maxHeight: 4096,
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  minBrightness: 30, // 0-255
  maxBrightness: 225, // 0-255
  minContrast: 20, // Percentage
} as const;

// ============================================================================
// Types
// ============================================================================

export interface ImageValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  metadata?: {
    width: number;
    height: number;
    size: number;
    format: string;
    readabilityScore?: number;
  };
}

export interface ImageReadabilityMetrics {
  brightness: number; // 0-255
  contrast: number; // 0-100%
  hasText: boolean;
  isLikelyChart: boolean;
  readabilityScore: number; // 0-100
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validates an image for chart analysis
 * Checks format, size, dimensions, and basic readability
 */
export async function validateChartImage(
  file: File | string
): Promise<ImageValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Handle both File objects and base64 strings
    let imageData: string;
    let fileSize: number;
    let mimeType: string;

    if (typeof file === 'string') {
      // Base64 string
      imageData = file;

      // Extract mime type from data URL
      const mimeMatch = file.match(/^data:(image\/[a-z]+);base64,/);
      mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      // Estimate size from base64 length
      const base64Length = file.replace(/^data:image\/[a-z]+;base64,/, '').length;
      fileSize = Math.ceil(base64Length * 0.75); // Base64 is ~33% larger than binary
    } else {
      // File object
      fileSize = file.size;
      mimeType = file.type;

      // Convert to base64
      imageData = await fileToBase64(file);
    }

    // 1. Format validation
    if (!IMAGE_VALIDATION_RULES.allowedFormats.includes(mimeType)) {
      errors.push(
        `Invalid format: ${mimeType}. Allowed formats: JPEG, PNG, WebP`
      );
    }

    // 2. Size validation
    if (fileSize > IMAGE_VALIDATION_RULES.maxSizeBytes) {
      errors.push(
        `Image too large: ${(fileSize / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`
      );
    }

    if (fileSize < 10 * 1024) {
      warnings.push('Image is very small, may not contain enough detail');
    }

    // 3. Load image to check dimensions and readability
    const img = await loadImage(imageData);
    const { width, height } = img;

    // Dimension validation
    if (width < IMAGE_VALIDATION_RULES.minWidth) {
      errors.push(
        `Image width too small: ${width}px. Minimum: ${IMAGE_VALIDATION_RULES.minWidth}px`
      );
    }

    if (height < IMAGE_VALIDATION_RULES.minHeight) {
      errors.push(
        `Image height too small: ${height}px. Minimum: ${IMAGE_VALIDATION_RULES.minHeight}px`
      );
    }

    if (width > IMAGE_VALIDATION_RULES.maxWidth || height > IMAGE_VALIDATION_RULES.maxHeight) {
      warnings.push('Image is very large, consider resizing for faster processing');
    }

    // Check aspect ratio
    const aspectRatio = width / height;
    if (aspectRatio < 0.5 || aspectRatio > 3) {
      warnings.push('Unusual aspect ratio detected. Charts typically have 16:9 or 4:3 ratio');
    }

    // 4. Readability checks (if no blocking errors)
    let readabilityMetrics: ImageReadabilityMetrics | undefined;
    if (errors.length === 0) {
      readabilityMetrics = await analyzeImageReadability(img);

      // Check brightness
      if (
        readabilityMetrics.brightness < IMAGE_VALIDATION_RULES.minBrightness ||
        readabilityMetrics.brightness > IMAGE_VALIDATION_RULES.maxBrightness
      ) {
        warnings.push(
          `Image brightness may affect readability (${readabilityMetrics.brightness.toFixed(0)}/255)`
        );
      }

      // Check contrast
      if (readabilityMetrics.contrast < IMAGE_VALIDATION_RULES.minContrast) {
        warnings.push(
          `Low contrast detected (${readabilityMetrics.contrast.toFixed(0)}%). May be difficult to analyze`
        );
      }

      // Check if it looks like a chart
      if (!readabilityMetrics.isLikelyChart) {
        warnings.push(
          'Image may not be a trading chart. Please upload a chart screenshot.'
        );
      }

      // Overall readability warning
      if (readabilityMetrics.readabilityScore < 50) {
        warnings.push(
          `Low readability score (${readabilityMetrics.readabilityScore}/100). Consider uploading a clearer image.`
        );
      }
    }

    // Return validation result
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata: {
        width,
        height,
        size: fileSize,
        format: mimeType,
        readabilityScore: readabilityMetrics?.readabilityScore,
      },
    };
  } catch (error) {
    console.error('Image validation error:', error);
    return {
      valid: false,
      errors: [
        `Failed to validate image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
      warnings,
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Loads image from base64 string
 */
function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = base64;
  });
}

/**
 * Analyzes image readability metrics
 */
async function analyzeImageReadability(
  img: HTMLImageElement
): Promise<ImageReadabilityMetrics> {
  // Create canvas to analyze pixels
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Use smaller sample size for performance
  const sampleWidth = Math.min(img.width, 800);
  const sampleHeight = Math.min(img.height, 600);
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;

  // Draw image
  ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  const pixels = imageData.data;

  // Calculate brightness
  let totalBrightness = 0;
  const sampleSize = Math.min(10000, pixels.length / 4); // Sample every nth pixel
  const step = Math.floor(pixels.length / 4 / sampleSize);

  for (let i = 0; i < pixels.length; i += step * 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    totalBrightness += (r + g + b) / 3;
  }

  const brightness = totalBrightness / sampleSize;

  // Calculate contrast (standard deviation of brightness)
  let varianceSum = 0;
  for (let i = 0; i < pixels.length; i += step * 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const pixelBrightness = (r + g + b) / 3;
    varianceSum += Math.pow(pixelBrightness - brightness, 2);
  }
  const stdDev = Math.sqrt(varianceSum / sampleSize);
  const contrast = (stdDev / 255) * 100; // Normalize to percentage

  // Detect if likely a chart (heuristic checks)
  const hasHighContrast = contrast > 15;
  const hasGoodBrightness = brightness > 50 && brightness < 200;
  const hasLines = detectLines(ctx, sampleWidth, sampleHeight);

  const isLikelyChart = hasHighContrast && hasGoodBrightness && hasLines;

  // Calculate readability score (0-100)
  let readabilityScore = 50; // Start at neutral

  // Brightness contribution (0-30 points)
  if (brightness >= 80 && brightness <= 180) {
    readabilityScore += 30;
  } else if (brightness >= 50 && brightness <= 200) {
    readabilityScore += 20;
  } else {
    readabilityScore += 10;
  }

  // Contrast contribution (0-30 points)
  if (contrast >= 25) {
    readabilityScore += 30;
  } else if (contrast >= 15) {
    readabilityScore += 20;
  } else {
    readabilityScore += 10;
  }

  // Chart-like features contribution (0-40 points)
  if (isLikelyChart) {
    readabilityScore += 40;
  } else if (hasHighContrast || hasLines) {
    readabilityScore += 20;
  }

  // Cap at 100
  readabilityScore = Math.min(100, readabilityScore);

  return {
    brightness,
    contrast,
    hasText: false, // Text detection is complex, placeholder
    isLikelyChart,
    readabilityScore,
  };
}

/**
 * Simple line detection heuristic
 * Looks for horizontal and vertical edges
 */
function detectLines(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): boolean {
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let horizontalEdges = 0;
  let verticalEdges = 0;

  // Sample edges at regular intervals
  const sampleRate = 20; // Check every 20 pixels

  // Check for horizontal lines
  for (let y = 0; y < height; y += sampleRate) {
    let edgeCount = 0;
    for (let x = 1; x < width - 1; x++) {
      const i = (y * width + x) * 4;
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      const nextBrightness =
        (pixels[i + 4] + pixels[i + 5] + pixels[i + 6]) / 3;

      if (Math.abs(brightness - nextBrightness) > 30) {
        edgeCount++;
      }
    }
    if (edgeCount > width * 0.3) {
      // If > 30% of pixels are edges
      horizontalEdges++;
    }
  }

  // Check for vertical lines
  for (let x = 0; x < width; x += sampleRate) {
    let edgeCount = 0;
    for (let y = 1; y < height - 1; y++) {
      const i = (y * width + x) * 4;
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      const nextBrightness =
        (pixels[(y + 1) * width * 4 + x * 4] +
          pixels[(y + 1) * width * 4 + x * 4 + 1] +
          pixels[(y + 1) * width * 4 + x * 4 + 2]) /
        3;

      if (Math.abs(brightness - nextBrightness) > 30) {
        edgeCount++;
      }
    }
    if (edgeCount > height * 0.3) {
      verticalEdges++;
    }
  }

  // Charts typically have multiple horizontal and vertical lines
  return horizontalEdges >= 3 && verticalEdges >= 3;
}

// ============================================================================
// Quick Validation (for instant feedback)
// ============================================================================

/**
 * Quick validation without loading the image
 * Useful for instant feedback before full validation
 */
export function quickValidate(file: File): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check format
  if (!IMAGE_VALIDATION_RULES.allowedFormats.includes(file.type)) {
    errors.push(
      `Invalid format: ${file.type}. Use JPEG, PNG, or WebP`
    );
  }

  // Check size
  if (file.size > IMAGE_VALIDATION_RULES.maxSizeBytes) {
    errors.push(
      `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: 10MB`
    );
  }

  if (file.size < 1024) {
    errors.push('File too small. Please upload a valid chart image.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Validation Message Helpers
// ============================================================================

/**
 * Format validation result into user-friendly message
 */
export function formatValidationMessage(result: ImageValidationResult): string {
  if (result.valid && result.warnings.length === 0) {
    return '✅ Image validated successfully';
  }

  if (!result.valid) {
    return `❌ ${result.errors.join('. ')}`;
  }

  if (result.warnings.length > 0) {
    return `⚠️ ${result.warnings[0]}`; // Show first warning
  }

  return 'Image validated';
}

/**
 * Get validation status icon and color
 */
export function getValidationStatus(result: ImageValidationResult): {
  icon: string;
  color: string;
  message: string;
} {
  if (!result.valid) {
    return {
      icon: '❌',
      color: 'red',
      message: result.errors[0],
    };
  }

  if (result.warnings.length > 0) {
    const score = result.metadata?.readabilityScore || 50;
    if (score < 40) {
      return {
        icon: '⚠️',
        color: 'orange',
        message: 'Low quality - analysis may be limited',
      };
    }
    return {
      icon: '✓',
      color: 'yellow',
      message: 'Acceptable quality',
    };
  }

  return {
    icon: '✅',
    color: 'green',
    message: 'Excellent quality',
  };
}
