export default apiHandler(async (event): Promise<AccountsFile> => {
  const user = requireUser(event)
  const limit = limitLogin(event, 'export')
  const { password, passphrase } = await readBody<{ password?: string, passphrase?: string }>(event)
  const row = useDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string } | undefined

  // A session alone isn't enough to take every token away: the person must know the password too.
  if (!row || !verifyPassword(String(password ?? ''), row.password_hash)) {
    throw apiError(403, t('auth.currentWrong'))
  }

  limit.clear()

  if (String(passphrase ?? '').length < MIN_PASSPHRASE) {
    throw apiError(422, t('transfer.passphraseShort', { n: MIN_PASSPHRASE }))
  }

  const accounts = accountIds().map((id) => {
    const { label, token, waba, version } = loadAccount(id)

    return { id, label, token, waba, version }
  })

  if (!accounts.length) {
    throw apiError(422, t('transfer.nothingToExport'))
  }

  return encryptAccounts(accounts, String(passphrase))
})
