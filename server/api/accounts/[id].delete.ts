export default apiHandler((event) => {
  const id = String(getRouterParam(event, 'id') ?? '')

  if (!deleteAccount(id)) {
    throw apiError(404, t('server.accountMissing'))
  }

  return { id }
})
