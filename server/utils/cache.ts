import { createHash } from 'node:crypto'
import type { H3Event } from 'h3'

/**
 * What Meta answered, kept per account in the `cache` table so a page opens at once. Within its age an entry
 * answers alone; after it, the entry still answers and Meta is asked in the background (stale-while-revalidate).
 * `?fresh=1` (the page's refresh button) always asks Meta. A key is `kind` or `kind:detail`.
 */
export const CACHE_AGES = {
  templates: 2 * 60_000,
  overview: 10 * 60_000,
  analytics: 10 * 60_000,
  business: 10 * 60_000,
} as const

export type CacheKind = keyof typeof CACHE_AGES

// Writes that change what Meta would answer, by route, and the kinds they make out of date.
const WRITES: [prefix: string, kinds: CacheKind[]][] = [
  ['/api/templates', ['templates', 'business']],
  ['/api/business', ['business', 'overview']],
  ['/api/analytics', ['analytics', 'overview']],
]

// Entries no page asked for in this long (an old set of template ids) are removed.
const KEEP_MS = 7 * 24 * 60 * 60_000

const running = new Map<string, Promise<unknown>>()
// Bumped by every drop, so a read that started before a write never stores what it saw.
const generations = new Map<string, number>()

interface CacheRow {
  value: string
  fetched_at: number
}

export const wantsFresh = (event: H3Event) => String(getQuery(event).fresh ?? '') === '1'

/** A short, stable key part for a list of ids. */
export const listKey = (ids: string[]) => createHash('sha256').update([...ids].sort().join(',')).digest('hex').slice(0, 16)

export async function cached<T>(account: Pick<Account, 'id' | 'token'>, key: string, load: () => Promise<T>, fresh = false): Promise<T> {
  const row = fresh ? undefined : readEntry(account.id, key)

  if (!row) {
    return refresh(account, key, load)
  }

  if (Date.now() - row.fetched_at >= CACHE_AGES[kindOf(key)]) {
    refresh(account, key, load).catch(() => {
      // The page already has an answer; the next load tries Meta again.
    })
  }

  return JSON.parse(row.value) as T
}

export function dropCache(accountId: string, kinds?: CacheKind[]): void {
  generations.set(accountId, (generations.get(accountId) ?? 0) + 1)

  if (!kinds) {
    useDb().prepare('DELETE FROM cache WHERE account_id = ?').run(accountId)

    return
  }

  const drop = useDb().prepare('DELETE FROM cache WHERE account_id = ? AND (key = ? OR key LIKE ?)')

  for (const kind of kinds) {
    drop.run(accountId, kind, `${kind}:%`)
  }
}

/** Called after every API request: a write to Meta drops what the cache holds for that account. */
export function dropAfterWrite(event: H3Event): void {
  const accountId = String(getQuery(event).account ?? '')
  const path = event.path.split('?')[0] ?? ''
  const kinds = WRITES.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))?.[1]

  if (event.method !== 'GET' && accountId && kinds) {
    dropCache(accountId, kinds)
  }
}

const kindOf = (key: string) => key.split(':')[0] as CacheKind

function readEntry(accountId: string, key: string): CacheRow | undefined {
  return useDb().prepare('SELECT value, fetched_at FROM cache WHERE account_id = ? AND key = ?').get(accountId, key) as CacheRow | undefined
}

/** One Meta read per entry at a time; what it answers is stored unless a write came first or it holds an error. */
function refresh<T>(account: Pick<Account, 'id' | 'token'>, key: string, load: () => Promise<T>): Promise<T> {
  const id = `${account.id}\n${key}`
  const pending = running.get(id)

  if (pending) {
    return pending as Promise<T>
  }

  const generation = generations.get(account.id) ?? 0
  const task = load()
    .then((value) => {
      if ((generations.get(account.id) ?? 0) === generation) {
        store(account, key, value)
      }

      return value
    })
    .finally(() => running.delete(id))

  running.set(id, task)

  return task
}

function store(account: Pick<Account, 'id' | 'token'>, key: string, value: unknown): void {
  const json = JSON.stringify(value)

  // Meta's errors are not kept, and a token never reaches the table.
  if (json === undefined || hasError(value) || (account.token && json.includes(account.token))) {
    return
  }

  const now = Date.now()

  useDb().prepare('DELETE FROM cache WHERE fetched_at < ?').run(now - KEEP_MS)
  useDb().prepare(`
    INSERT INTO cache (account_id, key, value, fetched_at) VALUES (?, ?, ?, ?)
    ON CONFLICT (account_id, key) DO UPDATE SET value = excluded.value, fetched_at = excluded.fetched_at
  `).run(account.id, key, json, now)
}

/** An answer, or one of its parts (overview, business details), that carries Meta's `error`. */
function hasError(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return 'error' in value || Object.values(value).some(part => Boolean(part && typeof part === 'object' && !Array.isArray(part) && 'error' in part && part.error))
}
