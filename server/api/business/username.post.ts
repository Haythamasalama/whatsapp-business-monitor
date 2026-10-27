export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const username = readText((await readBody<Record<string, unknown>>(event)).username).toLowerCase()

  failOn(usernameProblems(username))

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/username
  return orFail(await graph(account, 'POST', `${phone}/username`, {}, { username }))
})
