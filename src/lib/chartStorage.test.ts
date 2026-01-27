import { describe, it, expect, vi, beforeEach } from "vitest";
import { getChartImageUrl } from "./chartStorage";

// Mock Supabase client
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn((path: string) => ({
          data: {
            publicUrl: `https://example.supabase.co/storage/v1/object/public/chart-images/${path}`,
          },
        })),
        upload: vi.fn(),
        remove: vi.fn(),
      })),
    },
  },
}));

describe("chartStorage", () => {
  describe("getChartImageUrl", () => {
    it("should return public URL for given path", () => {
      const path = "user123/analysis456.png";
      const url = getChartImageUrl(path);

      expect(url).toBe(
        "https://example.supabase.co/storage/v1/object/public/chart-images/user123/analysis456.png"
      );
    });

    it("should handle paths without leading slash", () => {
      const path = "test.png";
      const url = getChartImageUrl(path);

      expect(url).toContain("test.png");
    });

    it("should handle paths with special characters", () => {
      const path = "user-123/file_name-2024.png";
      const url = getChartImageUrl(path);

      expect(url).toContain("user-123/file_name-2024.png");
    });
  });

  describe("base64 to blob conversion", () => {
    it("should correctly identify base64 data", () => {
      const base64String = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const base64Data = base64String.split(",")[1];

      expect(base64Data).toBe("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
    });

    it("should extract data from base64 string with prefix", () => {
      const withPrefix = "data:image/jpeg;base64,/9j/4AAQ";
      const data = withPrefix.split(",")[1];

      expect(data).toBe("/9j/4AAQ");
    });
  });

  describe("URL path extraction", () => {
    it("should extract path from storage URL", () => {
      const url = "https://example.supabase.co/storage/v1/object/public/chart-images/user123/image.png";
      const urlParts = url.split("/chart-images/");

      expect(urlParts).toHaveLength(2);
      expect(urlParts[1]).toBe("user123/image.png");
    });

    it("should handle invalid URL format", () => {
      const url = "https://example.com/invalid/url";
      const urlParts = url.split("/chart-images/");

      expect(urlParts).toHaveLength(1);
    });
  });
});
