import type { H3Event } from 'h3'

// Fictional reports for demo mode. The numbers follow the store's template sends so the tabs agree.

const COUNTRIES = [['SA', 0.62], ['AE', 0.18], ['KW', 0.11], ['EG', 0.09]] as const
const PRICING_TYPES = [['REGULAR', 0.58], ['FREE_CUSTOMER_SERVICE', 0.34], ['FREE_ENTRY_POINT', 0.08]] as const

const wave = (seed: number) => 0.6 + 0.4 * Math.abs(Math.sin(seed * 12.9898) * 1.7 % 1)

/** The window's buckets, oldest first, with each bucket's share of a day. */
function buckets(query: ReportQuery): { key: string, start: number, days: number }[] {
  const { start, end } = reportWindow(query.days)
  const step = query.granularity === 'HALF_HOUR' ? 1800 : 86_400
  const list = new Map<string, { key: string, start: number, days: number }>()

  for (let at = start; at < end; at += step) {
    const key = bucketKey(at, query.granularity)
    const bucket = list.get(key) ?? { key, start: at, days: 0 }

    bucket.days += step / 86_400
    list.set(key, bucket)
  }

  return [...list.values()]
}

function dailyMessages(base: ReturnType<typeof demoReportBase>): number {
  return base.templates.reduce((sum, template) => sum + template.daily, 0)
}

export function demoCostReport(event: H3Event): CostReport {
  const query = requireReportQuery(event)
  const base = demoReportBase(getQuery(event).account)
  const perDay = dailyMessages(base) / PRICING_TYPES[0][1]
  const series = buckets(query).map((bucket, index) => {
    const messages = Math.round(perDay * bucket.days * wave(index + 3))

    return { key: bucket.key, messages, cost: Math.round(messages * PRICING_TYPES[0][1] * 0.024 * 100) / 100 }
  })
  const messages = series.reduce((sum, slice) => sum + slice.messages, 0)
  const total = Math.round(series.reduce((sum, slice) => sum + slice.cost, 0) * 100) / 100
  const share = (list: readonly (readonly [string, number])[], paid: boolean) => list.map(([key, part]) => ({
    key,
    messages: Math.round(messages * part),
    cost: paid ? Math.round(total * part * 100) / 100 : 0,
  }))
  const country = query.country ? COUNTRIES.filter(([code]) => code === query.country) : COUNTRIES
  const byType = share(PRICING_TYPES, false).map(slice => (slice.key === 'REGULAR' ? { ...slice, cost: total } : slice))
  // Most of the month's free tier used, so the card shows what running low looks like.
  const freeUsed = Math.min(FREE_SERVICE_MESSAGES, Math.round(FREE_SERVICE_MESSAGES * 0.9 * new Date().getUTCDate() / 31))

  return {
    currency: 'USD',
    granularity: query.granularity,
    total,
    messages,
    series,
    by_country: share(country.length ? country : COUNTRIES, true),
    by_phone: [{ key: base.phone, cost: total, messages }],
    by_pricing_type: byType,
    by_category: [
      { key: 'MARKETING', cost: Math.round(total * 0.71 * 100) / 100, messages: Math.round(messages * 0.27) },
      { key: 'UTILITY', cost: Math.round(total * 0.22 * 100) / 100, messages: Math.round(messages * 0.24) },
      { key: 'AUTHENTICATION', cost: Math.round(total * 0.07 * 100) / 100, messages: Math.round(messages * 0.07) },
      { key: 'SERVICE', cost: 0, messages: Math.round(messages * 0.42) },
    ],
    tiers: [
      { country: 'SA', category: 'UTILITY', lower: 0, upper: 100_000, volume: Math.round(messages * 0.15) },
      { country: 'SA', category: 'AUTHENTICATION', lower: 0, upper: 250_000, volume: Math.round(messages * 0.05) },
    ],
    free_service: [{ phone: base.phone, used: freeUsed }],
  }
}

