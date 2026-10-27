export default apiHandler(async () => {
  const data: AccountSummary[] = await Promise.all(Object.keys(accountFiles()).map(async (id) => {
    const account = loadAccount(id)
    const meta = account.token && account.waba
      ? await graphFields(account, account.waba, ['name,phone_numbers{display_phone_number,verified_name}', 'name'])
      : { error: { message: 'WHATSAPP_TOKEN أو WHATSAPP_WABA_ID غير موجود' } }

    return {
      id,
      label: account.label,
      file: tildePath(account.file),
      waba_id: account.waba,
      version: account.version,
      name: meta.name ?? null,
      phones: meta.phone_numbers?.data ?? [],
      error: meta.error ? errorText(meta.error) : null,
    }
  }))

  return { data, dir: tildePath(accountsDir()) }
})
