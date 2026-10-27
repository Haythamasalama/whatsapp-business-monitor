export default apiHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const id = String(body.id ?? '').trim().toLowerCase()
  const values = readAccountValues(body)

  const problems = [
    ACCOUNT_ID.test(id) && !RESERVED_IDS.includes(id) ? null : t('server.accountIdFormat'),
    accountFiles()[id] ? t('server.accountIdTaken') : null,
    ...accountProblems(values),
  ].filter(Boolean)

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  const check = orFail(await graph(values, 'GET', values.waba, { fields: 'name' }), 422)

  writeAccount(newAccountFile(id), values)

  return { id, name: check.name ?? null }
})
