/**
 * @fileoverview Cat interfaces and types.
 * This file defines the shape of the cat resource as returned by the API.
 */

/**
 * Represents the data structure for a cat response.
 */
export type GetCatResponseDto = {
  /** The name of the cat. */
  name: string;
  /** The breed of the cat. */
  breed: string;
};
