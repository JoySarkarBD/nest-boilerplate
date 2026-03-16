/**
 * @fileoverview Public API barrel for the file-upload module.
 * Import everything from here instead of individual paths.
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
