# Validation System Guide

**Status:** ✅ Active (Phase 2)
**Purpose:** Ensure data integrity and graceful error handling for AI-generated scenario analysis

---

## Overview

The validation system uses **Zod** to validate AI responses at both the **server** (edge function) and **client** (frontend) layers. This ensures:

1. AI responses match expected structure
2. All required fields are present
3. Field values are within valid ranges
4. Graceful fallback when validation fails

---

## Architecture

### Two-Layer Validation

```
┌─────────────┐
│  AI Model   │
└──────┬──────┘
       │ Raw JSON
       ↓
┌─────────────────┐
│ Edge Function   │ ← Layer 1: Server-side validation
│ (Zod Schema)    │
└──────┬──────────┘
       │ Validated JSON
       ↓
┌─────────────────┐
│ Frontend API    │ ← Layer 2: Client-side validation
│ (Zod Schema)    │
└──────┬──────────┘
       │ Safe Data
       ↓
┌─────────────────┐
│ React UI        │
└─────────────────┘
```

**Why two layers?**
- **Server**: Catch errors early, save bandwidth
- **Client**: Extra safety net, better error messages

---

## Schema Definitions

### Location: `src/lib/schemas.ts`

### Core Schemas

#### 1. ScenarioAnalysisSchema
Validates the complete AI response structure:
- `trendBias`: "BULLISH" | "BEARISH" | "NEUTRAL"
- `confidenceScore`: 0-100
- `bullScenario` and `bearScenario`: Complete scenario objects
- `instrument`, `timeframe`, `strategy`: Context data

#### 2. ScenarioSchema
Validates individual scenario (bull or bear):
- `thesis`: Min 10 characters
- `evidence`: 1-10 evidence points
- `keyLevels`: Optional support/resistance arrays
- `invalidation`: Required string
- `riskNotes`: 1-10 risk factors

#### 3. InstrumentInfoSchema
```typescript
{
  detected?: string,
  selected?: string,
  final: string,       // Required
  confidence?: number  // 0-100
}
```

#### 4. TimeframeInfoSchema
```typescript
{
  detected?: string,
  selected: string,    // Required
  final: string        // Required
}
```

---

## Validation Flow

### Edge Function Validation

**File:** `supabase/functions/analyze-chart/index.ts`

```typescript
// After parsing AI response
const validationResult = ScenarioAnalysisSchema.safeParse(analysis);

if (!validationResult.success) {
  console.error("Validation failed:", validationResult.error.errors);

  // Return fallback scenario
  return createFallbackScenario("Validation failed", partialData);
}

// Return validated data
return validationResult.data;
```

**Fallback Behavior:**
- Returns HTTP 200 (not error)
- Includes `X-Validation-Warning: fallback-used` header
- Provides generic NEUTRAL scenario
- Logs detailed errors to console

### Client Validation

**File:** `src/lib/api.ts`

```typescript
// After receiving API response
const validationResult = safeValidateScenarioAnalysis(data);

if (!validationResult.success) {
  console.warn("Client validation failed:", validationResult.error);

  // Return fallback
  return createFallbackScenario("Client validation failed", options);
}

return validationResult.data;
```

---

## Error Handling

### Validation Error Types

#### 1. Missing Required Fields
```typescript
{
  field: "bullScenario.thesis",
  message: "Thesis must be at least 10 characters"
}
```

#### 2. Invalid Type
```typescript
{
  field: "confidenceScore",
  message: "Expected number, received string"
}
```

#### 3. Out of Range
```typescript
{
  field: "confidenceScore",
  message: "Number must be less than or equal to 100"
}
```

#### 4. Array Validation
```typescript
{
  field: "bullScenario.evidence",
  message: "Array must contain at least 1 element(s)"
}
```

### Fallback Scenario Structure

When validation fails, a standardized fallback is returned:

