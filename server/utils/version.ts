const RELEASES = 'https://api.github.com/repos/Haythamasalama/whatsapp-business-monitor/releases/latest'
const DAY = 24 * 60 * 60 * 1000

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

/** Asks GitHub for the latest release at most once a day; the only call this app makes outside Meta. */
export async function latestRelease(): Promise<Release | null> {
  if (!checked || Date.now() - checked.at > DAY) {
    checked = { at: Date.now(), latest: await fetchLatest() }
  }

  return checked.latest
}

export const updateCheckEnabled = () => !['0', 'false'].includes(String(process.env.WHATSAPP_TEMPLATES_UPDATE_CHECK ?? '').toLowerCase())
