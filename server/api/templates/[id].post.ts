export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const id = getRouterParam(event, 'id') ?? ''

  if (!/^\d+$/.test(id)) {
    throw apiError(404, 'Not found')
  }

  const current = orFail(await graph(account, 'GET', id, { fields: 'id,name,language,status,parameter_format,components' }))

  if (!EDITABLE_STATUSES.includes(current.status)) {
    throw apiError(422, t('server.editStatus', { status: current.status }))
  }

  if ((current.parameter_format ?? 'POSITIONAL') !== 'POSITIONAL') {
    throw apiError(422, t('server.editNamed'))
  }

  const text = readTemplateText(await readBody<Record<string, unknown>>(event))
  const problems = templateProblems(text)

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  // Buttons and media headers are not edited here, so they go back to Meta exactly as they came.
  const components: MetaComponent[] = current.components ?? []
  const mediaHeader = components.filter(c => c.type === 'HEADER' && (c.format ?? 'TEXT') !== 'TEXT')
  const rest = components.filter(c => !['HEADER', 'BODY', 'FOOTER'].includes(c.type))

  return orFail(await graph(account, 'POST', id, {}, {
    components: [...mediaHeader, ...textComponents(mediaHeader.length ? { ...text, header: '' } : text), ...rest],
  }))
})
