export default apiHandler((event) => {
  const after = String(getQuery(event).after ?? '')

  if (after && !/^[\w=-]{1,512}$/.test(after)) {
    throw apiError(400, t('business.errors.cursor'))
  }

  return activities(requireAccount(event), after || undefined)
})
