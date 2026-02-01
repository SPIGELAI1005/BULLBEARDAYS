/**
 * Tests for image validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { quickValidate, IMAGE_VALIDATION_RULES } from '../imageValidation';

describe('Image Validation', () => {
  describe('Quick Validation', () => {
    it('accepts valid JPEG file', () => {
      const validFile = new File(['fake-image-data'], 'chart.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(validFile, 'size', {
        value: 1024 * 1024, // 1MB
        writable: false,
      });

      const result = quickValidate(validFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts valid PNG file', () => {
      const validFile = new File(['fake-image-data'], 'chart.png', {
        type: 'image/png',
      });
      Object.defineProperty(validFile, 'size', {
        value: 2 * 1024 * 1024, // 2MB
        writable: false,
      });

      const result = quickValidate(validFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('accepts valid WebP file', () => {
      const validFile = new File(['fake-image-data'], 'chart.webp', {
        type: 'image/webp',
      });
      Object.defineProperty(validFile, 'size', {
        value: 1024 * 1024, // 1MB
        writable: false,
      });

      const result = quickValidate(validFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects file larger than 10MB', () => {
      const largeFile = new File(['fake-image-data'], 'large.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(largeFile, 'size', {
        value: 11 * 1024 * 1024, // 11MB
        writable: false,
      });

      const result = quickValidate(largeFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('too large');
    });

    it('rejects invalid file format', () => {
      const invalidFile = new File(['fake-data'], 'document.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(invalidFile, 'size', {
        value: 1024 * 1024,
        writable: false,
      });

      const result = quickValidate(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid format');
    });

    it('rejects file that is too small', () => {
      const tinyFile = new File(['tiny'], 'tiny.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(tinyFile, 'size', {
        value: 500, // 500 bytes
        writable: false,
      });

      const result = quickValidate(tinyFile);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('too small');
    });

    it('rejects GIF format', () => {
      const gifFile = new File(['fake-data'], 'animation.gif', {
        type: 'image/gif',
      });
      Object.defineProperty(gifFile, 'size', {
        value: 1024 * 1024,
        writable: false,
      });

      const result = quickValidate(gifFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid format');
    });

    it('rejects BMP format', () => {
      const bmpFile = new File(['fake-data'], 'chart.bmp', {
        type: 'image/bmp',
      });
      Object.defineProperty(bmpFile, 'size', {
        value: 1024 * 1024,
        writable: false,
      });

      const result = quickValidate(bmpFile);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Invalid format');
    });
  });

  describe('Validation Rules Constants', () => {
    it('has correct max file size', () => {
      expect(IMAGE_VALIDATION_RULES.maxSizeBytes).toBe(10 * 1024 * 1024);
    });

    it('has reasonable min dimensions', () => {
      expect(IMAGE_VALIDATION_RULES.minWidth).toBe(400);
      expect(IMAGE_VALIDATION_RULES.minHeight).toBe(300);
    });

    it('has reasonable max dimensions', () => {
      expect(IMAGE_VALIDATION_RULES.maxWidth).toBe(4096);
      expect(IMAGE_VALIDATION_RULES.maxHeight).toBe(4096);
    });

    it('includes common image formats', () => {
      expect(IMAGE_VALIDATION_RULES.allowedFormats).toContain('image/jpeg');
      expect(IMAGE_VALIDATION_RULES.allowedFormats).toContain('image/png');
      expect(IMAGE_VALIDATION_RULES.allowedFormats).toContain('image/webp');
    });

    it('has brightness range defined', () => {
      expect(IMAGE_VALIDATION_RULES.minBrightness).toBeDefined();
      expect(IMAGE_VALIDATION_RULES.maxBrightness).toBeDefined();
      expect(IMAGE_VALIDATION_RULES.minBrightness).toBeLessThan(
        IMAGE_VALIDATION_RULES.maxBrightness
      );
    });

    it('has minimum contrast defined', () => {
      expect(IMAGE_VALIDATION_RULES.minContrast).toBeDefined();
      expect(IMAGE_VALIDATION_RULES.minContrast).toBeGreaterThan(0);
    });
  });

  describe('Multiple Errors', () => {
    it('reports multiple errors for invalid file', () => {
      const invalidFile = new File(['tiny'], 'tiny.txt', {
        type: 'text/plain',
      });
      Object.defineProperty(invalidFile, 'size', {
        value: 100,
        writable: false,
      });

      const result = quickValidate(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('handles exactly 10MB file', () => {
      const exactFile = new File(['fake-data'], 'exact.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(exactFile, 'size', {
        value: 10 * 1024 * 1024, // Exactly 10MB
        writable: false,
      });

      const result = quickValidate(exactFile);
      expect(result.valid).toBe(true);
    });

    it('handles file with mixed case extension', () => {
      const mixedFile = new File(['fake-data'], 'Chart.JPG', {
        type: 'image/jpeg',
      });
      Object.defineProperty(mixedFile, 'size', {
        value: 1024 * 1024,
        writable: false,
      });

      const result = quickValidate(mixedFile);
      expect(result.valid).toBe(true);
    });
  });
});
