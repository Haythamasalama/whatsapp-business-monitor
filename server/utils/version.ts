const RELEASES = 'https://api.github.com/repos/Haythamasalama/whatsapp-business-monitor/releases/latest'
const HOUR = 60 * 60 * 1000
// "Check now" asks again, but not more often than this, so a busy button can't use up GitHub's hourly limit.
const MIN_GAP = 30 * 1000

let checked: { at: number, latest: Release | null } | null = null

const parts = (version: string) => version.replace(/^v/, '').split(/[.-]/).map(part => Number.parseInt(part, 10) || 0)

export function isNewer(candidate: string, current: string): boolean {
  const [a, b] = [parts(candidate), parts(current)]

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) {
      return (a[i] ?? 0) > (b[i] ?? 0)
    }
  }

  return false
}

async function fetchLatest(): Promise<Release | null> {
  try {
    const response = await fetch(RELEASES, {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'whatsapp-business-monitor' },
      signal: AbortSignal.timeout(5_000),
    })
    const release = response.ok ? await response.json() as { tag_name?: string, html_url?: string } : null

    return release?.tag_name && release.html_url ? { version: release.tag_name.replace(/^v/, ''), url: release.html_url } : null
  }
  catch {
    return null
  }
}

/** Asks GitHub for the latest release at most once an hour, or now with `force`; the only call this app makes outside Meta. */
export async function latestRelease(force = false): Promise<Release | null> {
  const age = checked ? Date.now() - checked.at : Infinity

  if (!checked || age > HOUR || (force && age > MIN_GAP)) {
    checked = { at: Date.now(), latest: await fetchLatest() }
  }

  return checked.latest
}

export const updateCheckEnabled = () => !['0', 'false'].includes(String(process.env.WHATSAPP_TEMPLATES_UPDATE_CHECK ?? '').toLowerCase())

const updater = () => ({ url: process.env.WHATSAPP_MANAGER_UPDATE_URL ?? '', token: process.env.WHATSAPP_MANAGER_UPDATE_TOKEN ?? '' })

/** True when compose.yaml points the app at the updater's API and install.sh gave both the same secret. */
export const canUpdateNow = () => Boolean(updater().url && updater().token)

/**
 * Asks the updater to pull the latest image and restart the app on it. The updater answers only once it is done,
 * and by then this app has been restarted, so a request still running after a few seconds counts as started.
 */
export async function startUpdate(): Promise<void> {
  const { url, token } = updater()
  const request = fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10 * 60_000) })
    .then(response => (response.ok ? 'done' : `status ${response.status}`))
    .catch((error: Error) => `unreachable: ${error.message}`)
  const result = await Promise.race([request, new Promise<'started'>(resolve => setTimeout(() => resolve('started'), 3_000))])

  if (result !== 'started' && result !== 'done') {
    console.error(`[update] the updater refused or could not be reached (${result})`)
    throw apiError(502, t('server.updateFailed'))
  }
}
