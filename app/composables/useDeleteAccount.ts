/** Asks, then deletes an account's file; the page leaves the account if it was open. Resolves true once deleted. */
export function useDeleteAccount() {
  const { api, accountId, screen, loadAccounts } = useManager()
  const confirm = useConfirm()
  const toast = useToast()

  return async (account: AccountSummary): Promise<boolean> => {
    const confirmed = await confirm({
      title: t('accountForm.deleteTitle', { name: accountTitle(account) }),
      description: t('accountForm.deleteNote'),
      confirmLabel: t('accountForm.delete'),
      danger: true,
    })

    if (!confirmed) {
      return false
    }

    try {
      await api(`/api/accounts/${account.id}`, { method: 'DELETE', scoped: false })
    }
    catch (error) {
      toast.add({ title: t('accountForm.deleteFailed'), description: (error as Error).message, color: 'error' })

      return false
    }

    forgetAccount(account.id)
    toast.add({ title: t('accountForm.deleted'), color: 'success', icon: 'i-lucide-check' })

    if (screen.value === 'account' && accountId.value === account.id) {
      screen.value = 'overview'
    }

    await loadAccounts()

    return true
  }
}
