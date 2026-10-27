export default apiHandler(async (): Promise<{ data: AccountStats[] }> => {
  const data = await Promise.all(accountIds().map(async (id): Promise<AccountStats> => {
    const account = loadAccount(id)

    if (!account.token || !account.waba) {
      return { id, spend: null, spendError: null, phones: [], templates: null, error: t('server.accountIncomplete') }
    }

    const [overview, templates] = await Promise.all([
      accountOverview(account),
      listTemplates(account, ['name,status']).then(templateCounts, () => null),
    ])
    const spend = 'error' in overview.spend ? null : overview.spend

    return {
      id,
      spend,
      spendError: 'error' in overview.spend ? errorText(overview.spend.error) : null,
      phones: overview.phones.data ?? [],
      templates,
      error: overview.account.error ? errorText(overview.account.error) : null,
    }
  }))

  return { data }
})
