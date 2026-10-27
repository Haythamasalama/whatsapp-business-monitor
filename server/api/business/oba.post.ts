export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const input = readOba(await readBody<Record<string, unknown>>(event))

  failOn(obaProblems(input))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/official-business-accounts
  return orFail(await graph(account, 'POST', `${phone}/official_business_account`, {}, {
    ...input,
    parent_business_or_brand: input.parent_business_or_brand || undefined,
    additional_supporting_information: input.additional_supporting_information || undefined,
  }))
})
