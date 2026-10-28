export default apiHandler((event) => {
  const account = requireAccount(event)
  const { days } = requireReportQuery(event)

  return cached(`groups:${account.id}:${days}`, () => templateGroupReport(account, days))
})
