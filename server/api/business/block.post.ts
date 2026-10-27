// Blocks or unblocks customers. Meta only blocks someone who wrote to this number in the last 24 hours.
export default apiHandler(async (event) => {
  const account = requireAccount(event)
  const phone = await requirePhone(event, account)
  const body = await readBody<Record<string, unknown>>(event)
  const unblock = body.action === 'unblock'
  const { users, problems } = normalizeUsers(readList(body.users))

  failOn(problems)

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users
  const response = orFail(await graph(account, unblock ? 'DELETE' : 'POST', `${phone}/block_users`, {}, {
    messaging_product: 'whatsapp',
    block_users: users.map(user => ({ user })),
  }))
  const result = response.block_users ?? {}

  return {
    done: (result.added_users ?? result.removed_users ?? []).length,
    failed: (result.failed_users ?? []).map((entry: { input?: string, errors?: MetaError[] }) => ({
      input: entry.input ?? '',
      // 131047: the person has not written in the last 24 hours, or is not on WhatsApp.
      reason: entry.errors?.[0]?.code === 131047 ? t('business.blocked.notRecent') : errorText(entry.errors?.[0]),
    })),
  }
})
