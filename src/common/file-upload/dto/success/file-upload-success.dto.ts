/**
 * @fileoverview Swagger DTOs for 201 success responses on file upload endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Methods } from 'src/common/enum/methods.enum';

/**
 * Detailed information about a single uploaded file.
 */
class SingleFileResponseData {
  @ApiProperty({ example: 'avatar.jpg' })
  fileName: string;

  @ApiProperty({ example: '150.50 KB' })
  size: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;
}

/**
 * Represents a 201 Created response for a successful single file upload.
 */
export class FileUploadSingleSuccessDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'File uploaded and validated successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/file-upload/single' })
  declare endpoint: string;

  @ApiProperty({ example: 201 })
  declare statusCode: number;

  @ApiProperty({
    type: SingleFileResponseData,
    example: SingleFileResponseData,
  })
  declare data: SingleFileResponseData;
}

/**
 * Container for multiple file upload response data.
 */
class MultipleFilesResponseData {
  @ApiProperty({ type: [SingleFileResponseData] })
  files: SingleFileResponseData[];
}

/**
 * Represents a 201 Created response for successful multiple files upload.
 */
export class FileUploadMultipleSuccessDto extends SuccessResponseDto<MultipleFilesResponseData> {
  @ApiProperty({ example: '2 files uploaded and validated successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/file-upload/multiple' })
  declare endpoint: string;

  @ApiProperty({ example: 201 })
  declare statusCode: number;

  @ApiProperty({ type: MultipleFilesResponseData })
  declare data: MultipleFilesResponseData;
}
