/**
 * @fileoverview Cat service — example service demonstrating the boilerplate's tryCatch pattern.
 */
import { Injectable } from '@nestjs/common';
import { tryCatch } from 'src/common/utils/try-catch.util';
import { ServicePayload } from 'src/shared/interfaces/response.interface';
import { GetCatResponseDto } from './interfaces/cat.interface';

@Injectable()
export class CatService {
  /** Returns a sample cat payload. */
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