```json
{
  "trendBias": "NEUTRAL",
  "confidenceScore": 30,
  "bullScenario": {
    "thesis": "Unable to generate complete analysis...",
    "evidence": [
      "Chart analysis incomplete",
      "Please try uploading a clearer image"
    ],
    "keyLevels": { "support": [], "resistance": [] },
    "invalidation": "N/A - Analysis incomplete",
    "riskNotes": [
      "Analysis quality compromised",
      "Consider re-analyzing with better image quality"
    ]
  },
  "bearScenario": { /* same structure */ },
  "instrument": { "final": "Unknown" },
  "timeframe": { "selected": "1D", "final": "1D" },
  "strategy": "swingTrader",
  "aiModel": "AI Assistant"
}
```

---

## Validation Functions

### `validateScenarioAnalysis(data)`
- **Throws** on validation failure
- Use when you want strict validation
- Returns validated data

```typescript
try {
  const validated = validateScenarioAnalysis(aiResponse);
  return validated;
} catch (error) {
  console.error("Validation failed:", error);
}
```

### `safeValidateScenarioAnalysis(data)`
- **Returns** `{ success: boolean, data?, error? }`
- Use for graceful error handling
- Recommended for API calls

```typescript
const result = safeValidateScenarioAnalysis(data);
if (result.success) {
  return result.data;
} else {
  console.error(result.error);
  return fallback;
}
```

### `validatePartialScenario(data)`
- Returns which fields are invalid
- Useful for debugging
- Returns array of error objects

```typescript
const result = validatePartialScenario(partialData);
if (!result.valid) {
  result.errors.forEach(err => {
    console.log(`${err.field}: ${err.message}`);
  });
}
```

### `createFallbackScenario(errorMessage, partialData?)`
- Generates safe fallback scenario
- Preserves any valid partial data
- Always returns valid structure

```typescript
const fallback = createFallbackScenario(
  "AI response incomplete",
  {
    instrument: { final: "BTC/USDT" },
    strategy: "swingTrader"
  }
);
```

---

## Monitoring Validation

### Server Logs

Edge function logs validation results:

```
✅ Validation successful for scenario analysis
```

or

```
❌ Validation failed for AI response: [
  { path: ['confidenceScore'], message: 'Expected number' }
]
```

### Client Logs

Frontend logs validation warnings:

```
⚠️ API response validation failed: ZodError: [...]
Validation errors: [
  { field: 'bullScenario.evidence', message: '...' }
]
```

### Response Headers

Check for validation warnings:

```typescript
if (response.headers.get('X-Validation-Warning') === 'fallback-used') {
  console.warn('Received fallback scenario due to validation failure');
}
```

---

## Testing Validation

### Unit Tests (Recommended)

Create tests in `src/lib/__tests__/schemas.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  validateScenarioAnalysis,
  safeValidateScenarioAnalysis
} from '@/lib/schemas';

describe('Scenario Validation', () => {
  it('validates complete scenario', () => {
    const validScenario = {
      trendBias: 'BULLISH',
      confidenceScore: 75,
      // ... complete data
    };

    const result = safeValidateScenarioAnalysis(validScenario);
    expect(result.success).toBe(true);
  });

  it('rejects invalid confidence score', () => {
    const invalid = {
      confidenceScore: 150, // > 100
      // ... rest of data
    };

    const result = safeValidateScenarioAnalysis(invalid);
    expect(result.success).toBe(false);
  });

  it('requires evidence array', () => {
    const invalid = {
      bullScenario: {
        thesis: 'Valid thesis',
        evidence: [], // Empty array invalid
      }
    };

    expect(() => validateScenarioAnalysis(invalid)).toThrow();
  });
});
```

### Manual Testing

1. **Upload clear chart** → Should validate successfully
2. **Upload unclear image** → May trigger fallback
3. **Check browser console** → Look for validation logs
4. **Check Supabase logs** → Look for edge function validation logs

---

## Common Validation Issues

### Issue 1: Missing Evidence
**Error:** `Array must contain at least 1 element(s)`

**Cause:** AI returned empty evidence array

**Fix:** Ensure AI prompt requires evidence points

