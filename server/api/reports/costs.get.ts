export default apiHandler((event) => {
  const account = requireAccount(event)
  const query = requireReportQuery(event)

  // Meta's numbers move slowly, so the database answers for 10 minutes (see CACHE_AGES).
  return cached(account, `reports:costs:${JSON.stringify(query)}`, () => costReport(account, query), wantsFresh(event))
})
