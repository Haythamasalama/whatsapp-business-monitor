export default apiHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)
  const token = String(body.token ?? '').trim()
  const account = { token, version: String(body.version ?? '').trim() || DEFAULT_VERSION }

  if (!/^v\d+\.\d+$/.test(account.version)) {
    throw apiError(422, t('server.versionFormat'))
  }

  if (!/^[A-Za-z0-9]{20,}$/.test(token)) {
    throw apiError(422, t('server.tokenInvalid'))
  }

  const debug = orFail(await graph(account, 'GET', 'debug_token', { input_token: token }), 422)
  const ids = new Set<string>()

  for (const scope of debug.data?.granular_scopes ?? []) {
    if (String(scope.scope ?? '').startsWith('whatsapp_business_')) {
      for (const id of scope.target_ids ?? []) {
        ids.add(String(id))
      }
    }
  }

  const found = await Promise.all([...ids].map(async (waba): Promise<DiscoveredAccount | null> => {
    const meta = await graphFields(account, waba, ['name,phone_numbers{display_phone_number,verified_name}', 'name'])

    return meta.error ? null : { waba_id: waba, name: meta.name ?? null, phones: meta.phone_numbers?.data ?? [] }
  }))

  return { data: found.filter(Boolean) }
})
