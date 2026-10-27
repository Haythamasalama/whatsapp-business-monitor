import type ar from '../locales/ar'

export const LOCALES = ['ar', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export type Params = Record<string, string | number>
type Leaf = string | ((params: Params) => string)
type Shape<T> = { [K in keyof T]: T[K] extends Leaf ? Leaf : Shape<T[K]> }
type Paths<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends Leaf ? `${P}${K}` : Paths<T[K], `${P}${K}.`>
}[keyof T & string]

/** The English dictionary must have every key the Arabic one has. */
export type Dictionary = Shape<typeof ar>
export type MessageKey = Paths<typeof ar>

// Each side loads the dictionaries and says where the language comes from: the page's choice in the
// browser, the request's header on the server. Importing them here instead breaks Nitro's resolver.
let dictionaries: Partial<Record<Locale, Dictionary>> = {}
let source: () => Locale = () => 'ar'

export function setupI18n(options: { dictionaries: Record<Locale, Dictionary>, locale: () => Locale }): void {
  dictionaries = options.dictionaries
  source = options.locale
}

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale)

function lookup(locale: Locale, key: string): Leaf | undefined {
  let node: unknown = dictionaries[locale]

  for (const part of key.split('.')) {
    node = (node as Record<string, unknown> | undefined)?.[part]
  }

  return typeof node === 'string' || typeof node === 'function' ? node as Leaf : undefined
}

export function translate(locale: Locale, key: string, params: Params = {}): string | undefined {
  const message = lookup(locale, key)

  if (typeof message === 'function') {
    return message(params)
  }

  return message?.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
}

export function t(key: MessageKey, params?: Params): string {
  return translate(source(), key, params) ?? key
}

/** For keys built at run time (a status or category from Meta): `fallback` when the dictionary has no entry. */
export function tOr(key: string, fallback: string, params?: Params): string {
  return translate(source(), key, params) ?? fallback
}

export const currentLocale = (): Locale => source()
