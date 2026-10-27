const LOCALE_KEY = 'whatsapp-templates:locale'

function storedLocale(): Locale | null {
  try {
    const value = localStorage.getItem(LOCALE_KEY)

    return isLocale(value) ? value : null
  }
  catch {
    return null
  }
}

export const locale = ref<Locale>(storedLocale() ?? 'ar')

/** The language set in the app's settings, used until this browser picks one. */
export function useDefaultLocale(fallback: Locale): void {
  if (!storedLocale()) {
    locale.value = fallback
  }
}

export function setLocale(next: Locale): void {
  locale.value = next

  try {
    localStorage.setItem(LOCALE_KEY, next)
  }
  catch {
    // Without storage the page opens in Arabic next time.
  }
}

export const isRtl = computed(() => locale.value === 'ar')

/** Intl formatting follows the interface language, with Latin digits in Arabic as Meta and WhatsApp show them. */
export const intlLocale = () => (locale.value === 'ar' ? 'ar-u-ca-gregory-nu-latn' : 'en-US')
