const MAX_PAGES = 20

export async function accountOverview(account: Account): Promise<Overview> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const window = `pricing_analytics.start(${Math.floor(monthStart.getTime() / 1000)}).end(${Math.floor(now.getTime() / 1000)}).granularity(DAILY)`

  const [waba, phones, pricing] = await Promise.all([
    graphFields(account, account.waba, ['name,currency,timezone_id,account_review_status,owner_business_info', 'name,currency']),
    graphFields(account, `${account.waba}/phone_numbers`, [
      'display_phone_number,verified_name,quality_rating,messaging_limit_tier,status',
      'display_phone_number,verified_name,quality_rating',
    ]),
    graphFields(account, account.waba, [`${window}.dimensions(["PRICING_CATEGORY"])`, window]),
  ])

  const businessId = waba.owner_business_info?.id
  const credit = businessId
    ? await graphFields(account, `${businessId}/extendedcredits`, [
        'id,legal_entity_name,balance,credit_available,max_balance',
        'id,legal_entity_name',
      ])
    : null

  return {
    account: waba,
    phones,
    spend: pricing.error ? { error: pricing.error } : sumSpend(pricing, monthStart, now, waba.currency ?? null),
    credit,
  }
}

export async function listTemplates(account: Account, fieldSets: string[]): Promise<MetaTemplate[]> {
  const templates: MetaTemplate[] = []
  let after: string | undefined

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = orFail(await graphFields(account, `${account.waba}/message_templates`, fieldSets, { limit: 100, after }))

    templates.push(...(response.data ?? []))
    after = response.paging?.cursors?.after

    if (!response.paging?.next) {
      break
    }
  }

  return templates
}

/** Counts templates by name, as the table does: a template is "pending" when any of its languages is. */
export function templateCounts(templates: Pick<MetaTemplate, 'name' | 'status'>[]): TemplateCounts {
  const statuses: Record<string, Set<string>> = {}

  for (const template of templates) {
    (statuses[template.status] ??= new Set()).add(template.name)
  }

  return {
    total: new Set(templates.map(template => template.name)).size,
    statuses: Object.fromEntries(Object.entries(statuses).map(([status, names]) => [status, names.size])),
  }
}
