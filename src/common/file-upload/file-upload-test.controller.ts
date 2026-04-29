/**
 * @fileoverview Test controller for the file upload interceptor.
 * Demonstrates single and multiple file uploads with validation and Swagger documentation.
 * This controller serves as a practical example for implementing secure file uploads.
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

/**
 * FileUploadTestController provides endpoints to test the boilerplate's file upload capabilities.
 * It showcases how to use custom interceptors for single and multiple file uploads with
 * built-in MIME type and image safety validations.
 */
@ApiTags('File Upload Test')
@Controller('test/file-upload')
export class FileUploadTestController {
  /**
   * Handles single file uploads (e.g., a user avatar).
   * Validates the file's MIME type and checks for potential image-based attacks.
   *
   * @param file - The uploaded file object provided by the ValidatedFileInterceptor.
   * @returns A success response containing the uploaded file's metadata.
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
      // At this point, `file` is guaranteed to be safe and match the allowed types.
      return {
        message: 'File uploaded and validated successfully',
        data: {
          fileName: file.originalname,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          mimetype: file.mimetype,
        },
      };
  }

  /**
   * Handles multiple file uploads (e.g., a photo gallery).
   * Validates each file independently using the ValidatedFilesInterceptor.
   *
   * @param files - An array of uploaded file objects.
   * @returns A success response containing metadata for each uploaded file.
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
  }
}
