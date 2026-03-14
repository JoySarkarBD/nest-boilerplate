/**
 * @fileoverview Swagger DTOs for 500 Internal Server Error responses on file upload endpoints.
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomInternalServerErrorDto } from 'src/common/dto/custom-internal-server-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

export class FileUploadSingleInternalErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Internal server error' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/file-upload/single' })
  declare endpoint: string;
}

export class FileUploadMultipleInternalErrorDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Internal server error' })
  declare message: string;

  @ApiProperty({ example: Methods.POST })
  declare method: Methods.POST;

  @ApiProperty({ example: '/api/test/file-upload/multiple' })
  declare endpoint: string;
}
