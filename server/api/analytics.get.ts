const DAYS = 30
const BATCH = 10
const MAX_PAGES = 20

function addPoint(stats: Record<string, TemplateStats>, point: GraphResponse): void {
  const entry = (stats[String(point.template_id)] ??= { sent: 0, delivered: 0, read: 0, clicked: 0, cost: 0, daily: [] })
  const sent = Number(point.sent ?? 0)

  entry.sent += sent
  entry.delivered += Number(point.delivered ?? 0)
  entry.read += Number(point.read ?? 0)
  entry.clicked += (point.clicked ?? []).reduce((sum: number, click: GraphResponse) => sum + Number(click.count ?? 0), 0)
  entry.cost += Number((point.cost ?? []).find((cost: GraphResponse) => cost.type === 'amount_spent')?.value ?? 0)
  entry.daily.push({ date: new Date(Number(point.start) * 1000).toISOString().slice(0, 10), sent })
}

export default apiHandler(async (event): Promise<Analytics> => {
  const account = requireAccount(event)
  const ids = String(getQuery(event).ids ?? '').split(',').filter(id => /^\d+$/.test(id))
  const now = new Date()
  const start = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (DAYS - 1)) / 1000)
  const end = Math.floor(now.getTime() / 1000)
  const stats: Record<string, TemplateStats> = {}

  // Meta takes at most 10 template ids per request.
  const batches = Array.from({ length: Math.ceil(ids.length / BATCH) }, (_, i) => ids.slice(i * BATCH, (i + 1) * BATCH))

  await Promise.all(batches.map(async (batch) => {
    let after: string | undefined

    for (let page = 0; page < MAX_PAGES; page++) {
      const response = orFail(await graph(account, 'GET', `${account.waba}/template_analytics`, {
        start,
        end,
        granularity: 'DAILY',
        metric_types: 'sent,delivered,read,cost,clicked',
        template_ids: `[${batch.join(',')}]`,
        limit: 1000,
        after,
      }))

      for (const series of response.data ?? []) {
        for (const point of series.data_points ?? []) {
          addPoint(stats, point)
        }
      }

      after = response.paging?.cursors?.after

      if (!response.paging?.next) {
        break
      }
    }
  }))

  for (const entry of Object.values(stats)) {
    entry.cost = Math.round(entry.cost * 10_000) / 10_000
    entry.daily.sort((a, b) => a.date.localeCompare(b.date))
  }

  return { data: stats, days: DAYS }
})
