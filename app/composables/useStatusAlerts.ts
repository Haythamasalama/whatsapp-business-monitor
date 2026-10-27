const storageKey = (account: string) => `whatsapp-templates:statuses:${account}`

function stored(account: string): Record<string, string> | null {
  try {
    return JSON.parse(localStorage.getItem(storageKey(account)) ?? 'null')
  }
  catch {
    return null
  }
}

function store(account: string, statuses: Record<string, string>): void {
  try {
    localStorage.setItem(storageKey(account), JSON.stringify(statuses))
  }
  catch {
    // Without storage the alerts still work while the page stays open.
  }
}

const TITLE: Record<string, { title: string, color: Tone }> = {
  APPROVED: { title: 'اعتُمد قالب', color: 'success' },
  REJECTED: { title: 'رُفض قالب', color: 'error' },
  PAUSED: { title: 'أُوقف قالب مؤقتاً', color: 'warning' },
  DISABLED: { title: 'عُطّل قالب', color: 'error' },
}

/**
 * Toasts every template whose review status changed since the last load. The statuses are kept per
 * account in the browser, so opening the page also reports what changed while it was closed.
 */
export function useStatusAlerts() {
  const { templates, templatesFor } = useManager()
  const toast = useToast()
  let known: { account: string, statuses: Record<string, string> } | null = null

  watch(templates, (list) => {
    const account = templatesFor.value

    if (!account || !list.length) {
      return
    }

    const previous = known?.account === account ? known.statuses : stored(account)
    const statuses = Object.fromEntries(list.map(template => [template.id, template.status]))
    const changed = previous ? list.filter(template => previous[template.id] && previous[template.id] !== template.status) : []

    if (changed.length > 3) {
      toast.add({ title: `تغيّرت حالة ${changed.length} قوالب`, icon: 'i-lucide-bell', color: 'info' })
    }
    else {
      for (const template of changed) {
        const { title, color } = TITLE[template.status] ?? { title: 'تغيّرت حالة قالب', color: 'info' as Tone }

        toast.add({
          title,
          description: `${template.name} · ${languageName(template.language)}: ${statusOf(previous![template.id]!).label} ← ${statusOf(template.status).label}`,
          icon: statusOf(template.status).icon,
          color,
          duration: 8000,
        })
      }
    }

    known = { account, statuses }
    store(account, statuses)
  })
}
