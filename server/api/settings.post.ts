export default apiHandler(async (event) => {
  const { values, problems } = readSettingsInput(await readBody<Record<string, unknown>>(event))

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  writeSettings(values)

  return { ok: true }
})
