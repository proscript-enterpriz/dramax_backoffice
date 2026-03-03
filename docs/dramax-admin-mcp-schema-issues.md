# Dramax Admin MCP Schema Generation Issues

**Date**: 2026-03-03  
**Issue**: Missing enum types in generated schemas from OpenAPI specification

---

## Executive Summary

The `dramax_admin` MCP tool generates TypeScript/Zod schemas from our OpenAPI specification, but it **fails to preserve enum constraints** for certain fields. This results in less type-safe code that accepts any string value instead of validating against a specific set of allowed values.

---

## Problem Details

### Issue: Language Enum Not Generated

The OpenAPI specification defines `StreamCaption.language` with an enum of 39 specific language codes:

**OpenAPI Schema (Correct)**:
```json
{
  "language": {
    "anyOf": [
      {
        "type": "string",
        "enum": [
          "en", "zh-CN", "ko", "ru", "zh", "zh-TW", "ja", 
          "es", "fr", "de", "it", "pt", "pt-BR", "nl", 
          "sv", "no", "da", "fi", "pl", "cs", "hu", "ro", 
          "bg", "el", "tr", "uk", "he", "ar", "fa", "hi", 
          "bn", "pa", "gu", "ur", "vi", "id", "ms", "th"
        ]
      },
      { "type": "null" }
    ]
  }
}
```

**Generated Schema (Incorrect)**:
```typescript
export const streamCaptionSchema = z.object({
  language: z.string().nullable(),  // ❌ Should be enum, not generic string
  label: z.string().nullable(),
  generated: z.boolean().nullable(),
  status: z.enum(['ready', 'inprogress', 'error']).nullable(),
});
```

Notice that `status` enum **IS** correctly generated, but `language` enum is **NOT**.

---

## Impact Analysis

### ❌ What We Lose

| Issue | Impact |
|-------|--------|
| **No Type Safety** | Any string is accepted, including invalid language codes like `"invalid"` or `"xyz"` |
| **No IDE Autocomplete** | Developers must manually look up valid language codes |
| **Runtime Errors** | Invalid language codes only fail at API call time, not at compile time |
| **No Validation** | Zod validation passes for any string, allowing bugs to slip through |
| **Maintenance Burden** | Language codes are not centralized, requiring manual updates in multiple places |

### ✅ What We Should Have

```typescript
// Correct implementation (manually added)
export const captionLanguageSchema = z.enum([
  'en', 'zh-CN', 'ko', 'ru', 'zh', 'zh-TW', 'ja', 'es', 
  'fr', 'de', 'it', 'pt', 'pt-BR', 'nl', 'sv', 'no', 
  'da', 'fi', 'pl', 'cs', 'hu', 'ro', 'bg', 'el', 'tr', 
  'uk', 'he', 'ar', 'fa', 'hi', 'bn', 'pa', 'gu', 'ur', 
  'vi', 'id', 'ms', 'th'
]);

export type CaptionLanguageType = z.infer<typeof captionLanguageSchema>;

export const streamCaptionSchema = z.object({
  language: captionLanguageSchema.nullable(), // ✅ Type-safe enum
  label: z.string().nullable(),
  generated: z.boolean().nullable(),
  status: z.enum(['ready', 'inprogress', 'error']).nullable(),
});
```

---

## Affected Schemas

### Currently Affected

| Schema Name | Field | OpenAPI Has Enum? | Generated Correctly? |
|-------------|-------|-------------------|----------------------|
| `StreamCaption` | `language` | ✅ Yes (39 values) | ❌ No - plain string |
| `StreamCaption` | `status` | ✅ Yes (3 values) | ✅ Yes - enum |
| `CaptionResponse` | `language` | ❌ No | N/A - plain string |
| `CaptionInfo` | `language` | ❌ No | N/A - plain string |

### Analysis

The MCP tool **correctly generates enums** for some fields (like `status`) but **fails for others** (like `language`). This inconsistency suggests:

1. **Bug in MCP enum detection logic** - Possibly fails with larger enum arrays (39 values vs 3)
2. **anyOf handling issue** - The `language` field uses `anyOf` with enum + null, which might confuse the generator
3. **Inconsistent OpenAPI spec** - Some schemas define `language` without enum (CaptionResponse, CaptionInfo)

---

## Root Cause Hypothesis

