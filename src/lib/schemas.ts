/**
 * Zod validation schemas for BullBearDays scenario analysis
 *
 * These schemas validate AI responses to ensure data integrity and type safety.
 * Used in edge functions before saving data to database.
 */

import { z } from "zod";

// ============================================================================
// Core Enums
// ============================================================================

export const TrendBiasSchema = z.enum(["BULLISH", "BEARISH", "NEUTRAL"]);

export const TradingStrategySchema = z.enum([
  "scalper",
  "dayTrader",
  "swingTrader",
  "positionTrader",
  "investor",
]);

// ============================================================================
// Nested Object Schemas
// ============================================================================

export const KeyLevelsSchema = z.object({
  support: z.array(z.string()).optional().default([]),
  resistance: z.array(z.string()).optional().default([]),
});

export const ScenarioSchema = z.object({
  thesis: z.string().min(10, "Thesis must be at least 10 characters"),
  evidence: z
    .array(z.string())
    .min(1, "Must have at least 1 evidence point")
    .max(10, "Too many evidence points (max 10)"),
  keyLevels: KeyLevelsSchema.optional(),
  invalidation: z.string().min(1, "Invalidation condition required"),
  riskNotes: z
    .array(z.string())
    .min(1, "Must have at least 1 risk note")
    .max(10, "Too many risk notes (max 10)"),
});

export const InstrumentInfoSchema = z.object({
  detected: z.string().optional(),
  selected: z.string().optional(),
  final: z.string().min(1, "Final instrument required"),
  confidence: z.number().min(0).max(100).optional(),
});

export const TimeframeInfoSchema = z.object({
  detected: z.string().optional(),
  selected: z.string(),
  final: z.string().min(1, "Final timeframe required"),
});

export const PriceTargetSchema = z.object({
  price: z.number().positive("Price must be positive"),
  confidence: z.number().min(0).max(100),
});

export const ConfidenceIntervalSchema = z.object({
  low: z.number(),
  high: z.number(),
  timeframe: z.string(),
});

// ============================================================================
// Main Analysis Schema
// ============================================================================

