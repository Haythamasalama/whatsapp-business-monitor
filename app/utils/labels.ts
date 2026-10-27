export type Tone = 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'info'

/** Arabic and English come first everywhere; any other language Meta supports can be added. */
export const LANGS = ['ar', 'en']
export type Lang = string

export const editTabs = () => [
  { label: t('editTabs.fields'), value: 'fields', icon: 'i-lucide-text-cursor-input' },
  { label: t('editTabs.content'), value: 'code', icon: 'i-lucide-clipboard-list' },
]

export const META_LANGUAGES = [
  'af', 'sq', 'ar', 'az', 'bn', 'bg', 'ca', 'zh_CN', 'zh_HK', 'zh_TW', 'hr', 'cs', 'da', 'nl', 'en', 'en_GB', 'en_US',
  'et', 'fil', 'fi', 'fr', 'ka', 'de', 'el', 'gu', 'ha', 'he', 'hi', 'hu', 'id', 'ga', 'it', 'ja', 'kn', 'kk', 'rw_RW',
  'ko', 'ky_KG', 'lo', 'lv', 'lt', 'mk', 'ms', 'ml', 'mr', 'nb', 'fa', 'pl', 'pt_BR', 'pt_PT', 'pa', 'ro', 'ru', 'sr',
  'sk', 'sl', 'es', 'es_AR', 'es_ES', 'es_MX', 'sw', 'sv', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'zu',
]

/** How a language code is shown on badges: EN, AR, PT-BR. */
export function languageCode(code: string): string {
  return code.replace('_', '-').toUpperCase()
}

export function sortLanguages(codes: string[]): string[] {
  const rank = (code: string) => (LANGS.includes(code) ? LANGS.indexOf(code) : LANGS.length)

  return [...codes].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}

const STATUS_STYLE: Record<string, { tone: Tone, icon: string }> = {
  APPROVED: { tone: 'success', icon: 'i-lucide-circle-check' },
  PENDING: { tone: 'warning', icon: 'i-lucide-clock' },
  IN_APPEAL: { tone: 'warning', icon: 'i-lucide-scale' },
  PAUSED: { tone: 'warning', icon: 'i-lucide-circle-pause' },
  REJECTED: { tone: 'error', icon: 'i-lucide-circle-x' },
  DISABLED: { tone: 'error', icon: 'i-lucide-ban' },
  LIMIT_EXCEEDED: { tone: 'error', icon: 'i-lucide-octagon-alert' },
  PENDING_DELETION: { tone: 'neutral', icon: 'i-lucide-trash-2' },
  DELETED: { tone: 'neutral', icon: 'i-lucide-trash-2' },
  ARCHIVED: { tone: 'neutral', icon: 'i-lucide-archive' },
}

export const MAIN_STATUSES = ['APPROVED', 'PENDING', 'REJECTED']

export function statusOf(status: string): { label: string, tone: Tone, icon: string } {
  const style = STATUS_STYLE[status] ?? { tone: 'neutral' as Tone, icon: 'i-lucide-circle-help' }

  return { label: tOr(`status.${status}`, status), ...style }
}

export const categoryLabel = (category: string) => tOr(`category.${category}`, category)

export const pricingLabel = (category: string) => tOr(`pricing.${category}`, category)

export const rejectionLabel = (reason: string) => tOr(`rejection.${reason}`, reason)

const QUALITY_TONES: Record<string, Tone> = { GREEN: 'success', YELLOW: 'warning', RED: 'error', UNKNOWN: 'neutral' }

/** A phone number's or a template's quality rating, or null when Meta sent none it names. */
export function qualityOf(rating?: string | null): { label: string, tone: Tone } | null {
  const tone = rating ? QUALITY_TONES[rating] : undefined

  return tone ? { label: t(`quality.${rating}` as MessageKey), tone } : null
}

const PHONE_STATUS_TONES: Record<string, Tone> = {
  CONNECTED: 'success',
  PENDING: 'warning',
  FLAGGED: 'warning',
  RATE_LIMITED: 'warning',
  UNVERIFIED: 'warning',
  RESTRICTED: 'error',
  BANNED: 'error',
  DISCONNECTED: 'error',
  MIGRATED: 'neutral',
  DELETED: 'neutral',
  UNKNOWN: 'neutral',
}

const NAME_STATUS_TONES: Record<string, Tone> = {
  APPROVED: 'success',
  AVAILABLE_WITHOUT_REVIEW: 'success',
  PENDING_REVIEW: 'warning',
  DECLINED: 'error',
  EXPIRED: 'error',
  NONE: 'neutral',
}

export const phoneStatusOf = (status?: string) => (status ? { label: tOr(`phoneStatus.${status}`, status), tone: PHONE_STATUS_TONES[status] ?? 'neutral' } : null)

export const nameStatusOf = (status?: string) => (status ? { label: tOr(`nameStatus.${status}`, status), tone: NAME_STATUS_TONES[status] ?? 'neutral' } : null)

const TIERS: Record<string, number> = { TIER_50: 50, TIER_250: 250, TIER_1K: 1_000, TIER_2K: 2_000, TIER_10K: 10_000, TIER_100K: 100_000 }

/** Meta's current limit field, or the deprecated one on accounts and API versions that lack it. */
export const phoneLimit = (phone: Pick<Phone, 'whatsapp_business_manager_messaging_limit' | 'messaging_limit_tier'>) => messagingLimit(phone.whatsapp_business_manager_messaging_limit ?? phone.messaging_limit_tier)

export function messagingLimit(tier?: string): string {
  if (!tier) {
    return ''
  }

  if (tier === 'UNTIERED') {
    return t('phone.untiered')
  }

  if (tier === 'TIER_UNLIMITED') {
    return t('phone.unlimited')
  }

  return t('phone.limit', { n: TIERS[tier] ? count(TIERS[tier]) : tier })
}

export function languageName(code: string, inLocale: Locale = locale.value): string {
  try {
    return new Intl.DisplayNames([inLocale], { type: 'language' }).of(code.replace('_', '-')) ?? code
  }
  catch {
    return code
  }
}

const HEALTH_TONES: Record<string, Tone> = { AVAILABLE: 'success', LIMITED: 'warning', BLOCKED: 'error' }

/** health_status.can_send_message: whether messages can go out now. */
export const healthOf = (value?: string) => (value ? { label: tOr(`business.health.${value}`, value), tone: HEALTH_TONES[value] ?? 'neutral' as Tone } : null)

const VERIFICATION_TONES: Record<string, Tone> = { VERIFIED: 'success', PENDING: 'warning', PENDING_NEED_MORE_INFO: 'warning', PENDING_SUBMISSION: 'warning', NOT_VERIFIED: 'neutral', REJECTED: 'error', REVOKED: 'error', EXPIRED: 'error', FAILED: 'error' }

export const verificationOf = (value?: string) => (value ? { label: tOr(`business.verification.${value}`, value), tone: VERIFICATION_TONES[value] ?? 'neutral' as Tone } : null)

const OBA_TONES: Record<string, Tone> = { APPROVED: 'success', PENDING: 'warning', REJECTED: 'error', NOT_STARTED: 'neutral' }

export const obaOf = (value?: string) => (value ? { label: tOr(`business.oba.status.${value}`, value), tone: OBA_TONES[value] ?? 'neutral' as Tone } : null)
