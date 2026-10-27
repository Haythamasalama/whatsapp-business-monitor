export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/username
  const response = orFail(await graph(account, 'GET', `${phone}/username_suggestions`))
  const rows: unknown[] = response.data ?? []
  const names = rows.flatMap(row => (typeof row === 'string'
    ? [row]
    : [(row as Record<string, unknown>).username, ...((row as Record<string, unknown>).username_suggestions as unknown[] ?? [])]))

  return { data: [...new Set(names.filter((name): name is string => typeof name === 'string'))].slice(0, 10) }
})
