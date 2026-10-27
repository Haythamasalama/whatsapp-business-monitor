export default apiHandler(async (event) => {
  const user = requireUser(event)
  const body = await readBody<{ current?: string, next?: string }>(event)
  const row = useDb().prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id) as { password_hash: string }

  if (!verifyPassword(String(body.current ?? ''), row.password_hash)) {
    throw apiError(422, t('auth.currentWrong'))
  }

  if (String(body.next ?? '').length < MIN_PASSWORD) {
    throw apiError(422, t('auth.passwordShort', { n: MIN_PASSWORD }))
  }

  useDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(String(body.next)), user.id)
  // Every other browser signed in as this user has to sign in again with the new password.
  useDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id)
  startSession(event, user.id)

  return { ok: true }
})
