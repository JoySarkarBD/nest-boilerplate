/**
 * @fileoverview Cat service — an example service demonstrating basic CRUD logic and response patterns.
 * This service illustrates the use of the `tryCatch` utility for consistent error handling.
 */
import { Injectable } from '@nestjs/common';
import { tryCatch } from 'src/common/utils/try-catch.util';
import { ServicePayload } from 'src/shared/interfaces/response.interface';
import { GetCatResponseDto } from './interfaces/cat.interface';

/**
 * CatService handles business logic related to the "Cat" resource.
 * It demonstrates how services interact with the boilerplate's standard response structures.
 */
@Injectable()
export class CatService {
  /**
   * Retrieves a sample cat's data.
   *
   * @returns A promise resolving to a ServicePayload containing the cat's details.
   * @throws InternalServerErrorException if there is an error during retrieval.
   */
  async getCat(): Promise<ServicePayload<GetCatResponseDto>> {
    return tryCatch(() => {
      const cat: GetCatResponseDto = {
        name: 'Milo',
        breed: 'Ragdoll',
      };

      return {
        message: 'Cat retrieved successfully',
        data: cat,
      };
    }, 'Failed to retrieve cat');
  }
}
