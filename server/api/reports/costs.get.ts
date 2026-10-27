export default apiHandler((event) => {
  const account = requireAccount(event)
  const query = requireReportQuery(event)

  return cached(`costs:${account.id}:${JSON.stringify(query)}`, () => costReport(account, query))
})
