export type Tone = 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'info'

export const LANGS = ['ar', 'en'] as const
export type Lang = (typeof LANGS)[number]

export const LANG_NAMES: Record<string, string> = { ar: 'العربية', en: 'الإنجليزية' }

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

export const statusOf = (status: string) => STATUS[status] ?? { label: status, tone: 'neutral' as Tone, icon: 'i-lucide-circle-help' }

export function messagingLimit(tier?: string): string {
  if (!tier) {
    return ''
  }

  return tier === 'TIER_UNLIMITED' ? 'دون حد يومي' : `${TIERS[tier] ?? tier} عميل يومياً`
}
