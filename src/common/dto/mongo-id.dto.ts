/**
 * @fileoverview DTO for validating UUID route parameters.
 *
 * Renamed from MongoIdDto but kept for backward compatibility.
 * Now validates PostgreSQL UUID (v4) format instead of MongoDB ObjectId.
 */
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsUUID } from 'class-validator';

export class MongoIdDto {
  /** A valid UUID v4. */
  @IsUUID('4', { message: 'ID must be a valid UUID' })
  @IsNotEmpty({ message: 'ID is required' })
  id!: string;
}

export class MongoIdsDto {
  @IsArray({ message: 'ids must be an array' })
  @ArrayNotEmpty({ message: 'IDs array cannot be empty' })
  @IsUUID('4', { each: true, message: 'Each ID must be a valid UUID' })
  ids!: string[];
}
