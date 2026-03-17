/**
 * @fileoverview Reusable pagination / search query DTO.
 *
 * Attach to any `@Query()` parameter on a controller to enforce
 * page number, page size, and optional text search across
 * every listing endpoint in a consistent way.
 */
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class SearchQueryDto {
  /** 1-based page number. */
  @ApiProperty({
    description: 'The page number for pagination (1-based index)',
    required: true,
    type: Number,
    example: 1,
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'pageNo must be a valid number' },
  )
  @Min(1, { message: 'pageNo must be at least 1' })
  pageNo!: number;

  /** Number of items per page (1–100). */
  @ApiProperty({
    description: 'The number of items per page (1-100)',
    required: true,
    type: Number,
    example: 10,
  })
  @Type(() => Number)
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'pageSize must be a valid number' },
  )
  @Min(1, { message: 'pageSize must be at least 1' })
  @Max(100, { message: 'pageSize cannot exceed 100' })
  pageSize!: number;

  /** Optional free-text search term; can be null or empty. */
  @ApiProperty({
    description: 'Optional free-text search term; can be null or empty',
    required: false,
    type: String,
    example: 'search term',
  })
  @IsOptional()
  @ValidateIf((o) => o.searchKey !== null && o.searchKey !== undefined)
  @IsString({ message: 'searchKey must be a string' })
  searchKey?: string | null;
}
