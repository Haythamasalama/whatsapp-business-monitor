export default apiHandler(async (event): Promise<Overview> => {
  const account = requireAccount(event)
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
})
