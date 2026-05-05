/**
 * @fileoverview Interceptor factory for handling multiple file uploads in the NestJS application using Fastify.
 * It uses @fastify/multipart for multipart form-data processing and provides custom validation
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
import type { FastifyRequest } from 'fastify';
import { FileUploadOptions, UploadedFile } from '../types/file-upload.types';
import { validateMimeType } from '../utils/magic-bytes.util';
import { validateImageSafety } from '../utils/image-safety.util';

/** Default maximum file size: 5 MB per file. */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/** Default maximum number of files per request. */
const DEFAULT_MAX_FILES = 10;

/**
 * Validates an individual file against the provided options.
 *
 * @param file - The file object.
 * @param options - The validation options to apply to the file.
 * @throws BadRequestException if validation fails for MIME type or image safety.
 */
function validateFile(file: UploadedFile, options: FileUploadOptions): void {
  if (options.allowedMimeTypes?.length) {
    validateMimeType(file, options.allowedMimeTypes);
  }

  if (file.mimetype.startsWith('image/')) {
    validateImageSafety(file.buffer, file.size, options.image);
  }
}

/**
 * Factory that creates a NestJS interceptor for handling **multiple** file uploads with Fastify.
 *
 * @param fieldName - The multipart form field name (e.g., 'photos').
 * @param options - Validation options including size limits, allowed MIME types, and image safety.
 * @param maxFiles - Maximum number of files allowed per request. Defaults to 10.
 * @returns A dynamically created interceptor class.
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
      const req = context.switchToHttp().getRequest<FastifyRequest>();
      const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;

      if (!req.isMultipart()) {
        throw new BadRequestException('Request is not multipart/form-data');
      }

      const files: UploadedFile[] = [];
      const parts = req.files({
        limits: { fileSize: maxSize, files: maxFiles },
      });

      try {
        for await (const part of parts) {
          if (part.type !== 'file') {
            continue;
          }

          if (part.fieldname !== fieldName) {
            continue; // Skip fields with different names if any
          }

          if (files.length >= maxFiles) {
            throw new BadRequestException(
              `Too many files. Maximum allowed: ${maxFiles}.`,
            );
          }

          const buffer = await part.toBuffer();

          if (buffer.length > maxSize) {
            throw new PayloadTooLargeException(
              `One or more files exceed the maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)} MB.`,
            );
          }

          const file: UploadedFile = {
            fieldname: part.fieldname,
            originalname: part.filename,
            encoding: part.encoding,
            mimetype: part.mimetype,
            size: buffer.length,
            buffer: buffer,
          };

          validateFile(file, options);
          files.push(file);
        }

        // Attach to request for controllers
        (req as any).files = files;
      } catch (err: any) {
        if (err.code === 'FST_REQ_FILE_TOO_LARGE') {
          throw new PayloadTooLargeException(
            `One or more files exceed the maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)} MB.`,
          );
        }
        if (
          err instanceof BadRequestException ||
          err instanceof PayloadTooLargeException
        ) {
          throw err;
        }
        throw new BadRequestException(err?.message ?? 'File upload failed.');
      }

      return next.handle();
    }
  }

  return mixin(FilesInterceptorMixin);
}
