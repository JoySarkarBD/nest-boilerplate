/**
 * @fileoverview Swagger DTOs for 201 success responses on file upload endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Methods } from 'src/common/enum/methods.enum';

/** DTO for single file upload success response */
class SingleFileResponseData {
  @ApiProperty({ example: 'avatar.jpg' })
  fileName: string;

  @ApiProperty({ example: '150.50 KB' })
  size: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimetype: string;
}

/** DTO for single file upload success response */
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

/** DTO for multiple files upload success response */
class MultipleFilesResponseData {
  @ApiProperty({ type: [SingleFileResponseData] })
  files: SingleFileResponseData[];
}

/** DTO for multiple files upload success response */
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
