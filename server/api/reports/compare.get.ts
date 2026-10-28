export default apiHandler((event) => {
  const account = requireAccount(event)
  const query = getQuery(event)
  const target = String(query.template ?? '')
  const other = String(query.other ?? '')
  const days = Number(query.days ?? 30)
  const problems = compareProblems(target, other, days)

  failOn(problems)

  return cached(account, `reports:compare:${target}:${other}:${days}`, () => compareTemplates(account, target, other, days), wantsFresh(event))
})