export const ScenarioAnalysisSchema = z.object({
  // Core scenario data
  trendBias: TrendBiasSchema,
  confidenceScore: z
    .number()
    .min(0, "Confidence must be at least 0")
    .max(100, "Confidence cannot exceed 100"),
  bullScenario: ScenarioSchema,
  bearScenario: ScenarioSchema,

  // Context
  instrument: InstrumentInfoSchema,
  timeframe: TimeframeInfoSchema,
  strategy: TradingStrategySchema,

  // AI metadata
  aiModel: z.string().min(1, "AI model name required"),
  modelsUsed: z.array(z.string()).optional(),
  promptVersion: z.string().optional(),
  apiVersion: z.string().optional(),

  // Price data (optional)
  currentPrice: z.number().positive().optional(),
  takeProfit: z.string().optional(),
  stopLoss: z.string().optional(),
  riskReward: z.string().optional(),

  // Price targets (optional)
  priceTargets: z
    .object({
      conservative: PriceTargetSchema.optional(),
      moderate: PriceTargetSchema.optional(),
      aggressive: PriceTargetSchema.optional(),
    })
    .optional(),

  // Confidence intervals (optional)
  confidenceIntervals: z
    .object({
      short: ConfidenceIntervalSchema.optional(),
      medium: ConfidenceIntervalSchema.optional(),
      long: ConfidenceIntervalSchema.optional(),
    })
    .optional(),

  // Database fields (when retrieved)
  id: z.string().optional(),
  userId: z.string().optional(),
  createdAt: z.string().optional(),
  chartImageUrl: z.string().optional(),
  outcome: z.enum(["WIN", "LOSS", "PENDING"]).optional(),
  outcomeNotes: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// Legacy Analysis Schema (for backward compatibility)
// ============================================================================

export const LegacyAnalysisSchema = z.object({
  signal: z.enum(["BUY", "SELL", "HOLD"]),
  probability: z.number().min(0).max(100),
  takeProfit: z.string(),
  stopLoss: z.string(),
  riskReward: z.string(),
  reasoning: z.object({
    bullish: z.array(z.string()),
    bearish: z.array(z.string()),
  }),
  chartAnalysis: z.string(),
  marketSentiment: z.string(),
  aiModel: z.string(),
  detectedAsset: z.string().optional(),
  currentPrice: z.number().optional(),
  priceTargets: z
    .object({
      conservative: PriceTargetSchema.optional(),
      moderate: PriceTargetSchema.optional(),
      aggressive: PriceTargetSchema.optional(),
    })
    .optional(),
  confidenceIntervals: z
    .object({
      short: ConfidenceIntervalSchema.optional(),
      medium: ConfidenceIntervalSchema.optional(),
      long: ConfidenceIntervalSchema.optional(),
    })
    .optional(),
});

// ============================================================================
// Union Schema (accepts both formats)
// ============================================================================

export const UnifiedAnalysisSchema = z.union([
  ScenarioAnalysisSchema,
  LegacyAnalysisSchema,
]);

// ============================================================================
// Type Exports (inferred from schemas)
// ============================================================================

export type ScenarioAnalysisValidated = z.infer<typeof ScenarioAnalysisSchema>;
export type LegacyAnalysisValidated = z.infer<typeof LegacyAnalysisSchema>;
export type UnifiedAnalysisValidated = z.infer<typeof UnifiedAnalysisSchema>;
export type TrendBiasValidated = z.infer<typeof TrendBiasSchema>;
export type TradingStrategyValidated = z.infer<typeof TradingStrategySchema>;

// ============================================================================
// Validation Helper Functions
// ============================================================================

/**
 * Validates a scenario analysis response from AI
 * Returns validated data or throws detailed error
 */
export function validateScenarioAnalysis(data: unknown): ScenarioAnalysisValidated {
  return ScenarioAnalysisSchema.parse(data);
}

/**
 * Safe validation that returns validation result
 * Use this when you want to handle errors gracefully
 */
export function safeValidateScenarioAnalysis(data: unknown) {
  return ScenarioAnalysisSchema.safeParse(data);
}

/**
 * Validates legacy analysis format
 */
export function validateLegacyAnalysis(data: unknown): LegacyAnalysisValidated {
  return LegacyAnalysisSchema.parse(data);
}

/**
 * Validates either format
 */
export function validateUnifiedAnalysis(data: unknown): UnifiedAnalysisValidated {
  return UnifiedAnalysisSchema.parse(data);
}

/**
 * Creates a fallback scenario analysis when validation fails
 * Used to provide a graceful degradation experience
 */
export function createFallbackScenario(
  errorMessage: string,
  partialData?: Partial<ScenarioAnalysisValidated>
): ScenarioAnalysisValidated {
  const baseScenario = {
    thesis: "Unable to generate complete analysis due to processing error.",
    evidence: [
      "Chart analysis incomplete",
      "Please try uploading a clearer image",
    ],
    keyLevels: {
      support: [],
      resistance: [],
    },
    invalidation: "N/A - Analysis incomplete",
    riskNotes: [
      "Analysis quality compromised",
      "Consider re-analyzing with better image quality",
    ],
  };

  return {
    trendBias: "NEUTRAL",
    confidenceScore: 30,
    bullScenario: baseScenario,
    bearScenario: baseScenario,
    instrument: partialData?.instrument || {
      final: "Unknown",
      detected: undefined,
      selected: undefined,
    },
    timeframe: partialData?.timeframe || {
      detected: undefined,
      selected: "1D",
      final: "1D",
    },
    strategy: partialData?.strategy || "swingTrader",
    aiModel: partialData?.aiModel || "AI Assistant",
    modelsUsed: partialData?.modelsUsed,
    promptVersion: partialData?.promptVersion,
    apiVersion: partialData?.apiVersion,
  };
}

/**
 * Partial validation for debugging
 * Returns which fields are invalid
 */
export function validatePartialScenario(data: unknown) {
  const result = ScenarioAnalysisSchema.safeParse(data);

  if (!result.success) {
    return {
      valid: false,
      errors: result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    };
  }

  return {
    valid: true,
    data: result.data,
  };
}

// ============================================================================
// Image Validation Schema (for Phase 2)
// ============================================================================

export const ImageUploadSchema = z.object({
  base64: z.string().min(100, "Image data too short"),
  mimeType: z.enum(["image/png", "image/jpeg", "image/jpg", "image/webp"]),
  size: z
    .number()
    .max(10 * 1024 * 1024, "Image must be less than 10MB")
    .positive("Invalid image size"),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export type ImageUploadValidated = z.infer<typeof ImageUploadSchema>;

/**
 * Validates image upload data
 */
export function validateImageUpload(data: unknown): ImageUploadValidated {
  return ImageUploadSchema.parse(data);
}
