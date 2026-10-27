export default apiHandler((event) => {
  const account = requireAccount(event)

  return cached(account, 'business', () => businessDetails(account), wantsFresh(event))
})
