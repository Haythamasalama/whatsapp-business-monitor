/**
 * Runs a write on templates after the person confirms it, reloads the list, then shows a toast. Every template
 * delete, archive, unarchive, unpause and copy goes through here, so none reaches Meta without a confirmation.
 */
export function useTemplateAction() {
  const { api, reloadTemplates } = useManager()
  const confirm = useConfirm()
  const toast = useToast()
  const busy = ref(false)

  async function run<T>(options: { path: string, method?: 'POST' | 'DELETE', body?: Record<string, unknown>, query?: Record<string, string>, confirm: string, confirmLabel?: string, danger?: boolean, done: (result: T) => string }): Promise<T | null> {
    if (!(await confirm({ title: options.confirm, confirmLabel: options.confirmLabel, danger: options.danger }))) {
      return null
    }

    busy.value = true

    try {
      const query = options.query ? `?${new URLSearchParams(options.query)}` : ''
      const result = await api<T>(`${options.path}${query}`, { method: options.method ?? 'POST', body: options.body })
      const failed = (result as Partial<TemplateActionResult>)?.failed ?? []

      toast.add(failed.length
        ? { title: t('templateActions.failedTitle'), description: failed.map(entry => `${entry.id}: ${entry.reason}`).join('\n'), color: 'warning', icon: 'i-lucide-triangle-alert' }
        : { title: options.done(result), color: 'success', icon: 'i-lucide-check' })
      await reloadTemplates()

      return result
    }
    catch (error) {
      toast.add({ title: t('common.failed'), description: (error as Error).message, color: 'error' })

      return null
    }
    finally {
      busy.value = false
    }
  }

  return { run, busy }
}
