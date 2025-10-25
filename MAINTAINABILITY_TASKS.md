# Maintainability Tasks

This file tracks prioritized maintainability improvements for the codebase.

## 1. Add Test Script to package.json

**Status:** Pending
**Priority:** High
**Effort:** Low

### Description
Tests exist but there's no `test` script defined in package.json, making testing less discoverable.

### Tasks
- [ ] Add `"test": "vitest"` to package.json scripts
- [ ] Add `"test:ui": "vitest --ui"` for UI mode
- [ ] Add `"test:run": "vitest run"` for CI mode (single run, no watch)
- [ ] Update CLAUDE.md to include test commands

---

## 2. Replace `any` Types with Specific Types

**Status:** Pending
**Priority:** High
**Effort:** Medium

### Description
Found `any` types in 14 files, which weakens type safety and hides potential bugs.

### Priority Files
- `src/hooks/usePostSubmission.ts`
- `src/components/admin/PostForm.tsx`
- `src/api/__tests__/mocks.ts`
- `src/api/__tests__/create-post-handler.test.ts`
- `src/api/__tests__/update-post-handler.test.ts`
- `src/api/__tests__/delete-post-handler.test.ts`
- `src/pages/api/create-post-handler.ts`
- `src/utils/content.test.ts`
- `src/pages/api/delete-post-handler.ts`
- `src/pages/api/update-post-handler.ts`
- `src/components/admin/FeedbackDisplay.test.tsx`
- `src/components/admin/FeedbackDisplay.tsx`
- `src/components/admin/CloseReadingAnalyzer.tsx`
- `src/utils/adminApiHelpers.ts`

### Tasks
- [ ] Create proper type definitions for API responses
- [ ] Type form event handlers properly
- [ ] Type test mocks with accurate interfaces
- [ ] Replace `any` in catch blocks with `unknown` or specific Error types
- [ ] Document any remaining justified `any` usages with comments

---

## 7. Standardize Error Handling Patterns

**Status:** Pending
**Priority:** High
**Effort:** Medium

### Description
Error handling exists but is inconsistent across API handlers and utilities.

### Tasks
- [ ] Create `src/utils/apiErrors.ts` with error response helpers
  - `createErrorResponse(message: string, status: number, details?: any)`
  - `createSuccessResponse<T>(data: T, message?: string)`
  - Standard error response type: `{ error: string, details?: any, status: number }`
- [ ] Update all API handlers to use standardized error responses
  - `/api/create-post-handler.ts`
  - `/api/update-post-handler.ts`
  - `/api/delete-post-handler.ts`
- [ ] Ensure client-side error handling can parse uniform error structure
- [ ] Add error response type to `src/types/admin.d.ts`

---

## 10. Remove package-lock.json

**Status:** Pending
**Priority:** Medium
**Effort:** Low

### Description
Both `package-lock.json` and `pnpm-lock.yaml` exist, which can cause dependency conflicts.

### Tasks
- [ ] Delete `package-lock.json` from repository
- [ ] Add `package-lock.json` to `.gitignore`
- [ ] Verify pnpm lockfile is up to date: `pnpm install`
- [ ] Document in README/INSTALL.md that this project uses pnpm only

---

## 12. Configure Pre-commit Hooks

**Status:** Pending
**Priority:** Medium
**Effort:** Medium

### Description
No git hooks to prevent bad commits. Pre-commit checks improve code quality.

### Tasks
- [ ] Install Husky: `pnpm add -D husky`
- [ ] Install lint-staged: `pnpm add -D lint-staged`
- [ ] Initialize Husky: `pnpm exec husky init`
- [ ] Configure `.husky/pre-commit` to run lint-staged
- [ ] Add lint-staged config to package.json:
  ```json
  "lint-staged": {
    "*.{js,cjs,mjs,ts,tsx,astro}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.{md,json,yaml,yml}": ["prettier --write"]
  }
  ```
- [ ] Test pre-commit hook with intentional linting error
- [ ] Document setup in README/INSTALL.md

---

## 13. Add Error Handling to Image Processing Script

**Status:** Pending
**Priority:** Medium
**Effort:** Low

### Description
`scripts/process-images.mjs` lacks try-catch blocks and graceful error handling.

