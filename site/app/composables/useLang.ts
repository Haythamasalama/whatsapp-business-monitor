// Each language has its own address, so search engines index the Arabic page too.
export function useLang() {
  const route = useRoute()
  const lang = computed<Lang>(() => (route.path.startsWith('/ar') ? 'ar' : 'en'))

  return {
    lang,
    text: computed(() => content[lang.value]),
    isRtl: computed(() => lang.value === 'ar'),
    otherPath: computed(() => (lang.value === 'ar' ? '/' : '/ar/')),
  }
}

/** A file under the site's base path, which is /whatsapp-business-monitor/ on GitHub Pages. */
export const asset = (path: string) => `${useRuntimeConfig().app.baseURL}${path}`
