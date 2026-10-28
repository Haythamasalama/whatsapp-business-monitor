import type { H3Event } from 'h3'

const round = (value: number) => Math.round(value * 10_000) / 10_000

/** A time bucket's key: the month, the day, or the half hour, in UTC. */
export function bucketKey(unix: number, granularity: string): string {
  const iso = new Date(unix * 1000).toISOString()

  if (granularity === 'MONTHLY') {
    return iso.slice(0, 7)
  }

  return granularity === 'HALF_HOUR' ? iso.slice(0, 16) : iso.slice(0, 10)
}

function filters(query: ReportQuery): string {
  return `${query.phone ? `.phone_numbers(["${query.phone}"])` : ''}${query.country ? `.country_codes(["${query.country}"])` : ''}`
}

function add(map: Map<string, ReportSlice>, key: string, cost: number, messages: number): void {
  const slice = map.get(key) ?? { key, cost: 0, messages: 0 }

  slice.cost += cost
  slice.messages += messages
  map.set(key, slice)
}

const sorted = (map: Map<string, ReportSlice>) => [...map.values()]
  .map(slice => ({ ...slice, cost: round(slice.cost) }))
  .sort((a, b) => b.cost - a.cost || b.messages - a.messages)

export async function costReport(account: Account, query: ReportQuery): Promise<CostReport> {
  const { start, end } = reportWindow(query.days)
  const now = new Date()
  const monthStart = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1) / 1000)
  // TIER only comes back together with PRICING_CATEGORY and COUNTRY.
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/analytics#pricing-analytics
  const field = `pricing_analytics.start(${start}).end(${end}).granularity(${query.granularity})${filters(query)}.dimensions(["COUNTRY","PHONE","PRICING_CATEGORY","PRICING_TYPE","TIER"])`
  // The free tier is counted per number per calendar month, whatever range the page shows.
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing#free-tier-of-monthly-service-messages
  const freeField = `pricing_analytics.start(${monthStart}).end(${end}).granularity(MONTHLY).pricing_types(["FREE_CUSTOMER_SERVICE"]).dimensions(["PHONE"])`

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-account/whatsapp-business-account-api
  const [pricing, free] = await Promise.all([
    graph(account, 'GET', account.waba, { fields: `currency,${field}` }),
    graph(account, 'GET', account.waba, { fields: freeField }),
  ])

  orFail(pricing)

  const series = new Map<string, ReportSlice>()
  const byCountry = new Map<string, ReportSlice>()
  const byPhone = new Map<string, ReportSlice>()
  const byType = new Map<string, ReportSlice>()
  const byCategory = new Map<string, ReportSlice>()
  const tiers = new Map<string, CostReport['tiers'][number]>()
  let total = 0
  let messages = 0

  for (const block of pricing.pricing_analytics?.data ?? []) {
    for (const point of block.data_points ?? []) {
      const cost = Number(point.cost ?? 0)
      const volume = Number(point.volume ?? 0)

      total += cost
      messages += volume
      add(series, bucketKey(Number(point.start), query.granularity), cost, volume)
      add(byCountry, String(point.country ?? '—'), cost, volume)
      add(byPhone, String(point.phone_number ?? '—'), cost, volume)
      add(byType, String(point.pricing_type ?? 'REGULAR'), cost, volume)
      add(byCategory, String(point.pricing_category ?? 'ALL'), cost, volume)

      const tier = point.tier ? parseTier(String(point.tier)) : null

      // Marketing is always 0:MAX: it has no volume tiers, so it says nothing worth showing.
      if (tier && tier.upper !== null) {
        const key = `${point.country}:${point.pricing_category}`
        const entry = tiers.get(key) ?? { country: String(point.country), category: String(point.pricing_category), ...tier, volume: 0 }

        entry.volume += volume
        tiers.set(key, entry)
      }
    }
  }

  const freeUsed = new Map<string, number>()

  for (const block of free.pricing_analytics?.data ?? []) {
    for (const point of block.data_points ?? []) {
      const phone = String(point.phone_number ?? '—')

      freeUsed.set(phone, (freeUsed.get(phone) ?? 0) + Number(point.volume ?? 0))
    }
  }

  return {
    currency: pricing.currency ?? null,
    granularity: query.granularity,
    total: round(total),
    messages,
    series: [...series.values()].map(slice => ({ ...slice, cost: round(slice.cost) })).sort((a, b) => a.key.localeCompare(b.key)),
    by_country: sorted(byCountry),
    by_phone: sorted(byPhone),
    by_pricing_type: sorted(byType),
    by_category: sorted(byCategory),
    tiers: [...tiers.values()],
    free_service: [...freeUsed].map(([phone, used]) => ({ phone, used })),
  }
}

