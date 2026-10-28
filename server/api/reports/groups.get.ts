export default apiHandler((event) => {
  const account = requireAccount(event)
  const { days } = requireReportQuery(event)

  return cached(account, `reports:groups:${days}`, () => templateGroupReport(account, days), wantsFresh(event))
})
