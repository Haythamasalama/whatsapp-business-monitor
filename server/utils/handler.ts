import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'

/**
 * Nitro answers an unexpected exception with a bare "500 Server Error". Every /api route goes through
 * this wrapper instead, so the page shows what actually failed and the terminal logs the stack.
 */
export function apiHandler<T>(handler: (event: H3Event) => T | Promise<T>): EventHandler<EventHandlerRequest, Promise<T>> {
  return defineEventHandler(event => withLocale(event, async () => {
    try {
      return await handler(event)
    }
    catch (error) {
      if (isError(error)) {
        throw error
      }

      console.error(`[api] ${event.method} ${event.path}`, error)

      throw apiError(500, t('server.unexpected', { message: (error as Error)?.message ?? String(error) }))
    }
    finally {
      // Even a write Meta refused may have changed something, so the account's cached answers go either way.
      dropAfterWrite(event)
    }
  }))
}
