import ar from '#shared/locales/ar'
import en from '#shared/locales/en'

export default defineNuxtPlugin(() => {
  setupI18n({ dictionaries: { ar, en }, locale: () => locale.value })
})
