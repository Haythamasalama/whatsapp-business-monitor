export default apiHandler(async (event) => {
  if (hasUsers()) {
    throw apiError(409, t('setup.done'))
  }

  const body = await readBody<Record<string, unknown>>(event)
  const username = String(body.username ?? '').trim()
  const password = String(body.password ?? '')
  const { values, problems } = readSettingsInput(body)

  if (!USERNAME.test(username)) {
    problems.push(t('auth.usernameFormat'))
  }

  if (password.length < MIN_PASSWORD) {
    problems.push(t('auth.passwordShort', { n: MIN_PASSWORD }))
  }

  if (problems.length) {
    throw apiError(422, problems.join('\n'))
  }

  const db = useDb()

  db.exec('BEGIN IMMEDIATE')

  try {
    // Checked again inside the transaction, so two people finishing setup at once cannot both win.
    if (hasUsers()) {
      throw apiError(409, t('setup.done'))
    }

    const { lastInsertRowid } = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hashPassword(password))

    writeSettings(values)
    db.exec('COMMIT')
    startSession(event, Number(lastInsertRowid))
  }
  catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  return { ok: true }
})
