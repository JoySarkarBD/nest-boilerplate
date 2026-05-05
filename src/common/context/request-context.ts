/**
 * @fileoverview Request context — AsyncLocalStorage-based request carrier.
 *
 * Stores the active Fastify request in an AsyncLocalStorage store so that
 * any code running within the same async call chain (guards, pipes, services)
 * can retrieve it without needing it injected explicitly.
 *
 * This is the standard pattern used by nestjs-cls and nestjs-i18n to make
 * the request available deep inside the NestJS pipe/guard lifecycle where
 * NestJS does not pass it directly.
 *
 * Setup (done in main.ts):
 *   app.use(RequestContext.middleware());
 *
 * Usage (e.g. inside I18nValidationPipe):
 *   const req = RequestContext.currentRequest();
 *   const lang = resolveLangFromRequest(req ?? {});
 */
import { AsyncLocalStorage } from 'async_hooks';
import type { FastifyRequest } from 'fastify';

interface Store {
  request: FastifyRequest;
}

/** Singleton AsyncLocalStorage instance for the entire process. */
const storage = new AsyncLocalStorage<Store>();

export class RequestContext {
  /**
   * Returns a connect-style middleware that binds the current Fastify
   * request to the async storage before handing off to the next handler.
   *
   * Register once in `main.ts`:
   *   app.use(RequestContext.middleware());
   */
  static middleware() {
    return (req: FastifyRequest, _res: unknown, next: () => void): void => {
      storage.run({ request: req }, next);
    };
  }

  /**
   * Retrieve the Fastify request bound to the current async context.
   * Returns `undefined` when called outside a request lifecycle
   * (e.g. during bootstrap or in a background job).
   */
  static currentRequest(): FastifyRequest | undefined {
    return storage.getStore()?.request;
  }
}
