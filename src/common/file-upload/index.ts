/**
 * @fileoverview Barrel module for the file-upload functionality.
 * This file provides a single entry point for importing file upload interceptors and types,
 * promoting cleaner imports and modular organization across the application.
 *
 * @example
 * ```ts
 * import { ValidatedFileInterceptor, ValidatedFilesInterceptor } from 'src/common/file-upload';
 * ```
 */
export { ValidatedFileInterceptor } from './interceptors/file-upload.interceptor';
export { ValidatedFilesInterceptor } from './interceptors/files-upload.interceptor';
export type {
  FileUploadOptions,
  ImageSafetyOptions,
} from './types/file-upload.types';
