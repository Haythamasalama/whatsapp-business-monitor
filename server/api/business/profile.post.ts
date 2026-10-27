export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const profile = readProfile(await readBody<Record<string, unknown>>(event))

  failOn(profileProblems(profile))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles
  return orFail(await graph(account, 'POST', `${phone}/whatsapp_business_profile`, {}, {
    messaging_product: 'whatsapp',
    ...profile,
    vertical: profile.vertical || undefined,
  }))
})
