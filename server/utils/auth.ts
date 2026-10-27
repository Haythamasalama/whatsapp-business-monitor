import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE = 'wmm_session'
const SESSION_DAYS = 30
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
export const USERNAME = /^[a-z0-9._-]{3,40}$/i
export const MIN_PASSWORD = 8

export interface User {
  id: number
  username: string
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const hash = scryptSync(password.normalize('NFKC'), salt, 32, SCRYPT)

  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), hash.toString('base64')].join('$')
}

// Checked when the username doesn't exist, so an unknown name takes as long to refuse as a wrong password.
let dummyHash: string | null = null

export function verifyNoUser(password: string): false {
  verifyPassword(password, (dummyHash ??= hashPassword(randomBytes(16).toString('hex'))))

  return false
}

export function verifyPassword(password: string, stored: string): boolean {
  const [name, N, r, p, salt, hash] = stored.split('$')

  if (name !== 'scrypt' || !salt || !hash) {
    return false
  }

  const expected = Buffer.from(hash, 'base64')

  // Only the parameters this app writes, so a tampered row can't make a sign-in run for minutes.
  if (Number(N) !== SCRYPT.N || Number(r) !== SCRYPT.r || Number(p) !== SCRYPT.p || expected.length !== 32) {
    return false
  }

  const actual = scryptSync(password.normalize('NFKC'), Buffer.from(salt, 'base64'), expected.length, SCRYPT)

  return timingSafeEqual(actual, expected)
}

export const hasUsers = () => Boolean(useDb().prepare('SELECT 1 FROM users LIMIT 1').get())

const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex')

export function startSession(event: H3Event, userId: number): void {
  const token = randomBytes(32).toString('base64url')
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  useDb().prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString())
  useDb().prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(tokenHash(token), userId, expires.toISOString())

  setCookie(event, COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // Also when the saved public address is https: a proxy may end TLS without saying so in a header.
    secure: getRequestProtocol(event, { xForwardedProto: true }) === 'https' || readSettings().public_url.startsWith('https://'),
    path: '/',
    expires,
  })
}

export function endSession(event: H3Event): void {
  const token = getCookie(event, COOKIE)

  if (token) {
    useDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash(token))
  }

  deleteCookie(event, COOKIE, { path: '/' })
}

export function currentUser(event: H3Event): User | null {
  const token = getCookie(event, COOKIE)

  if (!token) {
    return null
  }

  return (useDb().prepare(`
    SELECT users.id, users.username FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).get(tokenHash(token), new Date().toISOString()) as User | undefined) ?? null
}

export function requireUser(event: H3Event): User {
  const user = currentUser(event)

  if (!user) {
    throw apiError(401, t('auth.required'))
  }

  return user
}

// Ten tries per address in fifteen minutes, then a wait: enough for typos, too slow for guessing.
const attempts = new Map<string, { count: number, until: number }>()
const WINDOW_MS = 15 * 60_000
const MAX_TRIES = 10

/**
 * Counts the try before the password is checked, so requests sent all at once can't slip past the limit while
 * the first ones are still being read. A correct password clears the count.
 */
export function limitLogin(event: H3Event, scope = 'login'): { clear: () => void } {
  const key = `${scope}:${clientAddress(event)}`
  const now = Date.now()

  if (attempts.size > 10_000) {
    for (const [stale, entry] of attempts) {
      if (entry.until <= now) {
        attempts.delete(stale)
      }
    }
  }

  const entry = attempts.get(key)

  if (entry && entry.until > now && entry.count >= MAX_TRIES) {
    throw apiError(429, t('auth.tooMany', { minutes: Math.ceil((entry.until - now) / 60_000) }))
  }

  attempts.set(key, entry && entry.until > now ? { ...entry, count: entry.count + 1 } : { count: 1, until: now + WINDOW_MS })

  return { clear: () => attempts.delete(key) }
}
