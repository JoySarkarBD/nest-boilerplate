import { ApiProperty } from '@nestjs/swagger';
import { CustomInternalServerErrorDto } from 'src/common/dto/custom-internal-server-error.dto';
import { Methods } from 'src/common/enum/methods.enum';

export class CatInternalErrorResponseDto extends CustomInternalServerErrorDto {
  @ApiProperty({ example: 'Failed to retrieve cat' })
  declare message: string;

  @ApiProperty({ example: Methods.GET })
  declare method: Methods.GET;

  @ApiProperty({ example: '/api/cat' })
  declare endpoint: string;
}
