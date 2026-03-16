/**
 * @fileoverview `ValidatedFilesInterceptor` — multiple file upload factory.
 *
 * Like `ValidatedFileInterceptor` but handles an array of files
 * on a single field. Each file is validated independently.
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
 * Runs multer for multiple files as a Promise.
 *
 * @param req       - Express request
 * @param res       - Express response
 * @param fieldName - Form field name
 * @param maxSize   - Max size per file in bytes
 * @param maxFiles  - Max number of files allowed
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
 * Validates a single file against options. Used per-file inside the array loop.
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
 * Factory that creates a NestJS interceptor for **multiple** file uploads.
 *
 * @param fieldName - The multipart form field name (e.g. `'photos'`).
 * @param options   - Validation options (size limit, MIME types, image safety).
 * @param maxFiles  - Maximum number of files allowed per request. Default: `10`.
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
  @Injectable()
  class FilesInterceptorMixin implements NestInterceptor {
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
