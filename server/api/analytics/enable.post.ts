// Meta keeps template analytics on for good once confirmed; the page asks the user before calling this.
export default apiHandler(async (event) => {
  const account = requireAccount(event)

  return orFail(await graph(account, 'POST', account.waba, { is_enabled_for_insights: 'true' }))
})
