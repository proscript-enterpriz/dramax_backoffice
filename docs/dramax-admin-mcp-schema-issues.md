# Dramax Admin MCP Schema Generation Issues

**Date**: 2026-03-03  
**Issue**: Incorrect schema generation from OpenAPI specification

---

## Executive Summary

The `dramax_admin` MCP tool generates TypeScript/Zod schemas from our OpenAPI specification, but it has **multiple critical issues**:
1. **Incorrect field names and structures** - Wrapping flat schemas in nested objects
2. **Wrong field types** - Converting integers to strings
3. **Missing enum constraints** - Converting enums to plain strings  
4. **Adding non-existent fields** - Fields that don't exist in OpenAPI spec
5. **Missing required fields** - Omitting fields from OpenAPI spec

These issues result in schemas that don't match the actual API responses, causing runtime errors and type mismatches.

---

## Problem Details

### Issue 1: SignedUrlResponse - Completely Wrong Structure

**OpenAPI Schema (Correct)**:
```json
{
  "properties": {
    "success": { "type": "boolean" },
    "token": { "type": "string" },
    "iframe_url": { "type": "string" },
    "hls_url": { "type": "string" },
    "dash_url": { "type": "string" },
    "thumbnail_url": { "type": "string" }
  },
  "required": ["success", "token", "iframe_url", "hls_url", "dash_url", "thumbnail_url"]
}
```

**Generated Schema (WRONG)**:
```typescript
export const signedUrlResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    signed_url: z.string(),      // ❌ Should be at top level, not nested
    token: z.string().optional(), // ❌ Should be required, not optional
  }),
  message: z.string().optional(),  // ❌ Doesn't exist in OpenAPI
});
```

**What's Wrong:**
- ❌ Wraps URLs in a `data` object that doesn't exist in OpenAPI
- ❌ Missing 5 required fields: `iframe_url`, `hls_url`, `dash_url`, `thumbnail_url`, and proper `token`
- ❌ Adds non-existent `message` field
- ❌ Invents a `signed_url` field that doesn't exist (should be separate URL fields)
- ❌ Makes `token` optional when it's required

### Issue 2: UploadTokenRequest - Wrong Field Type

**OpenAPI Schema (Correct)**:
```json
{
  "properties": {
    "upload_length": { "type": "integer" },  // ← INTEGER
    "upload_meta": { "type": "string" }
  },
  "required": ["upload_length", "upload_meta"]
}
```

**Generated Schema (WRONG)**:
```typescript
export const uploadTokenRequestSchema = z.object({
  upload_length: z.string(),  // ❌ Should be z.number().int() not string
  upload_meta: z.string(),
});
```

**What's Wrong:**
- ❌ `upload_length` is defined as `string` but OpenAPI says `integer`
- This will cause validation errors when sending numbers

### Issue 3: UploadUrlResponse - Wrong Field Types & Extra Field

**OpenAPI Schema (Correct)**:
```json
{
  "properties": {
    "success": { "type": "boolean" },
    "upload_url": { 
      "anyOf": [{ "type": "string" }, { "type": "null" }]
    },
    "video_id": { 
      "anyOf": [{ "type": "string" }, { "type": "null" }]
    }
  },
  "required": ["success", "upload_url", "video_id"]
}
```

**Generated Schema (WRONG)**:
```typescript
export const uploadUrlResponseSchema = z.object({
  success: z.boolean(),
  upload_url: z.string(),           // ❌ Should be nullable
  video_id: z.string(),             // ❌ Should be nullable
  internal_id: z.string().optional(), // ❌ Doesn't exist in OpenAPI!
});
```

**What's Wrong:**
- ❌ `upload_url` should be `z.string().nullable()` not `z.string()`
- ❌ `video_id` should be `z.string().nullable()` not `z.string()`
- ❌ Adds `internal_id` field that **doesn't exist** in OpenAPI spec

### Issue 4: CaptionResponse - Completely Different Structure

**OpenAPI Schema (Correct)**:
```json
{
  "properties": {
    "language": { "type": "string" },
    "label": { "type": "string" },
    "generated": { "type": "boolean" },
    "status": { 
      "type": "string",
      "enum": ["ready", "inprogress", "error"]
    }
  },
  "required": ["language", "label", "generated", "status"],
  "description": "Response containing caption information"
}
```

**Generated Schema (WRONG)**:
```typescript
export const captionResponseSchema = z.object({
  success: z.boolean(),           // ❌ Doesn't exist in OpenAPI
  data: streamCaptionSchema,      // ❌ Wrong! Should be flat, not nested
  message: z.string().optional(), // ❌ Doesn't exist in OpenAPI
});
```

**What's Wrong:**
- ❌ Wraps actual caption fields in a `data` object that doesn't exist
- ❌ Adds non-existent `success` and `message` fields
- ❌ Missing all actual required fields: `language`, `label`, `generated`, `status`
- ❌ Uses `streamCaptionSchema` (which has nullable fields) instead of the actual non-nullable schema

### Issue 5: StreamCaption - Missing Language Enum

