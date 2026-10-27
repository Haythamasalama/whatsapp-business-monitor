/** Whether the app still needs its setup, someone to sign in, or is ready; read from /api/app. */
export function useSession() {
  const info = useState<AppInfo | null>('appInfo', () => null)

  const status = computed(() => {
    if (!info.value) {
      return 'loading'
    }

    return info.value.setup_required ? 'setup' : info.value.user ? 'ready' : 'login'
  })

  const appName = computed(() => info.value?.instance_name || t('brand.name'))

  async function loadApp(): Promise<void> {
    info.value = await $fetch<AppInfo>('/api/app', { headers: { 'X-Requested-With': 'whatsapp-manager', 'X-Locale': locale.value } })
    useDefaultLocale(info.value.default_locale)
  }

  async function signOut(): Promise<void> {
    await $fetch('/api/auth/logout', { method: 'POST', headers: { 'X-Requested-With': 'whatsapp-manager' } }).catch(() => {})
    signedOut()
  }

  function signedOut(): void {
    if (info.value) {
      info.value = { ...info.value, user: null }
    }
  }

  return { info, status, appName, loadApp, signOut, signedOut }
}
