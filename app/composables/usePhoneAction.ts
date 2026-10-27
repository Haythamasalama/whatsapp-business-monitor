/**
 * Runs a write on a phone number after the person confirms it, then shows a toast. Every change in
 * "account and numbers" goes through here, so none reaches Meta without a confirmation.
 */
export function usePhoneAction(phone: () => string) {
  const { api } = useManager()
  const confirm = useConfirm()
  const toast = useToast()
  const busy = ref(false)

  async function run<T>(options: { path: string, method?: 'POST' | 'DELETE', body?: Record<string, unknown>, query?: Record<string, string>, confirm: string, danger?: boolean, done: string }): Promise<T | null> {
    if (!(await confirm({ title: options.confirm, danger: options.danger }))) {
      return null
    }

    busy.value = true

    try {
      const query = new URLSearchParams({ phone: phone(), ...options.query })
      const result = await api<T>(`${options.path}?${query}`, { method: options.method ?? 'POST', body: options.body })

      toast.add({ title: options.done, color: 'success', icon: 'i-lucide-check' })

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
