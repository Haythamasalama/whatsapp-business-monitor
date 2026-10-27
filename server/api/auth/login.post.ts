export default apiHandler(async (event) => {
  const limit = limitLogin(event)
  const body = await readBody<{ username?: string, password?: string }>(event)
  const row = useDb().prepare('SELECT id, password_hash FROM users WHERE username = ?').get(String(body.username ?? '').trim()) as { id: number, password_hash: string } | undefined

  if (!row || !verifyPassword(String(body.password ?? ''), row.password_hash)) {
    limit.fail()
    throw apiError(401, t('auth.wrong'))
  }

  limit.clear()
  startSession(event, row.id)

  return { ok: true }
})
