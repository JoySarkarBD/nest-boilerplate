/**
 * @fileoverview Configuration types for the file upload interceptor system.
 * These interfaces define the validation rules and safety thresholds
 * used by the file upload decorators.
 */

/** Image attack-prevention thresholds. */
export interface ImageSafetyOptions {
  /** Max allowed width in pixels. Default: `8192`. */
  maxWidth?: number;
  /** Max allowed height in pixels. Default: `8192`. */
  maxHeight?: number;
  /** Max total pixel count (width × height). Default: `20_000_000` (20 MP). */
  maxPixels?: number;
  /**
   * Max ratio of raw uncompressed pixel data size to actual file size.
   * A very small file claiming huge dimensions signals a decompression bomb.
   * Default: `50`.
   */
  maxDecompressionRatio?: number;
}

/** Options accepted by both single and multi-file upload interceptors. */
export interface FileUploadOptions {
  /** Max file size in bytes. Default: `5 * 1024 * 1024` (5 MB). */
  maxSizeBytes?: number;
  /**
   * Allowed MIME types checked against actual magic bytes — not the file extension.
   * Example: `['image/jpeg', 'image/png', 'application/pdf']`.
   * Leave empty to allow any type (not recommended).
   */
  allowedMimeTypes?: string[];
  /**
   * Image-specific safety options. Applied automatically when the MIME type
   * starts with `image/`.
   */
  image?: ImageSafetyOptions;
}
