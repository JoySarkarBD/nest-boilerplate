/**
 * @fileoverview This file defines a custom decorator, `ApiRequestDetails`, which is designed to simplify the application of multiple Swagger decorators related to request parameters and queries in NestJS controllers. By using this decorator, developers can consolidate the configuration of API parameters and queries into a single, clean decorator, improving readability and maintainability of the controller methods. The decorator supports both individual and array configurations for parameters and queries, as well as optional DTOs for enhanced documentation in Swagger.
 */
import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiParam,
  ApiParamOptions,
  ApiQuery,
  ApiQueryOptions,
} from '@nestjs/swagger';

// Utility type to allow either a single object or an array of objects for params and queries
type SingleOrArray<T> = T | T[];

// Configuration interface for the ApiRequestDetails decorator
interface SwaggerRequestConfig {
  params?: SingleOrArray<ApiParamOptions>;
  queries?: SingleOrArray<ApiQueryOptions>;
  queryDto?: Type<unknown>;
  paramDto?: Type<unknown>;
}

/**
 * Custom decorator to apply multiple Swagger decorators for request parameters and queries in a single, clean way. This allows you to define all your request details in one place, improving readability and maintainability of your controller methods.
 *
 * @param config An object containing configuration for params, queries, and optional DTOs for both. You can provide either a single object or an array of objects for params and queries.
 *
 * Example usage:
 * @ApiRequestDetails({
 *   params: [
 *     { name: 'id', required: true, description: 'ID of the resource' },
 *     { name: 'type', required: false, description: 'Type of the resource' },
 *  ],
 *  queries: { name: 'search', required: false, description: 'Search term' },
 *  queryDto: SearchQueryDto,
 * })
 * getResource(@Param('id') id: string, @Query() query: SearchQueryDto) {
 *   // ...
 * }
 */
export function ApiRequestDetails(
  config: SwaggerRequestConfig,
): MethodDecorator {
  const decorators: MethodDecorator[] = [];

  // Params
  if (config?.params) {
    const paramArray = Array.isArray(config.params)
      ? config.params
      : [config.params];

    decorators.push(...paramArray.map((param) => ApiParam(param)));
  }

  // Manual Queries
  if (config?.queries) {
    const queryArray = Array.isArray(config.queries)
      ? config.queries
      : [config.queries];

    decorators.push(...queryArray.map((query) => ApiQuery(query)));
  }

  // DTO Query Support
  if (config?.queryDto) {
    decorators.push(ApiExtraModels(config.queryDto));
  }

  // DTO Param Support
  if (config?.paramDto) {
    decorators.push(ApiExtraModels(config.paramDto));
  }

  return applyDecorators(...decorators);
}
