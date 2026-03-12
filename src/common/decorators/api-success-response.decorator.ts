/**
 * @fileoverview This file defines a custom NestJS decorator called `ApiSuccessResponse` that standardizes the way successful API responses are documented in Swagger. It allows developers to specify a DTO model for the response, along with an optional HTTP status code and an indication of whether the response is an array. By using this decorator, developers can ensure that all successful responses in their API are documented in a consistent format, improving the clarity and professionalism of the API documentation while reducing repetitive code in controllers.
 */
import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Custom decorator to standardize successful API responses in Swagger documentation. It wraps the provided model in a consistent response structure that includes a status code and a data property, ensuring that all successful responses are documented in a uniform way. This enhances the clarity and professionalism of your API documentation while reducing repetitive code in your controllers.
 *
 * @param model The DTO class that represents the structure of the successful response data. This should be a class decorated with Swagger decorators to define the schema.
 * @param status The HTTP status code for the successful response (default is 200).
 * @param isArray A boolean indicating whether the response data is an array of the provided model (default is false).
 *
 * Example usage:
 * @ApiSuccessResponse(GetUserResponseDto, 200)
 * getUser(): GetUserResponseDto {
 *  // ...
 * }
 *
 * @ApiSuccessResponse(GetUsersResponseDto, 200, true)
 * getUsers(): GetUsersResponseDto[] {
 *  // ...
 * }
 *
 * In the above examples, the first method documents a successful response that returns a single GetUserResponseDto object, while the second method documents a successful response that returns an array of GetUsersResponseDto objects. Both responses will be wrapped in a consistent structure that includes a status code and a data property in the Swagger documentation.
 */
export function ApiSuccessResponse<TModel extends Type<any>>(
  model: TModel,
  status = HttpStatus.OK,
  isArray = false,
) {
  // Determine the schema for the data property based on whether it's an array or a single object
  const dataSchema = isArray
    ? { type: 'array', items: { $ref: getSchemaPath(model) } }
    : { $ref: getSchemaPath(model) };

  // Apply the ApiExtraModels decorator to ensure the model is included in the Swagger documentation, and then apply the ApiResponse decorator with a standardized response structure that includes the status code and data schema. This ensures that all successful responses are documented in a consistent way across the API.
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        allOf: [
          { $ref: getSchemaPath(model) },
          { properties: { statusCode: { example: status }, data: dataSchema } },
        ],
      },
    }),
  );
}
