async function profilePhoto(account: Account, phones: Phone[]): Promise<string | null> {
  for (const phone of phones) {
    if (!phone.id) {
      continue
    }

    const profile = await graph(account, 'GET', `${phone.id}/whatsapp_business_profile`, { fields: 'profile_picture_url' })
    const url = profile.data?.[0]?.profile_picture_url

    if (typeof url === 'string' && url.startsWith('https://')) {
      return url
    }
  }

  return null
}

export default apiHandler(async () => {
  const data: AccountSummary[] = await Promise.all(accountIds().map(async (id) => {
    const account = loadAccount(id)
    const meta = account.token && account.waba
      ? await graphFields(account, account.waba, ['name,phone_numbers{id,display_phone_number,verified_name}', 'name'])
      : { error: { message: t('server.accountIncomplete') } }
    const phones: Phone[] = meta.phone_numbers?.data ?? []

    return {
      id,
      label: account.label,
      waba_id: account.waba,
      version: account.version,
      name: meta.name ?? null,
      phones,
      photo: meta.error ? null : await profilePhoto(account, phones),
      error: meta.error ? errorText(meta.error) : null,
    }
  }))

  return { data, storage: tildePath(shownDatabaseFile()) }
})
