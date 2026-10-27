export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const id = String(body.id ?? '').trim().toLowerCase()
  const values = readAccountValues(body)

  const problems = [
    ACCOUNT_ID.test(id) && id !== 'discover' ? null : 'الاسم المختصر: أحرف إنجليزية صغيرة وأرقام و - و _ فقط',
    accountFiles()[id] ? 'يوجد حساب بهذا الاسم المختصر' : null,
    ...accountProblems(values),
  ].filter(Boolean)

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  const check = orFail(await graph(values, 'GET', values.waba, { fields: 'name' }), 422)

  writeAccount(newAccountFile(id), values)

  return { id, name: check.name ?? null }
})
