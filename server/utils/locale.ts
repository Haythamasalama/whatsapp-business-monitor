import { AsyncLocalStorage } from 'node:async_hooks'
import type { H3Event } from 'h3'
import ar from '#shared/locales/ar'
import en from '#shared/locales/en'

const requestLocale = new AsyncLocalStorage<Locale>()

export const localeOf = (event: H3Event): Locale => {
  const header = getHeader(event, 'x-locale')

  return isLocale(header) ? header : 'ar'
}

export const withLocale = <T>(event: H3Event, run: () => T): T => requestLocale.run(localeOf(event), run)

export const requestedLocale = (): Locale => requestLocale.getStore() ?? 'ar'

setupI18n({ dictionaries: { ar, en }, locale: requestedLocale })
