export type Tone = 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'info'

/** Arabic and English come first everywhere; any other language Meta supports can be added. */
export const LANGS = ['ar', 'en']
export type Lang = string

export const EDIT_TABS = [
  { label: 'يدوي', value: 'fields', icon: 'i-lucide-text-cursor-input' },
  { label: 'المحتوى كاملاً', value: 'code', icon: 'i-lucide-clipboard-list' },
]

export const LANG_NAMES: Record<string, string> = { ar: 'العربية', en: 'الإنجليزية' }

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

export const STATUS: Record<string, { label: string, tone: Tone, icon: string }> = {
  APPROVED: { label: 'مُعتمد', tone: 'success', icon: 'i-lucide-circle-check' },
  PENDING: { label: 'قيد المراجعة', tone: 'warning', icon: 'i-lucide-clock' },
  IN_APPEAL: { label: 'قيد الاعتراض', tone: 'warning', icon: 'i-lucide-scale' },
  PAUSED: { label: 'موقوف مؤقتاً', tone: 'warning', icon: 'i-lucide-circle-pause' },
  REJECTED: { label: 'مرفوض', tone: 'error', icon: 'i-lucide-circle-x' },
  DISABLED: { label: 'معطّل', tone: 'error', icon: 'i-lucide-ban' },
  LIMIT_EXCEEDED: { label: 'تجاوز الحد', tone: 'error', icon: 'i-lucide-octagon-alert' },
  PENDING_DELETION: { label: 'قيد الحذف', tone: 'neutral', icon: 'i-lucide-trash-2' },
  DELETED: { label: 'محذوف', tone: 'neutral', icon: 'i-lucide-trash-2' },
  ARCHIVED: { label: 'مؤرشف', tone: 'neutral', icon: 'i-lucide-archive' },
}

export const MAIN_STATUSES = ['APPROVED', 'PENDING', 'REJECTED']

export const CATEGORY: Record<string, string> = {
  UTILITY: 'إشعارات',
  MARKETING: 'تسويق',
  AUTHENTICATION: 'رموز تحقق',
}

export const PRICING: Record<string, string> = {
  MARKETING: 'تسويق',
  MARKETING_LITE: 'تسويق مخفّف',
  UTILITY: 'إشعارات',
  AUTHENTICATION: 'رموز تحقق',
  AUTHENTICATION_INTERNATIONAL: 'رموز تحقق دولية',
  SERVICE: 'خدمة العملاء',
  ALL: 'كل الرسائل',
}

export const QUALITY: Record<string, { label: string, tone: Tone }> = {
  GREEN: { label: 'عالية', tone: 'success' },
  YELLOW: { label: 'متوسطة', tone: 'warning' },
  RED: { label: 'منخفضة', tone: 'error' },
  UNKNOWN: { label: 'غير محددة', tone: 'neutral' },
}

export const TIERS: Record<string, string> = {
  TIER_50: '50',
  TIER_250: '250',
  TIER_1K: '1,000',
  TIER_2K: '2,000',
  TIER_10K: '10,000',
  TIER_100K: '100,000',
}

export const REJECTIONS: Record<string, string> = {
  ABUSIVE_CONTENT: 'محتوى مسيء',
  INVALID_FORMAT: 'صيغة غير صالحة',
  PROMOTIONAL: 'محتوى ترويجي في فئة غير تسويقية',
  TAG_CONTENT_MISMATCH: 'المحتوى لا يطابق الفئة',
  INCORRECT_CATEGORY: 'فئة غير صحيحة',
  SCAM: 'اشتباه احتيال',
}

export function languageName(code: string): string {
  if (LANG_NAMES[code]) {
    return LANG_NAMES[code]
  }

  try {
    return new Intl.DisplayNames(['ar'], { type: 'language' }).of(code.replace('_', '-')) ?? code
  }
  catch {
    return code
  }
}

export const statusOf = (status: string) => STATUS[status] ?? { label: status, tone: 'neutral' as Tone, icon: 'i-lucide-circle-help' }

export function messagingLimit(tier?: string): string {
  if (!tier) {
    return ''
  }

  return tier === 'TIER_UNLIMITED' ? 'دون حد يومي' : `${TIERS[tier] ?? tier} عميل يومياً`
}