**OpenAPI Schema (Correct)**:
```json
{
  "language": {
    "anyOf": [
      {
        "type": "string",
        "enum": ["en", "zh-CN", "ko", "ru", "zh", "zh-TW", "ja", 
                 "es", "fr", "de", "it", "pt", "pt-BR", "nl", "sv", 
                 "no", "da", "fi", "pl", "cs", "hu", "ro", "bg", "el", 
                 "tr", "uk", "he", "ar", "fa", "hi", "bn", "pa", "gu", 
                 "ur", "vi", "id", "ms", "th"]
      },
      { "type": "null" }
    ]
  }
}
```

**Generated Schema (WRONG - before our fix)**:
```typescript
export const streamCaptionSchema = z.object({
  language: z.string().nullable(),  // ❌ Should be enum, not generic string
  label: z.string().nullable(),
  generated: z.boolean().nullable(),
  status: z.enum(['ready', 'inprogress', 'error']).nullable(), // ✅ This one works!
});
```

**What's Wrong:**
- ❌ Converts 39-value enum to plain string
- ✅ Correctly handles `status` enum (3 values)
- Inconsistent handling of enums based on size or structure

---

## Impact Analysis

### Critical Issues Summary

| Schema | Issue Type | Severity | Impact |
|--------|-----------|----------|--------|
| `SignedUrlResponse` | Wrong structure | 🔴 CRITICAL | **Complete data loss** - Missing 5 required URL fields |
| `UploadTokenRequest` | Wrong type | 🟡 HIGH | Type mismatch - numbers sent as strings fail validation |
| `UploadUrlResponse` | Missing nullable + extra field | 🟡 HIGH | Null values cause crashes, extra field confuses code |
| `CaptionResponse` | Wrong structure | 🔴 CRITICAL | **All fields missing** - Wrapped in non-existent `data` object |
| `StreamCaption.language` | Missing enum | 🟠 MEDIUM | No type safety, accepts invalid language codes |

### Real-World Consequences

#### 1. SignedUrlResponse Failures
```typescript
// API returns this:
{
  success: true,
  token: "abc123",
  iframe_url: "https://...",
  hls_url: "https://...",
  dash_url: "https://...",
  thumbnail_url: "https://..."
}

// But our schema expects this:
{
  success: true,
  data: {
    signed_url: "...",  // Doesn't exist!
    token: "..."
  },
  message: "..."  // Doesn't exist!
}

// Result: Cannot access iframe_url, hls_url, dash_url, thumbnail_url
// ❌ Video player cannot load!
```

#### 2. UploadTokenRequest Failures
```typescript
// Code sends:
{ upload_length: 1024000, upload_meta: "..." }  // number

// Schema validates:
{ upload_length: "1024000", upload_meta: "..." }  // string expected

// Result: ❌ API rejects request with type error
```

#### 3. CaptionResponse Failures
```typescript
// API returns:
{
  language: "en",
  label: "English",
  generated: true,
  status: "ready"
}

// But schema expects:
{
  success: true,
  data: { language: "en", ... },
  message: "..."
}

// Result: ❌ Cannot access language, label, generated, status directly
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

## Root Cause Analysis

### Pattern Detection

The MCP tool appears to have a **broken response wrapper detection** logic:

#### Theory 1: Over-aggressive Response Wrapping
The tool seems to **assume all responses** follow a generic wrapper pattern:
```typescript
{
  success: boolean,
  data: T,
  message?: string
}
```

Even when the OpenAPI spec clearly shows a **flat structure**, the generator wraps it unnecessarily.

**Evidence:**
- `SignedUrlResponse` - Flat in OpenAPI, wrapped in generated code
- `CaptionResponse` - Flat in OpenAPI, wrapped in generated code
- Both have invented `success` and `message` fields

#### Theory 2: Type Conversion Bugs
The tool has **incorrect type mappings**:

```
OpenAPI "integer" → z.string()  ❌ WRONG
OpenAPI "integer" → z.number().int()  ✅ CORRECT
```

**Evidence:**
- `UploadTokenRequest.upload_length` is `integer` in OpenAPI but `z.string()` in generated code

#### Theory 3: Nullable Detection Failure
The tool **ignores `anyOf` nullable patterns**:

```json
"anyOf": [
  { "type": "string" },
  { "type": "null" }
]
```

Generated as `z.string()` instead of `z.string().nullable()`.

**Evidence:**
- `UploadUrlResponse.upload_url` and `video_id` should be nullable but aren't

#### Theory 4: Enum Size Threshold
Large enums (39+ values) are **converted to plain strings**:

```
Small enum (3 values) → z.enum([...])  ✅ Works
Large enum (39 values) → z.string()     ❌ Fails
```

**Evidence:**
- `StreamCaption.status` (3 values) → Correctly generates enum
- `StreamCaption.language` (39 values) → Incorrectly generates string

#### Theory 5: Schema Field Invention
The tool **adds fields that don't exist** in the OpenAPI spec:

**Evidence:**
- `internal_id` added to `UploadUrlResponse` (not in OpenAPI)
- `success` and `message` added to `SignedUrlResponse` (not in OpenAPI)
- `success` and `message` added to `CaptionResponse` (not in OpenAPI)

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
