import { afterAll, beforeEach, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

// The server's helpers are auto-imported by Nitro; here they are put on globalThis by hand, on a database
// in a throwaway folder.
const folder = mkdtempSync(join(tmpdir(), 'wbm-cache-'))

process.env.WHATSAPP_TEMPLATES_DIR = folder

const accounts = await import('../server/utils/accounts')

Object.assign(globalThis, { dataDir: accounts.dataDir, ACCOUNT_ID: accounts.ACCOUNT_ID, DEFAULT_VERSION: accounts.DEFAULT_VERSION })

const { useDb, databaseFile } = await import('../server/utils/db')

Object.assign(globalThis, { useDb })

const cache = await import('../server/utils/cache')

Object.assign(globalThis, { dropCache: cache.dropCache })

const TOKEN = 'test0token0value0not0real0abcdef'
const account = { id: 'shop', token: TOKEN }
const values = { label: 'Shop', token: TOKEN, waba: '1000', version: 'v23.0' }

const rows = () => useDb().prepare('SELECT account_id, key, value, fetched_at FROM cache ORDER BY key').all() as { account_id: string, key: string, value: string, fetched_at: number }[]
const age = (key: string, ms: number) => useDb().prepare('UPDATE cache SET fetched_at = ? WHERE key = ?').run(Date.now() - ms, key)
const settle = () => new Promise(resolve => setTimeout(resolve, 5))

function counter<T>(answers: T[]) {
  let calls = 0

  return { load: async () => answers[Math.min(calls++, answers.length - 1)]!, calls: () => calls }
}

beforeEach(() => {
  useDb().exec('DELETE FROM accounts')
  accounts.saveAccount('shop', values)
  accounts.saveAccount('other', { ...values, waba: '2000' })
})

afterAll(() => rmSync(folder, { recursive: true, force: true }))

describe('database', () => {
  test('keeps its private mode with the cache table added', () => {
    expect(statSync(databaseFile()).mode & 0o777).toBe(0o600)
  })
})

describe('reading', () => {
  test('stores the first answer and serves it while young', async () => {
    const meta = counter([{ data: ['a'] }, { data: ['b'] }])

    expect(await cache.cached(account, 'templates', meta.load)).toEqual({ data: ['a'] })
    expect(await cache.cached(account, 'templates', meta.load)).toEqual({ data: ['a'] })
    expect(meta.calls()).toBe(1)
  })

  test('answers from an expired entry at once and renews it in the background', async () => {
    const meta = counter([{ data: ['a'] }, { data: ['b'] }])

    await cache.cached(account, 'templates', meta.load)
    age('templates', cache.CACHE_AGES.templates + 1)

    expect(await cache.cached(account, 'templates', meta.load)).toEqual({ data: ['a'] })
    await settle()
    expect(meta.calls()).toBe(2)
    expect(await cache.cached(account, 'templates', meta.load)).toEqual({ data: ['b'] })
  })

  test('each kind has its own age', async () => {
    const meta = counter([{ n: 1 }, { n: 2 }])

    await cache.cached(account, 'overview', meta.load)
    age('overview', cache.CACHE_AGES.templates + 1)
    await cache.cached(account, 'overview', meta.load)
    await settle()
    expect(meta.calls()).toBe(1)
  })

  test('fresh asks Meta even when the entry is young', async () => {
    const meta = counter([{ n: 1 }, { n: 2 }])

    await cache.cached(account, 'business', meta.load)
    expect(await cache.cached(account, 'business', meta.load, true)).toEqual({ n: 2 })
    expect(JSON.parse(rows()[0]!.value)).toEqual({ n: 2 })
  })

  test('two reads at once call Meta once', async () => {
    const meta = counter([{ n: 1 }])

    await Promise.all([cache.cached(account, 'overview', meta.load), cache.cached(account, 'overview', meta.load)])
    expect(meta.calls()).toBe(1)
  })
})

describe('what is never stored', () => {
  test('a failed read', async () => {
    await expect(cache.cached(account, 'templates', async () => {
      throw new Error('Meta is down')
    })).rejects.toThrow('Meta is down')
    expect(rows()).toEqual([])
  })

  test('an answer that carries an error, or a part that does', async () => {
    await cache.cached(account, 'overview', async () => ({ error: { message: 'rate limit' } }))
    await cache.cached(account, 'business', async () => ({ account: { name: 'Shop' }, phones: { error: { code: 4 } } }))
    expect(rows()).toEqual([])
  })

  test('an answer that contains the token', async () => {
    await cache.cached(account, 'business', async () => ({ link: `https://example.com/?access_token=${TOKEN}` }))
    expect(rows()).toEqual([])
  })

  test('the token, in any row', async () => {
    await cache.cached(account, 'templates', async () => ({ data: [{ name: 'welcome' }] }))
    await cache.cached(account, 'overview', async () => ({ account: { name: 'Shop' } }))
    expect(rows().length).toBe(2)
    expect(JSON.stringify(rows())).not.toContain(TOKEN)
  })
})

describe('dropping', () => {
  test('a kind drops its detailed keys and leaves other kinds and accounts', async () => {
    await cache.cached(account, 'templates', async () => ({ n: 1 }))
    await cache.cached(account, 'templates:counts', async () => ({ n: 1 }))
    await cache.cached(account, `analytics:${cache.listKey(['2', '1'])}`, async () => ({ n: 1 }))
    await cache.cached({ id: 'other', token: TOKEN }, 'templates', async () => ({ n: 1 }))

    cache.dropCache('shop', ['templates'])

    expect(rows().map(row => `${row.account_id}/${row.key.split(':')[0]}`)).toEqual(['shop/analytics', 'other/templates'])
  })

  test('a read that started before a write does not store what it saw', async () => {
    let finish: (value: { n: number }) => void = () => {}
    const reading = cache.cached(account, 'templates', () => new Promise(resolve => (finish = resolve)))

    cache.dropCache('shop', ['templates'])
    finish({ n: 1 })

    expect(await reading).toEqual({ n: 1 })
    expect(rows()).toEqual([])
  })

  test('saving an account drops all of its entries', async () => {
    await cache.cached(account, 'overview', async () => ({ n: 1 }))
    accounts.saveAccount('shop', { ...values, waba: '3000' })
    expect(rows()).toEqual([])
  })

  test('deleting an account deletes its rows', async () => {
    await cache.cached(account, 'overview', async () => ({ n: 1 }))
    await cache.cached({ id: 'other', token: TOKEN }, 'overview', async () => ({ n: 1 }))
    accounts.deleteAccount('shop')
    expect(rows().map(row => row.account_id)).toEqual(['other'])
  })

  test('the same ids in another order share one key', () => {
    expect(cache.listKey(['3', '1', '2'])).toBe(cache.listKey(['1', '2', '3']))
  })
})
