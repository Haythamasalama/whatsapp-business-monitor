export default apiHandler((event) => {
  const account = requireAccount(event)
  const query = requireReportQuery(event)

  // Meta's numbers move slowly, so the database answers for 10 minutes (see CACHE_AGES).
  return cached(account, `reports:traffic:${JSON.stringify(query)}`, () => trafficReport(account, query), wantsFresh(event))
})
