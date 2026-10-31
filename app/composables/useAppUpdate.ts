/**
 * The running version, a newer release if there is one, and "Update now": asks the updater to install it,
 * then waits for the app to come back on the new version and reloads the page.
 */
export function useAppUpdate() {
  const { api } = useManager()
  const confirm = useConfirm()
  const toast = useToast()
  const info = useState<VersionInfo | null>('versionInfo', () => null)
  const updating = useState('updating', () => false)
  const checking = ref(false)

  async function load(): Promise<void> {
    try {
      info.value = await api<VersionInfo>('/api/version', { scoped: false })
    }
    catch {
      // Without the check the page simply shows no update.
    }
  }

  // "Check now": asks GitHub again instead of waiting for the hourly check, and says what it found.
  async function check(): Promise<void> {
    checking.value = true

    try {
      info.value = await api<VersionInfo>('/api/version?refresh=1', { scoped: false })

      const latest = info.value.latest

      toast.add(latest
        ? { title: t('settings.newVersion', { version: latest.version }), color: 'info', icon: 'i-lucide-arrow-up-circle' }
        : { title: t('settings.upToDate'), color: 'success', icon: 'i-lucide-check' })
    }
    catch (error) {
      toast.add({ title: t('common.failed'), description: (error as Error).message, color: 'error' })
    }
    finally {
      checking.value = false
    }
  }

  // While the app restarts the requests fail; they are retried until it answers with another version.
  async function waitForNewVersion(from: string): Promise<string | null> {
    const until = Date.now() + 5 * 60_000

    while (Date.now() < until) {
      await new Promise(resolve => setTimeout(resolve, 5_000))

      try {
        const next = await api<VersionInfo>('/api/version', { scoped: false })

        if (next.current !== from) {
          return next.current
        }
      }
      catch {
        // Still restarting.
      }
    }

    return null
  }

  async function updateNow(): Promise<void> {
    const current = info.value

    if (!current?.latest || !(await confirm({ title: t('footer.updateConfirm', { version: current.latest.version }), confirmLabel: t('footer.updateNow') }))) {
      return
    }

    updating.value = true

    try {
      await api('/api/version/update', { method: 'POST', scoped: false })
      toast.add({ title: t('footer.updating'), icon: 'i-lucide-loader-circle', duration: 0, id: 'app-update' })

      const version = await waitForNewVersion(current.current)

      toast.remove('app-update')

      if (version) {
        toast.add({ title: t('footer.updated', { version }), color: 'success', icon: 'i-lucide-check' })
        setTimeout(() => window.location.reload(), 1_000)
      }
      else {
        toast.add({ title: t('footer.updateSlow'), color: 'warning', icon: 'i-lucide-clock' })
      }
    }
    catch (error) {
      toast.add({ title: t('common.failed'), description: (error as Error).message, color: 'error' })
    }
    finally {
      updating.value = false
    }
  }

  return { info, updating, checking, load, check, updateNow }
}
