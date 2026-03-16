/**
 * @fileoverview Utility module providing standardized async error handling.
 * It ensures that errors thrown during asynchronous operations are captured and
 * re-thrown as consistent NestJS exceptions.
 */
import { InternalServerErrorException } from '@nestjs/common';

/**
 * Executes an async operation and provides a unified error handling wrapper.
 * Any errors caught (except those that are already InternalServerErrorExceptions)
 * are wrapped in an InternalServerErrorException with the provided custom message.
 *
 * @param fn - The synchronous or asynchronous function to execute.
 * @param message - The custom error message to use if an exception occurs.
 * @returns A promise that resolves to the result of the provided function.
 * @throws InternalServerErrorException if the function execution fails.
 */
export async function tryCatch<T>(
  fn: () => T | Promise<T>,
  message: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof InternalServerErrorException) throw error;
    throw new InternalServerErrorException(message);
  }
}
