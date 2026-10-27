/**
 * Keeps the address bar in step with what the page shows, so a screen can be bookmarked, shared and reached
 * with back and forward: / (overview), /accounts, /settings, /{WABA id}, /{WABA id}/reports and /{WABA id}/settings.
 * WABA ids are digits only, so they never clash with the named screens.
 */
export function useAddress() {
  const { accounts, accountId, current, screen, accountTab, switchAccount, showOverview } = useManager()

  const pathNow = computed(() => {
    if (screen.value === 'accounts' || screen.value === 'settings') {
      return `/${screen.value}`
    }

    if (screen.value === 'account' && current.value) {
      return `/${current.value.waba_id}${{ templates: '', reports: '/reports', business: '/settings' }[accountTab.value]}`
    }

    return '/'
  })

  /** Shows the screen a path names; an unknown account falls back to the overview. */
  async function open(path: string): Promise<void> {
    const [first, second] = path.split('/').filter(Boolean)

    if (first === 'accounts' || first === 'settings') {
      screen.value = first

      return
    }

    const account = first ? accounts.value.find(entry => entry.waba_id === first) : undefined

    if (account) {
      accountTab.value = second === 'settings' ? 'business' : second === 'reports' ? 'reports' : 'templates'
      await switchAccount(account.id)

      return
    }

    await showOverview()
  }

  function start(): void {
    watch(pathNow, (path) => {
      if (path !== location.pathname) {
        history.pushState(null, '', path)
      }
    })

    window.addEventListener('popstate', () => {
      void open(location.pathname)
    })
  }

  return { open, start, initialPath: () => location.pathname, accountId }
}
