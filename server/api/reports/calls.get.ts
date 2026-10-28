export default apiHandler((event) => {
  const account = requireAccount(event)
  const query = requireReportQuery(event)

  return cached(`calls:${account.id}:${JSON.stringify(query)}`, () => callReport(account, query))
})
