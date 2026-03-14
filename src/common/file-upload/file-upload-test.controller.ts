/**
 * @fileoverview Test controller for the file upload interceptor.
 * Demonstrates single and multiple file uploads with validation and Swagger docs.
 */
import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiErrorResponses } from '../decorators/api-error-response.decorator';
import { ApiSuccessResponse } from '../decorators/api-success-response.decorator';
import { tryCatch } from '../utils/try-catch.util';
import {
  FileUploadMultipleInternalErrorDto,
  FileUploadSingleInternalErrorDto,
} from './dto/error/file-upload-internal-error.dto';
import {
  FileUploadPayloadTooLargeDto,
  FileUploadPayloadTooLargeMultipleDto,
  FileUploadUnsupportedMediaTypeDto,
  FileUploadUnsupportedMediaTypeMultipleDto,
} from './dto/error/file-upload-validation-error.dto';
import {
  FileUploadMultipleSuccessDto,
  FileUploadSingleSuccessDto,
} from './dto/success/file-upload-success.dto';
import { ValidatedFileInterceptor, ValidatedFilesInterceptor } from './index';

@ApiTags('File Upload Test')
@Controller('test/file-upload')
export class FileUploadTestController {
  /**
   * Test endpoint for single file upload (e.g., an avatar).
   * Validates MIME type and prevents image attacks.
   */
  @Post('single')
  @ApiOperation({ summary: 'Upload a single image file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Max 5MB. Allowed: jpeg, png, webp',
        },
      },
    },
  })
  @ApiSuccessResponse(FileUploadSingleSuccessDto, 201)
  @ApiErrorResponses({
    payloadTooLarge: FileUploadPayloadTooLargeDto, // 413 (but validation parameter handles it here)
    unsupported: FileUploadUnsupportedMediaTypeDto,
    internal: FileUploadSingleInternalErrorDto,
  })
  @UseInterceptors(
    ValidatedFileInterceptor('avatar', {
      maxSizeBytes: 5 * 1024 * 1024, // 5MB limit
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      image: {
        maxWidth: 4096, // Max width 4096px
        maxHeight: 4096, // Max height 4096px
        maxPixels: 10_000_000, // Safe limit for image bombs
      },
    }),
  )
  async uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return tryCatch(async () => {
      // At this point, `file` is guaranteed to be safe and match the allowed types.
      return {
        message: 'File uploaded and validated successfully',
        data: {
          fileName: file.originalname,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          mimetype: file.mimetype,
        },
      };
    }, 'Failed to upload single file');
  }

  /**
   * Test endpoint for multiple file uploads (e.g., a gallery).
   * Validates each file independently.
   */
  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple image files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photos: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Max 5MB per file. Max 5 files. Allowed: jpeg, png',
        },
      },
    },
  })
  @ApiSuccessResponse(FileUploadMultipleSuccessDto, 201)
  @ApiErrorResponses({
    payloadTooLarge: FileUploadPayloadTooLargeMultipleDto,
    unsupported: FileUploadUnsupportedMediaTypeMultipleDto,
    internal: FileUploadMultipleInternalErrorDto,
  })
  @UseInterceptors(
    ValidatedFilesInterceptor(
      'photos', // field name
      {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        image: {
          maxPixels: 15_000_000,
        },
      },
      5, // max allowed files
    ),
  )
  async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    return tryCatch(async () => {
      // `files` array is fully validated
      return {
        message: `${files.length} files uploaded and validated successfully`,
        data: {
          files: files.map((file) => ({
            fileName: file.originalname,
            size: `${(file.size / 1024).toFixed(2)} KB`,
            mimetype: file.mimetype,
          })),
        },
      };
    }, 'Failed to upload multiple files');
  }
}
