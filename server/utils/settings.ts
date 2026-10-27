export interface AppSettings {
  /** Shown in the sidebar and the tab; empty means the product's own name in the page's language. */
  instance_name: string
  /** The address people open the app with, e.g. https://wa.example.com; empty until set. */
  public_url: string
  default_locale: Locale
  update_check: boolean
}

const DEFAULTS: AppSettings = { instance_name: '', public_url: '', default_locale: 'ar', update_check: true }

export function readSettings(): AppSettings {
  const rows = useDb().prepare('SELECT key, value FROM settings').all() as { key: string, value: string }[]
  const stored = Object.fromEntries(rows.map(row => [row.key, JSON.parse(row.value)]))

  return Object.fromEntries(Object.entries(DEFAULTS).map(([key, fallback]) => [key, stored[key] ?? fallback])) as unknown as AppSettings
}

export function writeSettings(values: Partial<AppSettings>): void {
  const upsert = useDb().prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value')

  for (const [key, value] of Object.entries(values)) {
    if (key in DEFAULTS && value !== undefined) {
      upsert.run(key, JSON.stringify(value))
    }
  }
}

/** Checks and cleans what the setup and settings forms send. */
export function readSettingsInput(body: Record<string, unknown>): { values: Partial<AppSettings>, problems: string[] } {
  const values: Partial<AppSettings> = {}
  const problems: string[] = []

  if ('instance_name' in body) {
    values.instance_name = String(body.instance_name ?? '').replace(/[\r\n]/g, '').trim().slice(0, 60)
  }

  if ('public_url' in body) {
    const url = String(body.public_url ?? '').trim().replace(/\/+$/, '')

    if (url && !/^https?:\/\/[^\s/]+(\/\S*)?$/i.test(url)) {
      problems.push(t('settings.urlInvalid'))
    }

    values.public_url = url
  }

  if ('default_locale' in body) {
    values.default_locale = isLocale(body.default_locale) ? body.default_locale : 'ar'
  }

  if ('update_check' in body) {
    values.update_check = Boolean(body.update_check)
  }

  return { values, problems }
}
