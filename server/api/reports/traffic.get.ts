export default apiHandler((event) => {
  const account = requireAccount(event)
  const query = requireReportQuery(event)

  return cached(`traffic:${account.id}:${JSON.stringify(query)}`, () => trafficReport(account, query))
})
