export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const body = await readBody<Record<string, unknown>>(event)
  const name = String(body.name ?? '')
  const category = String(body.category ?? '')
  const language = String(body.language ?? '')
  const text = readTemplateText(body)

  const problems = [
    TEMPLATE_NAME.test(name) ? null : t('rules.nameFormat'),
    CATEGORIES.some(value => value === category) ? null : t('rules.categoryInvalid'),
    /^[a-z]{2,3}(_[A-Z]{2})?$/.test(language) ? null : t('rules.languageInvalid'),
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
