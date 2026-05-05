/**
 * @fileoverview English locale — system/infrastructure messages.
 *
 * ── Authoring contract ───────────────────────────────────────────────────────
 *  - All values must be plain strings (`as const`).
 *  - Group keys by infrastructure component with a comment block.
 *  - Keys must exactly match {@link SystemMessageMap} in messages/system.messages.ts.
 *  - To add a key: add here → add to bn/system.ts → done.
 *
 * @module i18n/locales/en/system
 */
export const SYSTEM_EN = {
  // Validation pipe (top-level labels)
  VALIDATION_FAILED: 'Validation failed',
  BULK_VALIDATION_FAILED: 'Bulk validation failed',
  BODY_MUST_BE_ARRAY: 'Request body must be an array',
  BODY_MUST_NOT_BE_EMPTY: 'Request body must contain at least one payload',

  // Throttle guard
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
  DEVICE_ID_MISSING:
    'Device identifier missing — x-device-id header is required',
  THROTTLE_IDENTIFIER_MISSING: 'Required identifier for throttling is missing',

  // JWT guard
  AUTH_HEADER_MISSING: 'Authorization header is missing or malformed',
  SESSION_EXPIRED: 'Session expired or invalid token',
  INVALID_TOKEN: 'Invalid or expired token',

  // Roles guard
  ROLE_NOT_FOUND: 'User role not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',

  // Generic HTTP
  PATH_NOT_FOUND: 'Path not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
} as const;
