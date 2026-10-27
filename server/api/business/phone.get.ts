export default apiHandler(async (event) => {
  const account = requireAccount(event)

  return phoneSettings(account, await requirePhone(event, account))
})
