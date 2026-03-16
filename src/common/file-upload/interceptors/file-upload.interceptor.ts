/**
 * @fileoverview Interceptor factory for handling single file uploads in the NestJS application.
 * It combines Multer with custom validation for MIME types (via magic bytes) and image safety
 * (preventing pixel floods, image bombs, etc.).
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

/** Default maximum file size: 5 MB. */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/**
 * Executes Multer to process a single file upload as a Promise.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param fieldName - The name of the multipart form field containing the file.
 * @param maxSize - The maximum allowed file size in bytes.
 * @returns A Promise that resolves when the upload is complete or rejects on error.
 * @throws PayloadTooLargeException if the file exceeds the size limit.
 * @throws BadRequestException if another upload error occurs.
 */
function runMulter(
  req: Request,
  res: Response,
  fieldName: string,
  maxSize: number,
): Promise<void> {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxSize },
  }).single(fieldName);

  return new Promise((resolve, reject) => {
    upload(req, res, (err: unknown) => {
      if (!err) return resolve();

      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return reject(
          new PayloadTooLargeException(
            `File exceeds the maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)} MB.`,
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
 * This includes checking magic bytes for MIME types and pixel safety for images.
 *
 * @param file - The file object provided by Multer.
 * @param options - The validation options to apply.
 * @throws BadRequestException if validation fails for MIME type or image safety.
 */
function validateFile(
  file: Express.Multer.File,
  options: FileUploadOptions,
): void {
  // 1 — MIME / magic-bytes validation
  if (options.allowedMimeTypes?.length) {
    validateMimeType(file, options.allowedMimeTypes);
  }

  // 2 — Image safety checks (Pixel Flood, Image Bomb, Decompression Bomb)
  if (file.mimetype.startsWith('image/')) {
    validateImageSafety(file.buffer, file.size, options.image);
  }
}

/**
 * Factory that creates a NestJS interceptor for handling a **single** file upload.
 *
 * @param fieldName - The multipart form field name (e.g., 'avatar').
 * @param options - Validation options including size limits, allowed MIME types, and image safety.
 * @returns A dynamically created interceptor class.
 *
 * @example
 * ```ts
 * @Post('avatar')
 * @UseInterceptors(ValidatedFileInterceptor('avatar', {
 *   maxSizeBytes: 2 * 1024 * 1024,
 *   allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
 *   image: { maxWidth: 4096, maxHeight: 4096 },
 * }))
 * async uploadAvatar(@UploadedFile() file: Express.Multer.File) { ... }
 * ```
 */
export function ValidatedFileInterceptor(
  fieldName: string,
  options: FileUploadOptions = {},
) {
  /**
   * Internal interceptor class that handles the single file upload logic.
   */
  @Injectable()
  class FileInterceptorMixin implements NestInterceptor {
    /**
     * Intercepts the request to process a single file upload and validate its content.
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

      // Parse the multipart upload
      await runMulter(req, res, fieldName, maxSize);

      // Validate the uploaded file
      if (req.file) {
        validateFile(req.file, options);
      }

      return next.handle();
    }
  }

  return mixin(FileInterceptorMixin);
}
