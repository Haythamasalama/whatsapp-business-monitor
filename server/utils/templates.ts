export function textComponents(values: TemplateText): MetaComponent[] {
  const components: MetaComponent[] = []
  const examples = (values.examples ?? []).map(String)

  if (values.header) {
    components.push({ type: 'HEADER', format: 'TEXT', text: values.header })
  }

  components.push({
    type: 'BODY',
    text: values.body,
    ...(examples.length ? { example: { body_text: [examples] } } : {}),
  })

  if (values.footer) {
    components.push({ type: 'FOOTER', text: values.footer })
  }

  return components
}

const dayKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export function sumSpend(pricing: GraphResponse, from: Date, to: Date, currency: string | null): Spend {
  const byCategory: Spend['by_category'] = {}
  const byDay = new Map<string, { cost: number, messages: number }>()
  let total = 0
  let messages = 0

  for (let day = new Date(from); day <= to; day.setDate(day.getDate() + 1)) {
    byDay.set(dayKey(day), { cost: 0, messages: 0 })
  }

  for (const series of pricing.pricing_analytics?.data ?? []) {
    for (const point of series.data_points ?? []) {
      const cost = Number(point.cost ?? 0)
      const volume = Number(point.volume ?? 0)
      const category = point.pricing_category ?? 'ALL'
      const bucket = (byCategory[category] ??= { cost: 0, messages: 0 })
      const day = byDay.get(dayKey(new Date(Number(point.start) * 1000)))

      total += cost
      messages += volume
      bucket.cost += cost
      bucket.messages += volume

      if (day) {
        day.cost += cost
        day.messages += volume
      }
    }
  }

  return {
    since: dayKey(from),
    currency,
    total: Math.round(total * 10_000) / 10_000,
    messages,
    by_category: byCategory,
    daily: [...byDay].map(([date, day]) => ({ date, cost: Math.round(day.cost * 10_000) / 10_000, messages: day.messages })),
  }
}

export function readTemplateText(body: Record<string, unknown>): TemplateText {
  return {
    header: String(body.header ?? ''),
    body: String(body.body ?? ''),
    footer: String(body.footer ?? ''),
    examples: Array.isArray(body.examples) ? body.examples.map(String) : [],
  }
}
