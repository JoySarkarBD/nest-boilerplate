/**
 * @fileoverview Interceptor factory for handling single file uploads in the NestJS application using Fastify.
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

/** Default maximum file size: 5 MB. */
const DEFAULT_MAX_SIZE = 5 * 1024 * 1024;

/**
 * Validates an individual file against the provided options.
 * This includes checking magic bytes for MIME types and pixel safety for images.
 *
 * @param file - The file object.
 * @param options - The validation options to apply.
 * @throws BadRequestException if validation fails for MIME type or image safety.
 */
function validateFile(file: UploadedFile, options: FileUploadOptions): void {
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
 * Factory that creates a NestJS interceptor for handling a **single** file upload with Fastify.
 *
 * @param fieldName - The multipart form field name (e.g., 'avatar').
 * @param options - Validation options including size limits, allowed MIME types, and image safety.
 * @returns A dynamically created interceptor class.
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
      const req = context.switchToHttp().getRequest<FastifyRequest>();
      const maxSize = options.maxSizeBytes ?? DEFAULT_MAX_SIZE;

      if (!req.isMultipart()) {
        throw new BadRequestException('Request is not multipart/form-data');
      }

      try {
        const data = await req.file({
          limits: { fileSize: maxSize },
        });

        if (!data) {
          return next.handle();
        }

        if (data.fieldname !== fieldName) {
          throw new BadRequestException(
            `Expected field name "${fieldName}" but received "${data.fieldname}"`,
          );
        }

        const buffer = await data.toBuffer();

        // Check file size again because toBuffer might not enforce it strictly depending on config
        if (buffer.length > maxSize) {
          throw new PayloadTooLargeException(
            `File exceeds the maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)} MB.`,
          );
        }

        const file: UploadedFile = {
          fieldname: data.fieldname,
          originalname: data.filename,
          encoding: data.encoding,
          mimetype: data.mimetype,
          size: buffer.length,
          buffer: buffer,
        };

        // Attach to request for controllers (standard Nest naming is slightly different but we follow the pattern)
        (req as any).file = file;

        // Also handle other fields if any
        if (data.fields) {
          const body: Record<string, any> = {};
          for (const key of Object.keys(data.fields)) {
            const field = data.fields[key];
            if (field && 'value' in field) {
              body[key] = field.value;
            }
          }
          req.body = { ...(req.body as object), ...body };
        }

        // Validate the uploaded file
        validateFile(file, options);
      } catch (err: any) {
        if (err.code === 'FST_REQ_FILE_TOO_LARGE') {
          throw new PayloadTooLargeException(
            `File exceeds the maximum allowed size of ${(maxSize / 1024 / 1024).toFixed(1)} MB.`,
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

  return mixin(FileInterceptorMixin);
}
