import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import type { H3Event } from 'h3'

export const DEFAULT_VERSION = 'v23.0'
export const ACCOUNT_ID = /^[a-z0-9][a-z0-9_-]{0,39}$/
// These names are routes under /api/accounts, so no account may take them.
export const RESERVED_IDS = ['discover', 'export', 'import']

export interface Account {
  id: string
  label: string
  file: string
  token: string
  waba: string
  version: string
}

/** One `{id}.env` file per WhatsApp account, outside the project so tokens never sit next to the code. */
export const accountsDir = () => process.env.WHATSAPP_TEMPLATES_DIR || join(homedir(), '.config', 'whatsapp-templates')

// Paths shown in the page start with ~ so the user name never ends up in a screenshot.
export const tildePath = (path: string) => (path.startsWith(homedir()) ? `~${path.slice(homedir().length)}` : path)

export function accountFiles(): Record<string, string> {
  const files: Record<string, string> = {}

  if (existsSync(accountsDir())) {
    for (const name of readdirSync(accountsDir()).filter(name => name.endsWith('.env')).sort()) {
      files[basename(name, '.env')] = join(accountsDir(), name)
    }
  }

  return files
}

export function loadAccount(id: string): Account {
  const file = accountFiles()[id]!
  const values: Record<string, string> = {}

  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim()
    const at = line.indexOf('=')

    if (!line || line.startsWith('#') || at === -1) {
      continue
    }

    values[line.slice(0, at).trim()] = line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')
  }

  return {
    id,
    label: values.WHATSAPP_LABEL || id,
    file,
    token: values.WHATSAPP_TOKEN ?? '',
    waba: values.WHATSAPP_WABA_ID ?? '',
    version: values.WHATSAPP_VERSION || DEFAULT_VERSION,
  }
}

export function requireAccount(event: H3Event): Account {
  const id = String(getQuery(event).account ?? '')

  if (!accountFiles()[id]) {
    throw apiError(404, t('server.accountNotFound', { id }))
  }

  const account = loadAccount(id)

  if (!account.token || !account.waba) {
    throw apiError(400, t('server.accountIncompleteIn', { file: tildePath(account.file) }))
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
    label: String(body.label ?? '').replace(/['\r\n]/g, '').trim(),
    token: field('token') || fallback?.token || '',
    waba: field('waba_id') || fallback?.waba || '',
    version: field('version') || fallback?.version || DEFAULT_VERSION,
  }
}

export const newAccountFile = (id: string) => join(accountsDir(), `${id}.env`)

export function writeAccount(file: string, values: AccountValues): void {
  mkdirSync(accountsDir(), { recursive: true, mode: 0o700 })

  // Single quotes keep the label literal if a shell script sources this file.
  const lines = [
    ...(values.label ? [`WHATSAPP_LABEL='${values.label}'`] : []),
    `WHATSAPP_TOKEN=${values.token}`,
    `WHATSAPP_WABA_ID=${values.waba}`,
    `WHATSAPP_VERSION=${values.version}`,
  ]

  writeFileSync(file, `${lines.join('\n')}\n`, { mode: 0o600 })
  chmodSync(file, 0o600)
}

export function apiError(statusCode: number, message: string) {
  return createError({ statusCode, data: { error: { message } } })
}