### Tasks
- [ ] Wrap main processing logic in try-catch
- [ ] Check if `images/originals/` directory exists before processing
- [ ] Handle corrupted/invalid image files gracefully
- [ ] Handle Sharp processing failures with meaningful error messages
- [ ] Add permission error handling
- [ ] Log which images succeeded and which failed
- [ ] Exit with proper exit code (0 = success, 1 = error)

---

## 14. Improve API Handler Error Responses

**Status:** Pending
**Priority:** High
**Effort:** Low

### Description
Inconsistent error response formats make client-side error handling difficult.

### Related to Task #7

### Tasks
- [ ] Ensure all error responses follow format: `{ error: string, details?: any, status?: number }`
- [ ] All success responses follow format: `{ message: string, data?: any, ...otherFields }`
- [ ] Update `usePostSubmission.ts` to handle standardized error format
- [ ] Add proper HTTP status codes to all responses (400, 404, 500, etc.)
- [ ] Test error scenarios:
  - Missing required fields
  - Invalid slug
  - File system errors
  - Validation failures

---

## 15. Extract Hardcoded Values to Environment Variables (Remark42 Cleanup)

**Status:** Pending
**Priority:** Medium
**Effort:** Low

### Description
Remark42 configuration and other hardcoded values should be centralized and configurable.

### Tasks
- [ ] Create `.env.example` with all available configuration options
- [ ] Extract Remark42 configuration from `Remark42Comments.astro`:
  - `REMARK42_HOST`
  - `REMARK42_SITE_ID`
  - Any other Remark42 settings
- [ ] Update `src/siteConfig.ts` to read from environment variables with fallbacks
- [ ] Extract `AUTHOR_NAME` to env var: `AUTHOR_NAME` or `SITE_AUTHOR`
- [ ] Extract site URL to support `.env` override
- [ ] Document all environment variables in:
  - `.env.example`
  - `INSTALL.md`
  - `CLAUDE.md`
- [ ] Add validation for required environment variables

---

## 16. Add Validation Schemas for API Payloads

**Status:** Pending
**Priority:** High
**Effort:** Medium

### Description
Currently using manual validation in API handlers. Zod is already a dependency and should be used for runtime validation.

### Tasks
- [ ] Create `src/schemas/api.ts` with Zod schemas for:
  - `CreatePostPayloadSchema`
  - `UpdatePostPayloadSchema`
  - `DeletePostPayloadSchema`
- [ ] Create `src/schemas/responses.ts` for response validation
- [ ] Update API handlers to validate incoming payloads:
  ```typescript
  const validatedPayload = CreatePostPayloadSchema.parse(payload);
  ```
- [ ] Return proper validation errors (400 status) with field-level details
- [ ] Consider sharing schemas between frontend and backend for type inference
- [ ] Add tests for schema validation (valid and invalid payloads)

---

## 17. Create Utility for Image Path Resolution

**Status:** Pending
**Priority:** Low
**Effort:** Low

### Description
Image path logic is duplicated across components and utilities.

### Tasks
- [ ] Create `src/utils/imagePaths.ts` with functions:
  - `getOriginalImagePath(imageName: string): string`
  - `getProcessedImagePath(imageName: string, width: number, format: 'webp' | 'jpg'): string`
  - `getPublicImageUrl(imageName: string, width: number, format: 'webp' | 'jpg'): string`
  - `IMAGE_WIDTHS` constant export: `[100, 150, 200, 480, 800, 1200, 1600, 1920]`
- [ ] Update components to use utility functions:
  - `ResponsiveImage.astro`
  - `adminApiHelpers.ts`
- [ ] Update `scripts/process-images.mjs` to import `IMAGE_WIDTHS` constant
- [ ] Add JSDoc comments with usage examples
- [ ] Add unit tests for path resolution functions

---

## Progress Tracking

- **Total Tasks:** 10
- **Completed:** 0
- **In Progress:** 0
- **Pending:** 10

**High Priority:** 1, 2, 7, 14, 16
**Medium Priority:** 10, 12, 13, 15
**Low Priority:** 17

## Notes

- Tasks are listed in the order specified by the user
- Some tasks are interconnected (e.g., 7 and 14)
- Consider tackling high-priority items first for maximum impact
- Low-effort tasks (1, 10, 13, 15, 17) can be completed quickly
