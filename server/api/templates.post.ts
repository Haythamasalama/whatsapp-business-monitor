export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const body = await readBody<Record<string, unknown>>(event)
  const name = String(body.name ?? '')
  const category = String(body.category ?? '')
  const language = String(body.language ?? '')
  const text = readTemplateText(body)

  const problems = [
    TEMPLATE_NAME.test(name) ? null : 'الاسم: أحرف إنجليزية صغيرة وأرقام و _ فقط',
    CATEGORIES.some(value => value === category) ? null : 'التصنيف غير صالح',
    /^[a-z]{2,3}(_[A-Z]{2})?$/.test(language) ? null : 'رمز اللغة غير صالح',
    ...templateProblems(text),
  ].filter(Boolean)

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  return orFail(await graph(account, 'POST', `${account.waba}/message_templates`, {}, {
    name,
    language,
    category,
    parameter_format: 'POSITIONAL',
    components: textComponents(text),
  }))
})