export function demoTrafficReport(event: H3Event): TrafficReport {
  const query = requireReportQuery(event)
  const base = demoReportBase(getQuery(event).account)
  const perDay = dailyMessages(base)
  const series = buckets(query).map((bucket, index) => ({
    key: bucket.key,
    template: Math.round(perDay * bucket.days * wave(index + 1)),
    non_template: Math.round(perDay * 0.8 * bucket.days * wave(index + 7)),
    incoming: Math.round(perDay * 1.3 * bucket.days * wave(index + 11)),
  }))
  const total = (kind: 'template' | 'non_template' | 'incoming') => series.reduce((sum, bucket) => sum + bucket[kind], 0)

  return {
    granularity: query.granularity,
    types: {
      template: { sent: total('template'), delivered: Math.round(total('template') * 0.96) },
      non_template: { sent: total('non_template'), delivered: Math.round(total('non_template') * 0.98) },
      incoming: { sent: total('incoming'), delivered: 0 },
    },
    series,
    phones: [base.phone],
    countries: COUNTRIES.map(([code]) => code),
  }
}

const BLOCK_REASONS = ['NO_LONGER_NEEDED', 'SPAM', 'NO_SIGN_UP', 'NO_REASON_GIVEN']

export function demoCompare(event: H3Event): TemplateComparison {
  const query = getQuery(event)
  const target = String(query.template ?? '')
  const other = String(query.other ?? '')
  const days = Number(query.days ?? 30)

  failOn(compareProblems(target, other, days))

  const base = demoReportBase(query.account)
  const sends = (id: string) => Math.round((base.templates.find(template => template.id === id)?.daily ?? 0) * days)
  const ids = [target, other]

  // Meta answers nothing when a template was sent fewer than 1,000 times; the page explains why.
  if (ids.some(id => sends(id) < COMPARE_MIN_SENDS)) {
    return { days, ranking: [], sends: {}, top_block_reason: {} }
  }

  const blockRate = (id: string) => wave(Number(id.slice(-4))) * (base.templates.find(template => template.id === id)?.category === 'MARKETING' ? 2 : 1)

  return {
    days,
    ranking: [...ids].sort((a, b) => blockRate(a) - blockRate(b)),
    sends: Object.fromEntries(ids.map(id => [id, sends(id)])),
    top_block_reason: Object.fromEntries(ids.map(id => [id, BLOCK_REASONS[Number(id.slice(-2)) % BLOCK_REASONS.length]!])),
  }
}

export function demoTemplateGroups(event: H3Event): TemplateGroupReport {
  const { days } = requireReportQuery(event)
  const base = demoReportBase(getQuery(event).account)
  const window = Math.min(days, 90)
  const group = (id: string, name: string, description: string, names: string[]) => {
    const members = base.templates.filter(template => names.includes(template.name))
    const sent = Math.round(members.reduce((sum, template) => sum + template.daily, 0) * window)
    const delivered = Math.round(sent * 0.97)

    return {
      id,
      name,
      description,
      templates: members.length,
      sent,
      delivered,
      read: Math.round(delivered * 0.78),
      clicked: Math.round(delivered * 0.09),
      cost: Math.round(members.reduce((sum, template) => sum + template.daily * window * (base.cost[template.category] ?? 0), 0) * 100) / 100,
    }
  }

  return {
    groups: [
      group('300000000000001', t('reports.demo.ordersGroup'), t('reports.demo.ordersGroupHint'), ['order_confirmation', 'shipping_update', 'payment_reminder']),
      group('300000000000002', t('reports.demo.offersGroup'), t('reports.demo.offersGroupHint'), ['weekend_offer', 'review_request', 'back_in_stock']),
    ].sort((a, b) => b.sent - a.sent),
  }
}

export function demoCalls(event: H3Event): CallReport {
  const query = requireReportQuery(event)
  const base = demoReportBase(getQuery(event).account)
  const series = buckets(query).map((bucket, index) => {
    const calls = Math.round(18 * base.scale * bucket.days * wave(index + 5))

    return { key: bucket.key, count: calls, cost: Math.round(calls * 0.012 * 100) / 100 }
  })

  return {
    count: series.reduce((sum, bucket) => sum + bucket.count, 0),
    cost: Math.round(series.reduce((sum, bucket) => sum + bucket.cost, 0) * 100) / 100,
    average_duration: 134,
    series,
  }
}