const PRODUCT_TYPES = { template: 0, non_template: 2, incoming: 100 } as const

export async function trafficReport(account: Account, query: ReportQuery): Promise<TrafficReport> {
  const { start, end } = reportWindow(query.days)
  // analytics spells its granularity DAY and MONTH, unlike pricing_analytics.
  const granularity = { HALF_HOUR: 'HALF_HOUR', DAILY: 'DAY', MONTHLY: 'MONTH' }[query.granularity]
  const kinds = Object.keys(PRODUCT_TYPES) as (keyof typeof PRODUCT_TYPES)[]

  // One request per product type, since the answer doesn't say which type a point belongs to.
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/analytics#messaging-analytics
  const answers = await Promise.all(kinds.map(kind => graph(account, 'GET', account.waba, {
    fields: `analytics.start(${start}).end(${end}).granularity(${granularity})${filters(query)}.product_types([${PRODUCT_TYPES[kind]}])`,
  })))

  answers.forEach(answer => orFail(answer))

  const types = Object.fromEntries(kinds.map(kind => [kind, { sent: 0, delivered: 0 }])) as TrafficReport['types']
  const series = new Map<string, TrafficReport['series'][number]>()
  const phones = new Set<string>()
  const countries = new Set<string>()

  answers.forEach((answer, index) => {
    const kind = kinds[index]!

    for (const phone of answer.analytics?.phone_numbers ?? []) {
      phones.add(String(phone))
    }

    for (const country of answer.analytics?.country_codes ?? []) {
      countries.add(String(country))
    }

    for (const point of answer.analytics?.data_points ?? []) {
      const key = bucketKey(Number(point.start), query.granularity)
      const bucket = series.get(key) ?? { key, template: 0, non_template: 0, incoming: 0 }
      // Incoming messages are counted as "sent" by the customer; delivered stays empty for them.
      const sent = Number(point.sent ?? 0)

      types[kind].sent += sent
      types[kind].delivered += Number(point.delivered ?? 0)
      bucket[kind] += sent
      series.set(key, bucket)
    }
  })

  return {
    granularity: query.granularity,
    types,
    series: [...series.values()].sort((a, b) => a.key.localeCompare(b.key)),
    phones: [...phones].sort(),
    countries: [...countries].sort(),
  }
}

export async function compareTemplates(account: Account, target: string, other: string, days: number): Promise<TemplateComparison> {
  const end = Math.floor(Date.now() / 1000)
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-comparison
  const response = orFail(await graph(account, 'GET', `${target}/compare`, { template_ids: `[${other}]`, start: end - days * 86_400, end }))
  const metric = (name: string) => (response.data ?? []).find((entry: GraphResponse) => entry.metric === name) ?? {}

  return {
    days,
    ranking: (metric('BLOCK_RATE').order_by_relative_metric ?? []).map(String),
    sends: Object.fromEntries((metric('MESSAGE_SENDS').number_values ?? []).map((entry: GraphResponse) => [String(entry.key), Number(entry.value ?? 0)])),
    top_block_reason: Object.fromEntries((metric('TOP_BLOCK_REASON').string_values ?? []).map((entry: GraphResponse) => [String(entry.key), String(entry.value ?? '')])),
  }
}

/** Template group and template analytics only look back 90 days. */
const GROUP_DAYS_MAX = 90