### Theory 1: anyOf Pattern Not Fully Supported
```json
// This pattern might not be handled correctly
"language": {
  "anyOf": [
    { "type": "string", "enum": [...] },  // ← Complex nested structure
    { "type": "null" }
  ]
}
```

The MCP tool may only handle simple enum patterns like:
```json
"status": { "enum": ["ready", "inprogress", "error"] }
```

### Theory 2: Enum Size Threshold
- Small enums (3 values): ✅ Generated correctly
- Large enums (39 values): ❌ Converted to string

There might be a hardcoded threshold or performance optimization that skips large enums.

### Theory 3: Backend Inconsistency
The backend OpenAPI generator (FastAPI) defines `language` differently across schemas:
- `StreamCaption`: Has enum constraint
- `CaptionResponse`: No enum constraint (just `"type": "string"`)
- `CaptionInfo`: No enum constraint (just `"type": "string"`)

This suggests the **backend models themselves are inconsistent**.

---

## Comparison with Other Fields

### ✅ Working Enum Generation

```json
// OpenAPI
"status": {
  "type": "string",
  "enum": ["ready", "inprogress", "error"]
}

// Generated (Correct)
status: z.enum(['ready', 'inprogress', 'error'])
```

### ❌ Broken Enum Generation

```json
// OpenAPI
"language": {
  "anyOf": [
    { "type": "string", "enum": ["en", "zh-CN", ...] },
    { "type": "null" }
  ]
}

// Generated (Incorrect)
language: z.string().nullable()
```

---

## Recommendations

### 1. Fix Backend OpenAPI Spec (Priority: HIGH)
Ensure consistent enum definitions across all caption-related schemas:

```python
# backend/models/caption.py (example)
class LanguageCode(str, Enum):
    EN = "en"
    ZH_CN = "zh-CN"
    # ... all 39 languages

class CaptionResponse(BaseModel):
    language: LanguageCode  # ✅ Use enum everywhere
    label: str
    generated: bool
    status: CaptionStatus

class StreamCaption(BaseModel):
    language: Optional[LanguageCode] = None  # ✅ Consistent enum usage
    label: Optional[str] = None
    generated: Optional[bool] = None
    status: Optional[CaptionStatus] = None
```

### 2. Fix MCP Tool (Priority: MEDIUM)
Update the `dramax_admin` MCP code generator to handle:
- `anyOf` patterns with enum + null
- Large enum arrays (>10 values)
- Nested enum structures

### 3. Manual Workaround (Priority: IMMEDIATE - ✅ DONE)
We've already implemented this by:
- Creating `captionLanguageSchema` as a reusable enum
- Updating `videoCaptionResponseSchema` to use the enum
- Updating `streamCaptionSchema` to use the enum

### 4. Add Validation Tests (Priority: MEDIUM)
Create tests to catch schema generation issues:

```typescript
describe('Schema Generation Validation', () => {
  it('should generate enums for language fields', () => {
    const result = streamCaptionSchema.safeParse({
      language: 'invalid-code', // Should fail
      label: 'Test',
      generated: false,
      status: 'ready'
    });
    
    expect(result.success).toBe(false);
  });
  
  it('should accept valid language codes', () => {
    const result = streamCaptionSchema.safeParse({
      language: 'en',
      label: 'English',
      generated: true,
      status: 'ready'
    });
    
    expect(result.success).toBe(true);
  });
});
```

---

## Action Items

- [ ] **Backend Team**: Review and fix OpenAPI spec consistency for caption language fields
- [ ] **Frontend Team**: Continue using manual `captionLanguageSchema` until MCP is fixed
- [ ] **DevOps Team**: Report bug to dramax_admin MCP maintainers with reproduction case
- [ ] **QA Team**: Add schema validation tests to catch future regressions
- [ ] **All Teams**: Document any other fields with similar enum issues

---

## Conclusion

The `dramax_admin` MCP tool has limitations in generating Zod schemas from complex OpenAPI enum patterns, particularly:
1. **anyOf with enum + null patterns**
2. **Large enum arrays (39+ values)**
3. **Inconsistent backend schema definitions**

**Immediate solution**: Manual schema definitions (already implemented)  
**Long-term solution**: Fix backend consistency + improve MCP enum detection logic

---

## References

- OpenAPI Spec: `http://localhost:8000/api/v1/openapi.json`
- Current Schema File: `/services/schema.ts`
- MCP Configuration: `/nextjs-service-gen.config.json`
- Related Issue: Caption language type safety (2026-03-03)
