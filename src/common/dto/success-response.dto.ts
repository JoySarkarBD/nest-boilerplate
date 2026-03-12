import { ApiProperty } from '@nestjs/swagger';
import { Methods } from '../enum/methods.enum';

export class SuccessResponseDto<T> {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Request successful' })
  message!: string;

  @ApiProperty({ example: Methods.POST, enum: Methods })
  method!: Methods;

  @ApiProperty({ example: '/' })
  endpoint!: string;

  @ApiProperty({ example: 201 })
  statusCode!: number;

  @ApiProperty({ example: '2026-02-22T10:00:00.000Z' })
  timestamp!: string;

  @ApiProperty({ required: false })
  data?: T;
}
