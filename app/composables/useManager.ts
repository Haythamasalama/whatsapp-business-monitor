interface ApiOptions {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: Record<string, unknown>
  scoped?: boolean
}

const STORAGE_KEY = 'whatsapp-templates:account'
let ticket = 0

function remember(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id)
  }
  catch {
    // Storage can be blocked; the page then opens on the first account.
  }
}

function remembered(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  }
  catch {
    return null
  }
}

export function useManager() {
  const accounts = useState<AccountSummary[]>('accounts', () => [])
  const storage = useState('storage', () => '')
  const accountId = useState<string | null>('accountId', () => null)
  const templates = useState<MetaTemplate[]>('templates', () => [])
  const templatesError = useState<string | null>('templatesError', () => null)
  const templateQuota = useState<TemplateQuota | null>('templateQuota', () => null)
  const overview = useState<Overview | null>('overview', () => null)
  const overviewError = useState<string | null>('overviewError', () => null)
  const loading = useState('loading', () => false)
  const analytics = useState<Analytics | null>('analytics', () => null)
  const analyticsError = useState<string | null>('analyticsError', () => null)
  const analyticsLoading = useState('analyticsLoading', () => false)
  const templatesFor = useState<string | null>('templatesFor', () => null)
  const lastLoadedAt = useState('lastLoadedAt', () => 0)
  const screen = useState<'overview' | 'account' | 'accounts' | 'settings'>('screen', () => 'overview')
  const accountTab = useState<'templates' | 'reports' | 'business'>('accountTab', () => 'templates')
  const summary = useState<AccountStats[] | null>('summary', () => null)
  const summaryError = useState<string | null>('summaryError', () => null)
  const summaryLoading = useState('summaryLoading', () => false)
  const summaryLoadedAt = useState('summaryLoadedAt', () => 0)

  const current = computed(() => accounts.value.find(account => account.id === accountId.value) ?? null)

  const groups = computed<TemplateGroup[]>(() => {
    const map = new Map<string, TemplateGroup>()
    const rank = (language: string) => {
      const index = LANGS.indexOf(language)

      return index === -1 ? LANGS.length : index
    }

    for (const template of templates.value) {
      if (!map.has(template.name)) {
        map.set(template.name, { name: template.name, category: template.category, items: [] })
      }

      map.get(template.name)!.items.push(template)
    }

    for (const group of map.values()) {
      group.items.sort((a, b) => rank(a.language) - rank(b.language))
    }

    return [...map.values()]
  })

  async function api<T>(path: string, { method = 'GET', body, scoped = true }: ApiOptions = {}): Promise<T> {
    try {
      return await $fetch(path, {
        method,
        body,
        headers: { 'X-Requested-With': 'whatsapp-manager', 'X-Locale': locale.value },
        query: scoped ? { account: accountId.value } : undefined,
      }) as T
    }
    catch (error) {
      const failure = error as { data?: { data?: { error?: MetaError }, error?: MetaError }, statusCode?: number }

      if (failure.statusCode === 401) {
        useSession().signedOut()
      }

      const reason = errorText(failure.data?.data?.error ?? failure.data?.error)

      throw new Error(reason || (failure.statusCode
        ? t('errors.serverStatus', { status: failure.statusCode })
        : t('errors.serverUnreachable')))
    }
  }

  async function loadAccounts(select?: string): Promise<void> {
    const response = await api<{ data: AccountSummary[], storage: string }>('/api/accounts', { scoped: false })

    accounts.value = response.data
    storage.value = response.storage

    if (!response.data.length) {
      accountId.value = null
      templates.value = []
      templateQuota.value = null
      overview.value = null

      return
    }

    const wanted = select ?? remembered()
    accountId.value = response.data.some(account => account.id === wanted) ? wanted : response.data[0]!.id

    if (select) {
      screen.value = 'account'
    }

    if (screen.value === 'overview' || screen.value === 'account') {
      await (screen.value === 'account' ? loadAccountData() : loadSummary())
    }
  }

  async function loadSummary({ silent = false } = {}): Promise<void> {
    if (!silent) {
      summaryLoading.value = true
    }

    try {
      summary.value = (await api<{ data: AccountStats[] }>('/api/summary', { scoped: false })).data
      summaryError.value = null
    }
    catch (error) {
      if (!silent) {
        summary.value = null
        summaryError.value = (error as Error).message
      }
    }
    finally {
      summaryLoading.value = false
      summaryLoadedAt.value = Date.now()
    }
  }

  async function showOverview(): Promise<void> {
    screen.value = 'overview'

    if (!summary.value) {
      await loadSummary()
    }
  }

  // `silent` refreshes in place (focus, polling): no skeletons, and a failed refresh keeps what is on screen.
  async function loadAccountData({ silent = false } = {}): Promise<void> {
    const mine = ++ticket
    const account = accountId.value!

    remember(account)

    if (!silent) {
      loading.value = true
      overview.value = null
    }

    const [overviewResult, templatesResult] = await Promise.allSettled([
      api<Overview>('/api/overview'),
      api<{ data: MetaTemplate[], quota: TemplateQuota | null }>('/api/templates'),
    ])

    if (mine !== ticket) {
      return
    }

    if (overviewResult.status === 'fulfilled' || !silent) {
      overview.value = overviewResult.status === 'fulfilled' ? overviewResult.value : null
      overviewError.value = overviewResult.status === 'rejected' ? (overviewResult.reason as Error).message : null
    }

    if (templatesResult.status === 'fulfilled' || !silent) {
      templatesFor.value = account
      templates.value = templatesResult.status === 'fulfilled' ? templatesResult.value.data : []
      templateQuota.value = templatesResult.status === 'fulfilled' ? templatesResult.value.quota : null
      templatesError.value = templatesResult.status === 'rejected' ? (templatesResult.reason as Error).message : null
    }

    loading.value = false
    lastLoadedAt.value = Date.now()

    // The numbers per template come from a slower Meta call; the table shows first and fills them in.
    void loadAnalytics(mine, silent)
  }

  async function loadAnalytics(mine = ticket, silent = false): Promise<void> {
    if (!silent) {
      analytics.value = null
      analyticsError.value = null
    }

    if (!templates.value.length) {
      return
    }

    analyticsLoading.value = !silent

    try {
      const result = await api<Analytics>(`/api/analytics?ids=${templates.value.map(entry => entry.id).join(',')}`)

      if (mine === ticket) {
        analytics.value = result
        analyticsError.value = null
      }
    }
    catch (error) {
      if (mine === ticket && !silent) {
        analyticsError.value = (error as Error).message
      }
    }
    finally {
      if (mine === ticket) {
        analyticsLoading.value = false
      }
    }
  }

  async function enableAnalytics(): Promise<void> {
    await api('/api/analytics/enable', { method: 'POST' })
    await loadAnalytics()
  }

  async function reloadTemplates(): Promise<void> {
    const account = accountId.value

    try {
      const result = await api<{ data: MetaTemplate[], quota: TemplateQuota | null }>('/api/templates')

      templatesFor.value = account
      templates.value = result.data
      templateQuota.value = result.quota
      templatesError.value = null
      lastLoadedAt.value = Date.now()
    }
    catch (error) {
      templatesError.value = (error as Error).message
    }
  }

  const statsFor = (ids: string[]): TemplateStats | null => {
    if (!analytics.value) {
      return null
    }

    const total: TemplateStats = { sent: 0, delivered: 0, read: 0, clicked: 0, cost: 0, daily: [] }
    const byDay = new Map<string, number>()

    for (const id of ids) {
      const entry = analytics.value.data[id]

      if (!entry) {
        continue
      }

      total.sent += entry.sent
      total.delivered += entry.delivered
      total.read += entry.read
      total.clicked += entry.clicked
      total.cost += entry.cost

      for (const day of entry.daily) {
        byDay.set(day.date, (byDay.get(day.date) ?? 0) + day.sent)
      }
    }

    total.daily = [...byDay].sort(([a], [b]) => a.localeCompare(b)).map(([date, sent]) => ({ date, sent }))

    return total
  }

  async function switchAccount(id: string): Promise<void> {
    const same = screen.value === 'account' && accountId.value === id && templatesFor.value === id

    screen.value = 'account'
    accountId.value = id

    if (!same) {
      await loadAccountData()
    }
  }

  const findTemplate = (name: string, language: string) => templates.value.find(entry => entry.name === name && entry.language === language)

  function managerUrl(): string {
    const business = overview.value?.account?.owner_business_info?.id
    const query = new URLSearchParams({ waba_id: current.value?.waba_id ?? '', ...(business ? { business_id: business } : {}) })

    return `https://business.facebook.com/wa/manage/message-templates/?${query}`
  }

  return {
    accountTab,
    accounts,
    storage,
    accountId,
    current,
    templates,
    templatesError,
    templateQuota,
    overview,
    overviewError,
    loading,
    templatesFor,
    lastLoadedAt,
    screen,
    summary,
    summaryError,
    summaryLoading,
    summaryLoadedAt,
    loadSummary,
    showOverview,
    analytics,
    analyticsError,
    analyticsLoading,
    statsFor,
    loadAnalytics,
    enableAnalytics,
    groups,
    api,
    loadAccounts,
    loadAccountData,
    reloadTemplates,
    switchAccount,
    findTemplate,
    managerUrl,
  }
}
