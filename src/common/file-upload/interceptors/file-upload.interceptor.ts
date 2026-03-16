/**
 * @fileoverview `ValidatedFileInterceptor` — single file upload factory.
 *
 * Combines multer (memory storage) + content-type validation + image safety
 * into one reusable interceptor. Apply it with `@UseInterceptors(...)`.
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
 * Runs multer as a Promise so it can be awaited inside an interceptor.
 *
 * @param req       - Express request
 * @param res       - Express response
 * @param fieldName - Form field name
 * @param maxSize   - Max file size in bytes
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
 * Validates a single `Express.Multer.File` against the provided options.
 * Runs MIME magic-byte check first, then image safety checks if applicable.
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
 * Factory that creates a NestJS interceptor for a **single** file upload.
 *
 * @param fieldName - The multipart form field name (e.g. `'avatar'`).
 * @param options   - Validation options (size limit, MIME types, image safety).
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
  @Injectable()
  class FileInterceptorMixin implements NestInterceptor {
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
