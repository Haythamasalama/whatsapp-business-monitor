// A fictional store, so the project can be tried and screenshotted without a Meta account.
export const isDemo = () => ['1', 'true'].includes(String(process.env.WHATSAPP_TEMPLATES_DEMO ?? '').toLowerCase())

interface DemoStore {
  id: string
  label: string
  name: string
  waba: string
  phone: Phone
  /** How busy this store is next to the first one. */
  scale: number
}

const STORES: DemoStore[] = [
  {
    id: 'demo',
    label: 'متجر الياسمين',
    name: 'Yasmin Store',
    waba: '100000000000001',
    phone: { id: '200000000000001', display_phone_number: '+1 555-010-0100', verified_name: 'متجر الياسمين', quality_rating: 'GREEN', whatsapp_business_manager_messaging_limit: 'TIER_10K', status: 'CONNECTED', name_status: 'APPROVED', throughput: { level: 'STANDARD' } },
    scale: 1,
  },
  {
    id: 'demo-jeddah',
    label: 'متجر الياسمين · جدة',
    name: 'Yasmin Store Jeddah',
    waba: '100000000000002',
    phone: { id: '200000000000002', display_phone_number: '+1 555-010-0142', verified_name: 'متجر الياسمين جدة', quality_rating: 'YELLOW', whatsapp_business_manager_messaging_limit: 'TIER_2K', status: 'FLAGGED', name_status: 'APPROVED', throughput: { level: 'STANDARD' } },
    scale: 0.42,
  },
]

// The fictional store speaks the page's language, so screenshots read naturally in either one.
function localized(store: DemoStore): DemoStore {
  return requestedLocale() === 'en' ? { ...store, label: store.name, phone: { ...store.phone, verified_name: store.name } } : store
}

const storeFor = (id?: unknown) => localized(STORES.find(store => store.id === id) ?? STORES[0]!)
const stores = () => STORES.map(localized)
const COST: Record<string, number> = { UTILITY: 0.0107, MARKETING: 0.0436, AUTHENTICATION: 0.0102 }

interface DemoTemplate {
  template: MetaTemplate
  daily: number
  readRate: number
}

let nextId = 9_000_000_000_000_000

function demoTemplate(
  name: string,
  language: string,
  category: string,
  status: string,
  body: string,
  examples: string[],
  extra: { daily?: number, readRate?: number, footer?: string, buttons?: { type: string, text: string }[], rejected?: string } = {},
): DemoTemplate {
  const components: MetaComponent[] = [{ type: 'BODY', text: body, example: { body_text: [examples] } }]

  if (extra.footer) {
    components.push({ type: 'FOOTER', text: extra.footer })
  }

  if (extra.buttons) {
    components.push({ type: 'BUTTONS', buttons: extra.buttons })
  }

  return {
    template: {
      id: String(++nextId),
      name,
      language,
      category,
      status,
      parameter_format: 'POSITIONAL',
      components,
      quality_score: { score: status === 'APPROVED' ? 'GREEN' : 'UNKNOWN' },
      rejected_reason: extra.rejected ?? 'NONE',
    },
    daily: extra.daily ?? 0,
    readRate: extra.readRate ?? 0.78,
  }
}

const TEMPLATES: DemoTemplate[] = [
  demoTemplate('order_confirmation', 'ar', 'UTILITY', 'APPROVED', 'تم تأكيد طلبك رقم {{1}} بقيمة {{2}}.\n\nسنرسل لك رسالة عند شحن الطلب.', ['10482', '245 ر.س'], { daily: 118, footer: 'متجر الياسمين' }),
  demoTemplate('order_confirmation', 'en', 'UTILITY', 'APPROVED', 'Your order {{1}} for {{2}} is confirmed.\n\nWe\'ll message you when it ships.', ['10482', 'SAR 245'], { daily: 34, footer: 'Yasmin Store' }),
  demoTemplate('shipping_update', 'ar', 'UTILITY', 'APPROVED', 'طلبك {{1}} في الطريق إليك مع {{2}}، ويصل خلال {{3}}.', ['10482', 'شركة الشحن السريع', 'يومين'], { daily: 96, buttons: [{ type: 'URL', text: 'تتبّع الشحنة' }] }),
  demoTemplate('shipping_update', 'en', 'UTILITY', 'APPROVED', 'Your order {{1}} is on its way with {{2}} and arrives within {{3}}.', ['10482', 'Fast Courier', '2 days'], { daily: 27, buttons: [{ type: 'URL', text: 'Track shipment' }] }),
  demoTemplate('delivery_code', 'ar', 'AUTHENTICATION', 'APPROVED', '*{{1}}* هو رمز تأكيد الاستلام الخاص بك.', ['482913'], { daily: 61, readRate: 0.66, buttons: [{ type: 'OTP', text: 'نسخ الرمز' }] }),
  demoTemplate('delivery_code', 'en', 'AUTHENTICATION', 'APPROVED', '*{{1}}* is your delivery confirmation code.', ['482913'], { daily: 17, readRate: 0.66, buttons: [{ type: 'OTP', text: 'Copy code' }] }),
  demoTemplate('back_in_stock', 'ar', 'MARKETING', 'APPROVED', 'عاد {{1}} إلى المتجر! الكمية محدودة، والطلب متاح الآن.', ['عطر الياسمين الليلي'], { daily: 42, readRate: 0.61, buttons: [{ type: 'QUICK_REPLY', text: 'أريده' }, { type: 'QUICK_REPLY', text: 'لا شكراً' }] }),
  demoTemplate('back_in_stock', 'en', 'MARKETING', 'APPROVED', '{{1}} is back in stock! Quantities are limited, order now.', ['Night Jasmine perfume'], { daily: 11, readRate: 0.58, buttons: [{ type: 'QUICK_REPLY', text: 'I want it' }, { type: 'QUICK_REPLY', text: 'No thanks' }] }),
  demoTemplate('payment_reminder', 'ar', 'UTILITY', 'APPROVED', 'تذكير: فاتورتك رقم {{1}} بقيمة {{2}} تستحق في {{3}}.', ['INV-2291', '120 ر.س', '30 أكتوبر'], { daily: 23 }),
  demoTemplate('payment_reminder', 'en', 'UTILITY', 'REJECTED', 'Reminder: invoice {{1}} for {{2}} is due {{3}}', ['INV-2291', 'SAR 120', 'Oct 30'], { rejected: 'INVALID_FORMAT' }),
  demoTemplate('appointment_reminder', 'ar', 'UTILITY', 'APPROVED', 'نذكّرك بموعدك في {{1}} يوم {{2}} الساعة {{3}}.', ['فرع الرياض', 'الخميس', '4:30 م'], { daily: 14 }),
  demoTemplate('weekend_offer', 'ar', 'MARKETING', 'PENDING', 'عرض نهاية الأسبوع: خصم {{1}} على كل العطور حتى {{2}}.', ['20٪', 'السبت']),
  demoTemplate('weekend_offer', 'en', 'MARKETING', 'PENDING', 'Weekend offer: {{1}} off every perfume until {{2}}.', ['20%', 'Saturday']),
  demoTemplate('review_request', 'en', 'MARKETING', 'PAUSED', 'How was your order {{1}}? Tell us in one tap.', ['10482'], { daily: 4, readRate: 0.52 }),
]

