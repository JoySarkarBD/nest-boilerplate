/**
 * @fileoverview Interceptor factory for handling multiple file uploads in the NestJS application.
 * It integrates Multer for multipart form-data processing and provides custom validation
 * for MIME types and image safety.
 */
import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
  mixin,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import multer from 'multer';
import type { Request, Response } from 'express';
import { FileUploadOptions } from '../types/file-upload.types';
import { validateMimeType } from '../utils/magic-bytes.util';
import { validateImageSafety } from '../utils/image-safety.util';

/** Default maximum file size: 5 MB per file. */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/** Default maximum number of files per request. */
const DEFAULT_MAX_FILES = 10;

/**
 * Executes Multer to process an array of files as a Promise.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param fieldName - The name of the multipart form field containing the files.
 * @param maxSize - The maximum allowed size for each file in bytes.
 * @param maxFiles - The maximum number of files allowed in the request.
 * @returns A Promise that resolves when the upload is complete or rejects on error.
 * @throws PayloadTooLargeException if a file exceeds the size limit.
 * @throws BadRequestException if the file count exceeds the limit or another upload error occurs.
 */
function runMulterArray(
  req: Request,
  res: Response,
  fieldName: string,
  maxSize: number,
  maxFiles: number,
): Promise<void> {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize, files: maxFiles },
  }).array(fieldName, maxFiles);

  return new Promise((resolve, reject) => {
    upload(req, res, (err: unknown) => {
      if (!err) return resolve();

      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return reject(
          new PayloadTooLargeException(
            `One or more files exceed the maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)} MB.`,
          ),
        );
      }
      if (
        err instanceof multer.MulterError &&
        err.code === 'LIMIT_FILE_COUNT'
      ) {
        return reject(
          new BadRequestException(
            `Too many files. Maximum allowed: ${maxFiles}.`,
          ),
        );
      }
      reject(
        new BadRequestException(
          (err as Error)?.message ?? 'File upload failed.',
        ),
      );
    });
  });
}

/**
 * Validates an individual file against the provided options.
 *
 * @param file - The file object provided by Multer.
 * @param options - The validation options to apply to the file.
 * @throws BadRequestException if validation fails for MIME type or image safety.
 */
function validateFile(
  file: Express.Multer.File,
  options: FileUploadOptions,
): void {
  if (options.allowedMimeTypes?.length) {
    validateMimeType(file, options.allowedMimeTypes);
  }

  if (file.mimetype.startsWith('image/')) {
    validateImageSafety(file.buffer, file.size, options.image);
  }
}

/**
 * Factory that creates a NestJS interceptor for handling **multiple** file uploads.
 *
 * @param fieldName - The multipart form field name (e.g., 'photos').
 * @param options - Validation options including size limits, allowed MIME types, and image safety.
 * @param maxFiles - Maximum number of files allowed per request. Defaults to 10.
 * @returns A dynamically created interceptor class.
 *
 * @example
 * ```ts
 * @Post('gallery')
 * @UseInterceptors(ValidatedFilesInterceptor('photos', {
 *   maxSizeBytes: 5 * 1024 * 1024,
 *   allowedMimeTypes: ['image/jpeg', 'image/png'],
 *   image: { maxPixels: 10_000_000 },
 * }, 5))
 * async upload(@UploadedFiles() files: Express.Multer.File[]) { ... }
 * ```
 */
export function ValidatedFilesInterceptor(
  fieldName: string,
  options: FileUploadOptions = {},
  maxFiles = DEFAULT_MAX_FILES,
) {
  /**
   * Internal interceptor class that implements the multiple file upload logic.
   */
  @Injectable()
  class FilesInterceptorMixin implements NestInterceptor {
    /**
     * Intercepts the request to handle multiple file uploads and perform validation.
     *
     * @param context - The execution context of the request.
     * @param next - The next handler in the request lifecycle.
     * @returns An observable that continues the request processing.
     */
    async intercept(
      context: ExecutionContext,
      next: CallHandler,
    ): Promise<Observable<any>> {
      const req = context.switchToHttp().getRequest<Request>();
      const res = context.switchToHttp().getResponse<Response>();
      const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;

      // Parse the multipart upload (array)
      await runMulterArray(req, res, fieldName, maxSize, maxFiles);

      // Validate each uploaded file individually
      const files = (req.files as Express.Multer.File[]) ?? [];
      for (const file of files) {
        validateFile(file, options);
      }

      return next.handle();
    }
  }

  return mixin(FilesInterceptorMixin);
}
