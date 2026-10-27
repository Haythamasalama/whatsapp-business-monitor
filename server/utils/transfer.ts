import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const FORMAT = 'whatsapp-manager-monitoring/accounts'
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export interface AccountsFile {
  format: typeof FORMAT
  version: 1
  exported_at: string
  kdf: { name: 'scrypt', salt: string, N: number, r: number, p: number }
  cipher: { name: 'aes-256-gcm', iv: string, tag: string }
  data: string
}

export interface ExportedAccount extends AccountValues {
  id: string
}

const key = (passphrase: string, salt: Buffer, params: { N: number, r: number, p: number }) =>
  scryptSync(passphrase.normalize('NFKC'), salt, 32, { ...params, maxmem: SCRYPT.maxmem })

/** Every account in one file, tokens included, encrypted with a passphrase only its owner knows. */
export function encryptAccounts(accounts: ExportedAccount[], passphrase: string): AccountsFile {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(passphrase, salt, SCRYPT), iv)
  const data = Buffer.concat([cipher.update(JSON.stringify({ accounts }), 'utf8'), cipher.final()])

  return {
    format: FORMAT,
    version: 1,
    exported_at: new Date().toISOString(),
    kdf: { name: 'scrypt', salt: salt.toString('base64'), N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p },
    cipher: { name: 'aes-256-gcm', iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') },
    data: data.toString('base64'),
  }
}

export function decryptAccounts(file: unknown, passphrase: string): ExportedAccount[] {
  const parsed = file as Partial<AccountsFile> | null

  if (parsed?.format !== FORMAT || parsed.version !== 1 || !parsed.kdf || !parsed.cipher || !parsed.data) {
    throw apiError(422, t('transfer.notAccountsFile'))
  }

  try {
    const { N, r, p } = parsed.kdf
    const decipher = createDecipheriv('aes-256-gcm', key(passphrase, Buffer.from(parsed.kdf.salt, 'base64'), { N, r, p }), Buffer.from(parsed.cipher.iv, 'base64'))

    decipher.setAuthTag(Buffer.from(parsed.cipher.tag, 'base64'))

    const plain = Buffer.concat([decipher.update(Buffer.from(parsed.data, 'base64')), decipher.final()]).toString('utf8')

    return (JSON.parse(plain) as { accounts: ExportedAccount[] }).accounts
  }
  catch {
    throw apiError(422, t('transfer.wrongPassphrase'))
  }
}

export const MIN_PASSPHRASE = 8
