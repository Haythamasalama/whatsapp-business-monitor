export default apiHandler(async (event): Promise<ImportResult> => {
  const body = await readBody<{ file?: string, passphrase?: string, replace?: boolean }>(event)
  let file: unknown

  try {
    file = JSON.parse(String(body.file ?? ''))
  }
  catch {
    throw apiError(422, t('transfer.notAccountsFile'))
  }

  const existing = new Set(accountIds())
  const result: ImportResult = { added: [], replaced: [], skipped: [] }

  for (const account of decryptAccounts(file, String(body.passphrase ?? ''))) {
    const id = String(account.id ?? '').toLowerCase()
    const values = readAccountValues({ label: account.label, token: account.token, waba_id: account.waba, version: account.version })
    const invalid = !ACCOUNT_ID.test(id) || RESERVED_IDS.includes(id) || accountProblems(values).length > 0

    if (invalid || (existing.has(id) && !body.replace)) {
      result.skipped.push({ id, reason: invalid ? 'invalid' : 'exists' })
      continue
    }

    ;(existing.has(id) ? result.replaced : result.added).push(id)
    saveAccount(id, values)
    existing.add(id)
  }

  return result
})
