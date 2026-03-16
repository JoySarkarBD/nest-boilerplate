/**
 * @fileoverview Swagger example DTO for 500 Internal Server Error responses on the Cat endpoint.
 */
import { ApiProperty } from '@nestjs/swagger';
import { CustomInternalServerErrorDto } from 'src/common/dto/custom-internal-server-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

/**
 * Represents a 500 Internal Server Error response specifically for the Cat endpoint.
 * This class extends the generic `CustomInternalServerErrorDto` to provide more context.
 */
export class CatInternalErrorResponseDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Failed to retrieve cat' })
  declare message: string;

  @ApiProperty({ example: Methods.GET })
  declare method: Methods.GET;

  @ApiProperty({ example: '/api/cat' })
  declare endpoint: string;
}
