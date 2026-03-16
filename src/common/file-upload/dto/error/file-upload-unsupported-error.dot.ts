/**
 * @fileoverview Swagger DTOs for 415 Unsupported Media Type error responses.
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomUnsupportedMediaTypeDto } from 'src/common/dto/custom-unsupported-media-type.dto';
import { Methods } from 'src/common/enum/methods.enum';

/**
 * Represents a 415 Unsupported Media Type error response for single file upload.
 */
export class FileUploadUnsupportedErrorDto extends CustomUnsupportedMediaTypeDto {
  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods;

  @ApiProperty({ example: '/api/test/file-upload/single' })
  declare endpoint: string;

  @ApiProperty({ example: 415 })
  declare statusCode: number;

  @ApiProperty({ example: 'Unsupported Media Type' })
  declare message: string;
}

/**
 * Represents a 415 Unsupported Media Type error response for multiple files upload.
 */
export class FileMultipleUnsupportedErrorDto extends CustomUnsupportedMediaTypeDto {
  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods;

  @ApiProperty({ example: '/api/test/file-upload/multiple' })
  declare endpoint: string;

  @ApiProperty({ example: 415 })
  declare statusCode: number;

  @ApiProperty({ example: 'Unsupported Media Type' })
  declare message: string;
}
