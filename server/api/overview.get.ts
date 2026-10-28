export default apiHandler((event) => {
  const account = requireAccount(event)

  return cached(account, 'overview', () => accountOverview(account), wantsFresh(event))
})
