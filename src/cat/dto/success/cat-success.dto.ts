/**
 * @fileoverview Swagger example DTO for 200 success responses on the Cat endpoint.
 */
import { ApiProperty } from '@nestjs/swagger';
import type { GetCatResponseDto } from 'src/cat/interfaces/cat.interface';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { Methods } from 'src/common/enum/methods.enum';

/**
 * Represents a 200 Success response for the Cat endpoint.
 * This class inherits from the generic `SuccessResponseDto` to provide a consistent response structure.
 */
export class GetCatSuccessResponseDto extends SuccessResponseDto<any> {
  @ApiProperty({ example: 'Cat retrieved successfully' })
  declare message: string;

  @ApiProperty({ example: Methods.GET, enum: Methods })
  declare method: Methods.GET;

  @ApiProperty({ example: '/api/cat' })
  declare endpoint: string;

  @ApiProperty({ example: 200 })
  declare statusCode: number;

  @ApiProperty({ example: { name: 'Fluffy', breed: 'Maine Coon' } })
  declare data: GetCatResponseDto;
}