### Issue 2: Invalid Confidence Score
**Error:** `Number must be less than or equal to 100`

**Cause:** AI returned confidence > 100

**Fix:** Validation catches this, returns fallback

### Issue 3: Missing Required Fields
**Error:** `Required field missing: bullScenario.thesis`

**Cause:** Incomplete AI response

**Fix:** Fallback scenario automatically generated

### Issue 4: Wrong Type
**Error:** `Expected string, received number`

**Cause:** AI returned wrong data type

**Fix:** Schema coercion or fallback

---

## Best Practices

### 1. Always Use Safe Validation
```typescript
// ✅ Good - handles errors gracefully
const result = safeValidateScenarioAnalysis(data);

// ❌ Avoid - throws errors
const data = validateScenarioAnalysis(rawData);
```

### 2. Log Validation Failures
```typescript
if (!result.success) {
  console.error('Validation failed:', {
    errors: result.error.errors,
    data: JSON.stringify(data, null, 2)
  });
}
```

### 3. Preserve User Context in Fallback
```typescript
const fallback = createFallbackScenario('Error', {
  strategy: userSelectedStrategy,
  instrument: userSelectedInstrument,
  timeframe: userSelectedTimeframe
});
```

### 4. Monitor Fallback Frequency
If fallback scenarios are frequent, investigate:
- AI prompt quality
- Model selection
- Image quality issues
- Schema requirements too strict

---

## Schema Updates

### Adding New Fields

1. Update schema in `src/lib/schemas.ts`:
```typescript
export const ScenarioAnalysisSchema = z.object({
  // ... existing fields
  newField: z.string().optional(), // Add new field
});
```

2. Update edge function validation
3. Update types in `src/lib/types.ts`
4. Test with both old and new data

### Making Fields Required

**⚠️ Breaking Change!**

```typescript
// Before
optionalField: z.string().optional()

// After
optionalField: z.string() // Now required
```

**Migration:**
1. Add field as optional first
2. Update AI prompts to include field
3. Verify all responses include field
4. Make field required in next release

---

## Performance Considerations

### Validation Overhead

- **Edge function:** ~2-5ms per validation
- **Client:** ~1-3ms per validation
- **Total:** Negligible compared to AI inference (5-20s)

### Optimization Tips

1. **Lazy validation:** Only validate when needed
2. **Cached schemas:** Zod compiles schemas once
3. **Partial validation:** Use for debugging only

---

## Future Enhancements

### Phase 3 Additions

- [ ] Historical validation success rate tracking
- [ ] Automated validation alerts (if fallback rate > 10%)
- [ ] Schema versioning for A/B testing
- [ ] Custom error messages per field
- [ ] Validation analytics dashboard

---

## Troubleshooting

### Problem: Constant Fallback Scenarios

**Diagnosis:**
```typescript
const result = validatePartialScenario(data);
console.log('Validation errors:', result.errors);
```

**Solutions:**
1. Check AI prompt completeness
2. Verify model is returning JSON
3. Check schema requirements
4. Review edge function logs

### Problem: Valid Data Rejected

**Diagnosis:**
- Check console for specific field errors
- Use `validatePartialScenario` to identify issue

**Solutions:**
1. Update schema to match reality
2. Add `.optional()` to fields
3. Use `.transform()` for type coercion

### Problem: Performance Degradation

**Check:**
- Validation time in logs
- Schema complexity
- Data size

**Solutions:**
- Simplify nested schemas
- Use `.strip()` to remove unknown fields
- Profile with `console.time()`

---

## Summary

✅ **Two-layer validation** (server + client)
✅ **Graceful fallbacks** for invalid data
✅ **Detailed error logging** for debugging
✅ **Type-safe** with TypeScript + Zod
✅ **Maintainable** with centralized schemas

---

**Last Updated:** January 29, 2026
**Part of:** Phase 2 - Robustness & Quality
**Related Files:**
- `src/lib/schemas.ts`
- `supabase/functions/analyze-chart/index.ts`
- `src/lib/api.ts`
