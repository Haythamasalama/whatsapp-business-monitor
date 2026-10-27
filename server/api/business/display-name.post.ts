export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const name = readText((await readBody<Record<string, unknown>>(event)).name)

  failOn(displayNameProblems(name))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/display-names
  return orFail(await graph(account, 'POST', phone, { new_display_name: name }))
})
