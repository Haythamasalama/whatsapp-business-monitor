export default apiHandler(async (event): Promise<AccountsFile> => {
  const { passphrase } = await readBody<{ passphrase?: string }>(event)

  if (String(passphrase ?? '').length < MIN_PASSPHRASE) {
    throw apiError(422, t('transfer.passphraseShort', { n: MIN_PASSPHRASE }))
  }

  const accounts = Object.keys(accountFiles()).map((id) => {
    const { label, token, waba, version } = loadAccount(id)

    return { id, label, token, waba, version }
  })

  if (!accounts.length) {
    throw apiError(422, t('transfer.nothingToExport'))
  }

  return encryptAccounts(accounts, String(passphrase))
})
