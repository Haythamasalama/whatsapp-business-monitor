export default apiHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const file = accountFiles()[id]

  if (!file) {
    throw apiError(404, t('server.accountMissing'))
  }

  // An empty token field keeps the stored one, so editing the name never needs the token again.
  const values = readAccountValues(await readBody<Record<string, unknown>>(event), loadAccount(id))
  const problems = accountProblems(values)

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  const check = orFail(await graph(values, 'GET', values.waba, { fields: 'name' }), 422)

  writeAccount(file, values)

  return { id, name: check.name ?? null }
})
