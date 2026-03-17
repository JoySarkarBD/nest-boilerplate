/**
 * @fileoverview DTO for validating a single MongoDB ObjectId parameter.
 *
 * Use with `@Param()` on any endpoint that accepts an `:id` route param
 * to ensure it is a valid 24-character hex ObjectId.
 */
import { ArrayNotEmpty, IsArray, IsMongoId, IsNotEmpty } from 'class-validator';

export class MongoIdDto {
  /** A valid 24-character MongoDB ObjectId. */
  @IsMongoId({ message: 'ID must be a valid MongoDB ObjectId' })
  @IsNotEmpty({ message: 'ID is required' })
  id!: string;
}

export class MongoIdsDto {
  @IsArray({ message: 'ids must be an array' })
  @ArrayNotEmpty({ message: 'IDs array cannot be empty' })
  @IsMongoId({
    each: true,
    message: 'Each ID must be a valid MongoDB ObjectId',
  })
  ids!: string[];
}
