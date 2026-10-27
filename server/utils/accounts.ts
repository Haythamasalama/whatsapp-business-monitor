import { homedir } from 'node:os'
import { join } from 'node:path'
import type { H3Event } from 'h3'

export const DEFAULT_VERSION = 'v23.0'
export const ACCOUNT_ID = /^[a-z0-9][a-z0-9_-]{0,39}$/
// These names are routes under /api/accounts, so no account may take them.
export const RESERVED_IDS = ['discover', 'export', 'import']

export interface Account {
  id: string
  label: string
  token: string
  waba: string
  version: string
}

/** The app's data folder: the database, outside the project so tokens never sit next to the code. */
export const dataDir = () => process.env.WHATSAPP_TEMPLATES_DIR || join(homedir(), '.config', 'whatsapp-templates')

// Paths shown in the page start with ~ so the user name never ends up in a screenshot.
export const tildePath = (path: string) => (path.startsWith(homedir()) ? `~${path.slice(homedir().length)}` : path)

interface AccountRow {
  id: string
  label: string
  token: string
  waba_id: string
  version: string
}

const toAccount = (row: AccountRow): Account => ({ id: row.id, label: row.label || row.id, token: row.token, waba: row.waba_id, version: row.version || DEFAULT_VERSION })

export function accountIds(): string[] {
  return (useDb().prepare('SELECT id FROM accounts ORDER BY id').all() as { id: string }[]).map(row => row.id)
}

export function findAccount(id: string): Account | null {
  const row = useDb().prepare('SELECT id, label, token, waba_id, version FROM accounts WHERE id = ?').get(id) as AccountRow | undefined

  return row ? toAccount(row) : null
}

export function loadAccount(id: string): Account {
  const account = findAccount(id)

  if (!account) {
    throw apiError(404, t('server.accountNotFound', { id }))
  }

  return account
}

export function saveAccount(id: string, values: AccountValues): void {
  useDb().prepare(`
    INSERT INTO accounts (id, label, token, waba_id, version) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET label = excluded.label, token = excluded.token, waba_id = excluded.waba_id,
      version = excluded.version, updated_at = CURRENT_TIMESTAMP
  `).run(id, values.label, values.token, values.waba, values.version)
}

export function deleteAccount(id: string): boolean {
  return Number(useDb().prepare('DELETE FROM accounts WHERE id = ?').run(id).changes) > 0
}

export function requireAccount(event: H3Event): Account {
  const account = loadAccount(String(getQuery(event).account ?? ''))

  if (!account.token || !account.waba) {
    throw apiError(400, t('server.accountIncomplete'))
  }

  return account
}

export interface AccountValues {
  label: string
  token: string
  waba: string
  version: string
}

export function accountProblems(values: AccountValues): string[] {
  return [
    /^[A-Za-z0-9]{20,}$/.test(values.token) ? null : t('server.tokenFormat'),
    /^\d+$/.test(values.waba) ? null : t('server.wabaDigits'),
    /^v\d+\.\d+$/.test(values.version) ? null : t('server.versionFormat'),
  ].filter((problem): problem is string => problem !== null)
}

export function readAccountValues(body: Record<string, unknown>, fallback?: Account): AccountValues {
  const field = (key: string) => String(body[key] ?? '').trim()

  return {
    label: String(body.label ?? '').replace(/[\r\n]/g, '').trim(),
    token: field('token') || fallback?.token || '',
    waba: field('waba_id') || fallback?.waba || '',
    version: field('version') || fallback?.version || DEFAULT_VERSION,
  }
}

export function apiError(statusCode: number, message: string) {
  return createError({ statusCode, data: { error: { message } } })
}
