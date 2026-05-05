/**
 * @fileoverview Auth interfaces and types.
 * This file defines the shape of the auth resource as returned by the API.
 */

/** User info in login response */
export type UserPayload = {
  /** User email. */
  email: string;
  /** User full name. */
  fullName: string;
  /** User role. */
  role: string;
};

/**
 * Represents the data structure for a login response.
 */
export type LoginResponseDto = {
  /** The access token (Redis key). */
  access_token: string;
  /** The user payload. */
  user: UserPayload;
};
