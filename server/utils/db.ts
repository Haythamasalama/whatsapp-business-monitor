import { chmodSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

// One step per schema version; PRAGMA user_version records how many have run.
const MIGRATIONS = [
  `
  CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL DEFAULT '',
    token TEXT NOT NULL,
    waba_id TEXT NOT NULL,
    version TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  `,
]

let connection: DatabaseSync | null = null

export const databaseFile = () => join(dataDir(), 'whatsapp-manager.db')

export function useDb(): DatabaseSync {
  if (connection) {
    return connection
  }

  // Tokens live in the database and its write-ahead log; a private folder keeps every file in it unreadable to others.
  mkdirSync(dataDir(), { recursive: true, mode: 0o700 })

  try {
    chmodSync(dataDir(), 0o700)
  }
  catch {
    // A folder this user does not own (a mounted volume) keeps the mode it was given.
  }

  const db = new DatabaseSync(databaseFile())

  chmodSync(databaseFile(), 0o600)
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;')
  migrate(db)
  importAccountFiles(db)
  connection = db

  return db
}

function migrate(db: DatabaseSync): void {
  const { user_version: done } = db.prepare('PRAGMA user_version').get() as { user_version: number }

  for (let step = done; step < MIGRATIONS.length; step++) {
    db.exec('BEGIN')

    try {
      db.exec(MIGRATIONS[step]!)
      db.exec(`PRAGMA user_version = ${step + 1}`)
      db.exec('COMMIT')
    }
    catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
}

/**
 * Before the database, every account was a `{id}.env` file in the same folder. They are copied in
 * once; the files stay where they are, so going back to an older version still finds them.
 */
function importAccountFiles(db: DatabaseSync): void {
  if (db.prepare('SELECT 1 FROM settings WHERE key = ?').get('account_files_imported') || !existsSync(dataDir())) {
    return
  }

  const insert = db.prepare('INSERT OR IGNORE INTO accounts (id, label, token, waba_id, version) VALUES (?, ?, ?, ?, ?)')

  for (const name of readdirSync(dataDir()).filter(name => name.endsWith('.env'))) {
    const values: Record<string, string> = {}

    for (const raw of readFileSync(join(dataDir(), name), 'utf8').split('\n')) {
      const line = raw.trim()
      const at = line.indexOf('=')

      if (line && !line.startsWith('#') && at !== -1) {
        values[line.slice(0, at).trim()] = line.slice(at + 1).trim().replace(/^['"]|['"]$/g, '')
      }
    }

    const id = basename(name, '.env')

    if (ACCOUNT_ID.test(id) && values.WHATSAPP_TOKEN && values.WHATSAPP_WABA_ID) {
      insert.run(id, values.WHATSAPP_LABEL ?? '', values.WHATSAPP_TOKEN, values.WHATSAPP_WABA_ID, values.WHATSAPP_VERSION || DEFAULT_VERSION)
    }
  }

  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('account_files_imported', JSON.stringify(new Date().toISOString()))
}
