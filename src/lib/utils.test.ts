import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn (className utility)", () => {
    it("should merge class names correctly", () => {
      const result = cn("px-4", "py-2");
      expect(result).toBe("px-4 py-2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base-class", false && "hidden", true && "visible");
      expect(result).toBe("base-class visible");
    });

    it("should merge Tailwind classes without conflicts", () => {
      const result = cn("px-2", "px-4");
      expect(result).toBe("px-4");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["flex", "items-center"], "gap-2");
      expect(result).toBe("flex items-center gap-2");
    });

    it("should handle undefined and null values", () => {
      const result = cn("text-sm", undefined, null, "font-bold");
      expect(result).toBe("text-sm font-bold");
    });

    it("should handle empty input", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle object syntax", () => {
      const result = cn({
        "text-red-500": true,
        "text-blue-500": false,
      });
      expect(result).toBe("text-red-500");
    });
  });
});