const clickCount = (clicks: GraphResponse[] = []) => clicks.reduce((sum, click) => sum + Number(click.count ?? click.value ?? 0), 0)

export async function templateGroupReport(account: Account, days: number): Promise<TemplateGroupReport> {
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-groups
  const list = await graph(account, 'GET', `${account.waba}/template_groups`, { fields: 'id,name,description,templates', limit: 100 })

  // An account without groups, or an API version without the edge, simply has nothing to show.
  if (list.error || !list.data?.length) {
    return { groups: [] }
  }

  const groups = new Map<string, TemplateGroupReport['groups'][number]>(list.data.map((group: GraphResponse) => [String(group.id), {
    id: String(group.id),
    name: String(group.name ?? group.id),
    description: group.description ? String(group.description) : undefined,
    templates: Array.isArray(group.templates?.data ?? group.templates) ? (group.templates.data ?? group.templates).length : 0,
    sent: 0,
    delivered: 0,
    read: 0,
    clicked: 0,
    cost: 0,
  }]))
  const ids = [...groups.keys()]
  const end = Math.floor(Date.now() / 1000)
  const start = end - Math.min(days, GROUP_DAYS_MAX) * 86_400
  const batches = Array.from({ length: Math.ceil(ids.length / TEMPLATE_GROUPS_MAX) }, (_, i) => ids.slice(i * TEMPLATE_GROUPS_MAX, (i + 1) * TEMPLATE_GROUPS_MAX))

  await Promise.all(batches.map(async (batch) => {
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/analytics#template-group-analytics
    const response = await graph(account, 'GET', `${account.waba}/template_group_analytics`, {
      granularity: 'daily',
      start,
      end,
      metric_types: 'sent,delivered,read,clicked,cost',
      template_group_ids: `[${batch.join(',')}]`,
    })

    for (const block of response.data ?? []) {
      for (const point of block.data_points ?? []) {
        const group = groups.get(String(point.template_group_id))

        if (group) {
          group.sent += Number(point.sent ?? 0)
          group.delivered += Number(point.delivered ?? 0)
          group.read += Number(point.read ?? 0)
          group.clicked += clickCount(point.clicked)
          group.cost += Number((point.cost ?? []).find((cost: GraphResponse) => cost.type === 'amount_spent')?.value ?? 0)
        }
      }
    }
  }))

  return { groups: [...groups.values()].map(group => ({ ...group, cost: round(group.cost) })).sort((a, b) => b.sent - a.sent) }
}

export async function callReport(account: Account, query: ReportQuery): Promise<CallReport> {
  const { start, end } = reportWindow(query.days)
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/analytics#call-analytics
  const response = await graph(account, 'GET', account.waba, {
    fields: `call_analytics.start(${start}).end(${end}).granularity(${query.granularity})${filters(query)}.metric_types(["COUNT","COST","AVERAGE_DURATION"])`,
  })

  // Calling isn't on for every account; no calls is shown as nothing at all, not as an error.
  if (response.error) {
    return { count: 0, cost: 0, average_duration: 0, series: [] }
  }

  const series = new Map<string, CallReport['series'][number]>()
  let calls = 0
  let cost = 0
  let seconds = 0

  for (const point of response.call_analytics?.data_points ?? []) {
    const key = bucketKey(Number(point.start), query.granularity)
    const bucket = series.get(key) ?? { key, count: 0, cost: 0 }
    const number = Number(point.count ?? 0)

    calls += number
    cost += Number(point.cost ?? 0)
    seconds += number * Number(point.average_duration ?? 0)
    bucket.count += number
    bucket.cost = round(bucket.cost + Number(point.cost ?? 0))
    series.set(key, bucket)
  }

  return {
    count: calls,
    cost: round(cost),
    average_duration: calls ? Math.round(seconds / calls) : 0,
    series: [...series.values()].sort((a, b) => a.key.localeCompare(b.key)),
  }
}

export function requireReportQuery(event: H3Event): ReportQuery {
  const { query, problems } = readReportQuery(getQuery(event))

  failOn(problems)

  return query
}