// Deterministic "noise", so every reload and every screenshot shows the same numbers.
const wave = (seed: number) => 0.62 + 0.38 * Math.abs(Math.sin(seed * 12.9898) * 1.7 % 1)

const dayStart = (offset: number) => {
  const now = new Date()

  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + offset))
}

function sendsOn(entry: DemoTemplate, index: number, date: Date, store: DemoStore): number {
  return Math.round(entry.daily * store.scale * wave(index * 31 + date.getUTCDate() + date.getUTCMonth() * 7 + store.waba.length * store.scale) * (date.getUTCDay() === 5 ? 0.55 : 1))
}

export function demoAccounts(): { data: AccountSummary[], storage: string } {
  return {
    data: stores().map(store => ({
      id: store.id,
      label: store.label,
      waba_id: store.waba,
      version: 'v23.0',
      name: store.name,
      phones: [store.phone],
      photo: null,
      error: null,
    })),
    storage: '~/.config/whatsapp-templates/whatsapp-manager.db',
  }
}

export function demoDiscover() {
  const store = stores()[0]!

  return { data: [{ waba_id: store.waba, name: store.name, phones: [store.phone] }] }
}

export function demoTemplates() {
  return { data: TEMPLATES.map(entry => entry.template) }
}

export function demoSummary(): { data: AccountStats[] } {
  return {
    data: stores().map((store) => {
      const overview = demoOverview(store.id)

      return {
        id: store.id,
        spend: 'error' in overview.spend ? null : overview.spend,
        spendError: null,
        phones: [store.phone],
        templates: templateCounts(TEMPLATES.map(entry => entry.template)),
        error: null,
      }
    }),
  }
}

export function demoAnalytics(id?: unknown): Analytics {
  const store = storeFor(id)
  const data: Record<string, TemplateStats> = {}

  TEMPLATES.forEach((entry, index) => {
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = dayStart(i - 29)

      return { date: date.toISOString().slice(0, 10), sent: sendsOn(entry, index, date, store) }
    })
    const sent = daily.reduce((sum, day) => sum + day.sent, 0)
    const delivered = Math.round(sent * 0.97)
    const hasQuickReplies = entry.template.components?.some(c => c.buttons?.some(b => b.type === 'QUICK_REPLY'))

    data[entry.template.id] = {
      sent,
      delivered,
      read: Math.round(delivered * entry.readRate),
      clicked: hasQuickReplies ? Math.round(delivered * 0.14) : 0,
      cost: Math.round(delivered * (COST[entry.template.category] ?? 0) * 100) / 100,
      daily,
    }
  })

  return { data, days: 30 }
}

export function demoOverview(id?: unknown): Overview {
  const store = storeFor(id)
  const now = new Date()
  const from = new Date(now.getFullYear(), now.getMonth(), 1)
  const byCategory: Spend['by_category'] = {}
  const daily: Spend['daily'] = []

  for (let day = new Date(from); day <= now; day.setDate(day.getDate() + 1)) {
    const utc = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()))
    let cost = 0
    let messages = 0

    TEMPLATES.forEach((entry, index) => {
      const sent = Math.round(sendsOn(entry, index, utc, store) * 0.97)
      const price = COST[entry.template.category] ?? 0
      const bucket = (byCategory[entry.template.category] ??= { cost: 0, messages: 0 })

      bucket.cost += sent * price
      bucket.messages += sent
      cost += sent * price
      messages += sent
    })

    const service = Math.round(9 * store.scale * wave(utc.getUTCDate()))
    const bucket = (byCategory.SERVICE ??= { cost: 0, messages: 0 })
    bucket.messages += service
    messages += service

    daily.push({ date: `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`, cost: Math.round(cost * 10_000) / 10_000, messages })
  }

  const total = daily.reduce((sum, day) => sum + day.cost, 0)

  return {
    account: { name: store.name, currency: 'USD' },
    phones: { data: [store.phone] },
    spend: {
      since: daily[0]!.date,
      currency: 'USD',
      total: Math.round(total * 100) / 100,
      messages: daily.reduce((sum, day) => sum + day.messages, 0),
      by_category: byCategory,
      daily,
    },
    credit: null,
  }
}
