import type { H3Event } from 'h3'

// Fictional "account and numbers" data for demo mode. Writes are checked with the same rules as the real
// routes and kept in memory until the server restarts, so a screenshot can show a change without Meta.

const ar = () => requestedLocale() !== 'en'
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString().replace(/\.\d+Z$/, '+0000')

interface DemoPhone {
  profile: BusinessProfile
  automation: Automation
  username: Username
  qr: QrCode[]
  blocked: BlockedUser[]
}

const phones = new Map<string, DemoPhone>()

function demoPhone(id: string): DemoPhone {
  const key = `${id}:${requestedLocale()}`

  if (!phones.has(key)) {
    const main = id.endsWith('1')

    phones.set(key, ar() ? arabicPhone(main) : {
      profile: {
        about: main ? 'Flowers and gifts, delivered the same day' : 'Yasmin Store, Jeddah branch',
        address: '100 Example Street, Springfield',
        description: 'Fresh flowers, gift boxes and same-day delivery. Message us to order or to track a delivery.',
        email: 'hello@example.com',
        websites: ['https://example.com/'],
        vertical: 'RETAIL',
      },
      automation: main
        ? {
            enable_welcome_message: true,
            prompts: ['Track my order', 'Order flowers for today', 'Talk to someone'],
            commands: [{ command_name: 'order', command_description: 'Start a new order' }, { command_name: 'track', command_description: 'Where is my order?' }],
          }
        : { enable_welcome_message: false, prompts: [], commands: [] },
      username: main ? { username: 'yasminstore', status: 'APPROVED' } : {},
      qr: main
        ? [
            { code: 'DEMO4QR8STORE1', prefilled_message: 'Hello, I would like to order flowers', deep_link_url: 'https://wa.me/message/DEMO4QR8STORE1' },
            { code: 'DEMO7QR2TRACK9', prefilled_message: 'Where is my order?', deep_link_url: 'https://wa.me/message/DEMO7QR2TRACK9' },
          ]
        : [],
      blocked: main ? [{ wa_id: '15550100199' }, { wa_id: '15550100277' }] : [],
    })
  }

  return phones.get(key)!
}

function arabicPhone(main: boolean): DemoPhone {
  return {
    profile: {
      about: main ? 'ورود وهدايا، توصيل في اليوم نفسه' : 'متجر الياسمين، فرع جدة',
      address: '100 شارع المثال، سبرينغفيلد',
      description: 'ورود طازجة وصناديق هدايا وتوصيل في اليوم نفسه. راسلنا لتطلب أو لتتابع طلبك.',
      email: 'hello@example.com',
      websites: ['https://example.com/'],
      vertical: 'RETAIL',
    },
    automation: main
      ? {
          enable_welcome_message: true,
          prompts: ['أين طلبي؟', 'أريد ورداً لليوم', 'أريد التحدث مع موظف'],
          commands: [{ command_name: 'order', command_description: 'ابدأ طلباً جديداً' }, { command_name: 'track', command_description: 'تتبّع طلبك' }],
        }
      : { enable_welcome_message: false, prompts: [], commands: [] },
    username: main ? { username: 'yasminstore', status: 'APPROVED' } : {},
    qr: main
      ? [
          { code: 'DEMO4QR8STORE1', prefilled_message: 'مرحباً، أريد طلب ورد', deep_link_url: 'https://wa.me/message/DEMO4QR8STORE1' },
          { code: 'DEMO7QR2TRACK9', prefilled_message: 'أين طلبي؟', deep_link_url: 'https://wa.me/message/DEMO7QR2TRACK9' },
        ]
      : [],
    blocked: main ? [{ wa_id: '15550100199' }, { wa_id: '15550100277' }] : [],
  }
}

const DEMO_PHONES = ['200000000000001', '200000000000002']

export function demoRequirePhone(event: H3Event): string {
  const phone = String(getQuery(event).phone ?? '')

  if (!DEMO_PHONES.includes(phone)) {
    throw apiError(404, t('business.errors.phone'))
  }

  return phone
}

const health = (value: string, errors?: HealthError[]): HealthStatus => ({ can_send_message: value, entities: errors ? [{ entity_type: 'PHONE_NUMBER', id: '', can_send_message: value, errors }] : [] })

export function demoBusiness(id?: unknown): BusinessDetails {
  const jeddah = id === 'demo-jeddah'
  const name = jeddah ? 'Yasmin Store Jeddah' : 'Yasmin Store'
  const phone: PhoneDetails = jeddah
    ? {
        id: '200000000000002',
        display_phone_number: '+1 555-010-0142',
        verified_name: ar() ? 'متجر الياسمين جدة' : name,
        quality_rating: 'YELLOW',
        whatsapp_business_manager_messaging_limit: 'TIER_2K',
        status: 'FLAGGED',
        name_status: 'APPROVED',
        new_display_name: 'Yasmin Flowers Jeddah',
        new_name_status: 'PENDING_REVIEW',
        is_official_business_account: false,
        official_business_account: { oba_status: 'NOT_STARTED' },
        account_mode: 'LIVE',
        health_status: health('LIMITED', [{
          error_code: 141006,
          error_description: ar() ? 'جودة الرقم منخفضة، فقد يقلّ عدد من تصلهم الرسائل.' : 'The number\'s quality is low, so fewer people may be reached.',
          possible_solution: ar() ? 'قلّل الرسائل التسويقية وأرسلها لمن طلبها فقط حتى تتحسن الجودة.' : 'Send fewer marketing messages, only to people who asked for them, until quality improves.',
        }]),
      }
    : {
        id: '200000000000001',
        display_phone_number: '+1 555-010-0100',
        verified_name: ar() ? 'متجر الياسمين' : name,
        quality_rating: 'GREEN',
        whatsapp_business_manager_messaging_limit: 'TIER_10K',
        status: 'CONNECTED',
        name_status: 'APPROVED',
        is_official_business_account: true,
        official_business_account: { oba_status: 'APPROVED' },
        account_mode: 'LIVE',
        health_status: health('AVAILABLE'),
      }

  return {
    account: {
      id: jeddah ? '100000000000002' : '100000000000001',
      name,
      account_review_status: 'APPROVED',
      business_verification_status: jeddah ? 'PENDING' : 'VERIFIED',
      ownership_type: jeddah ? 'CLIENT_OWNED' : 'SELF',
      primary_funding_id: jeddah ? undefined : '300000000000001',
      health_status: jeddah
        ? {
            can_send_message: 'LIMITED',
            entities: [{
              entity_type: 'WABA',
              id: '100000000000002',
              can_send_message: 'LIMITED',
              errors: [{
                error_code: 141010,
                error_description: ar() ? 'لا توجد وسيلة دفع لهذا الحساب.' : 'This account has no payment method.',
                possible_solution: ar() ? 'أضف وسيلة دفع في إعدادات الدفع في Meta Business Suite.' : 'Add a payment method in Meta Business Suite billing settings.',
              }],
            }],
          }
        : health('AVAILABLE'),
    },
    phones: { data: [phone] },
    templates: {
      data: jeddah
        ? [{ id: '9000000000000099', name: 'weekend_offer', language: 'ar', health_status: { can_send_message: 'BLOCKED', entities: [{ entity_type: 'MESSAGE_TEMPLATE', id: '9000000000000099', can_send_message: 'BLOCKED', errors: [{ error_code: 132015, error_description: ar() ? 'القالب موقوف بسبب انخفاض جودته.' : 'The template is paused for low quality.', possible_solution: ar() ? 'عدّل نص القالب ثم أرسله للمراجعة.' : 'Edit the template text and submit it again.' }] }] } }]
        : [],
    },
  }
}

const EVENTS: [string, string, number][] = [
  ['MESSAGE_TEMPLATE', 'TEMPLATE_APPROVED', 2],
  ['MESSAGE_TEMPLATE', 'TEMPLATE_CREATED', 5],
  ['BUSINESS_PROFILE', 'PROFILE_UPDATED', 26],
  ['USER', 'USER_ADDED', 49],
  ['PHONE_NUMBER', 'DISPLAY_NAME_APPROVED', 73],
  ['PAYMENT_CONFIGURATION', 'PAYMENT_METHOD_ADDED', 120],
  ['MESSAGE_TEMPLATE', 'TEMPLATE_EDITED', 150],
  ['APP', 'APP_SUBSCRIBED', 200],
  ['PHONE_NUMBER', 'PHONE_NUMBER_REGISTERED', 260],
  ['ACCOUNT', 'ACCOUNT_REVIEW_APPROVED', 300],
]

export function demoActivities(after?: unknown): { data: Activity[], after: string | null } {
  const start = after === 'page2' ? 6 : 0
  const rows = EVENTS.slice(start, start + 6).map(([category, event_type, hours], index) => ({
    id: String(500 + start + index),
    category,
    event_type,
    timestamp: hoursAgo(hours),
    actor_id: '400000000000001',
  }))

  return { data: rows, after: start ? null : 'page2' }
}

export function demoUsers(): { data: AssignedUser[] } {
  return {
    data: [
      { id: '400000000000001', name: ar() ? 'سارة أحمد' : 'Sara Ahmed', user_type: 'BUSINESS_USER', tasks: ['MANAGE', 'MANAGE_TEMPLATES', 'MANAGE_PHONE', 'VIEW_COST', 'MESSAGING'] },
      { id: '400000000000002', name: ar() ? 'عمر خالد' : 'Omar Khaled', user_type: 'BUSINESS_USER', tasks: ['MANAGE_TEMPLATES', 'MESSAGING'] },
      { id: '400000000000003', name: 'Store bot', user_type: 'SYSTEM_USER', tasks: ['DEVELOP', 'MESSAGING'] },
    ],
  }
}

export function demoPhoneSettings(event: H3Event): PhoneSettings {
  const phone = demoPhone(demoRequirePhone(event))

  return {
    profile: { data: phone.profile },
    automation: { data: phone.automation },
    username: { data: phone.username },
    qr: { data: phone.qr },
    blocked: { data: phone.blocked, more: false },
  }
}

/** The demo's answer for a POST or DELETE under /api/business, after the same checks the real route runs. */
export async function demoBusinessWrite(event: H3Event, path: string) {
  const phone = demoPhone(demoRequirePhone(event))
  const body = event.method === 'DELETE' || path.endsWith('/photo') ? {} : await readBody<Record<string, unknown>>(event)

  switch (path) {
    case '/api/business/profile': {
      const input = readProfile(body)
      failOn(profileProblems(input))
      phone.profile = { ...phone.profile, ...input }

      return { success: true }
    }
    case '/api/business/photo': {
      const file = (await readMultipartFormData(event))?.find(entry => entry.name === 'photo')

      if (!file || !PHOTO_TYPES.includes(file.type ?? '') || !isImageOf(file.data, file.type ?? '')) {
        throw apiError(422, t('business.rules.photoType'))
      }

      if (file.data.byteLength > PHOTO_MAX_BYTES) {
        throw apiError(422, t('business.rules.photoSize'))
      }

      return { success: true }
    }
    case '/api/business/automation': {
      const input = readAutomation(body)
      failOn(automationProblems(input))
      phone.automation = input

      return { success: true }
    }
    case '/api/business/display-name':
      failOn(displayNameProblems(readText(body.name)))

      return { success: true }
    case '/api/business/oba':
      failOn(obaProblems(readOba(body)))

      return { success: true }
    case '/api/business/username': {
      const username = readText(body.username).toLowerCase()
      failOn(usernameProblems(username))
      phone.username = { username, status: 'RESERVED' }

      return { success: true }
    }
    case '/api/business/qr': {
      const code = String(getQuery(event).code ?? '')

      if (event.method === 'DELETE') {
        phone.qr = phone.qr.filter(item => item.code !== code)

        return { success: true }
      }

      const message = readText(body.prefilled_message)
      failOn(qrProblems(message))
      const existing = phone.qr.find(item => item.code === readText(body.code))

      if (existing) {
        existing.prefilled_message = message

        return existing
      }

      const created = { code: `DEMO${Date.now().toString(36).toUpperCase()}`, prefilled_message: message, deep_link_url: '' }
      created.deep_link_url = `https://wa.me/message/${created.code}`
      phone.qr.unshift(created)

      return created
    }
    case '/api/business/block': {
      const { users, problems } = normalizeUsers(readList(body.users))
      failOn(problems)

      if (body.action === 'unblock') {
        phone.blocked = phone.blocked.filter(item => !users.some(user => user.replace('+', '') === item.wa_id))

        return { done: users.length, failed: [] }
      }

      // Like Meta, the demo refuses anyone who has not written in the last 24 hours: here, numbers ending in 0.
      const refused = users.filter(user => user.endsWith('0'))
      const added = users.filter(user => !refused.includes(user))
      phone.blocked.push(...added.map(user => ({ wa_id: user.replace('+', '') })))

      return { done: added.length, failed: refused.map(input => ({ input, reason: t('business.blocked.notRecent') })) }
    }
  }

  throw apiError(404, 'Not found')
}

export function demoUsernameSuggestions(event: H3Event) {
  demoRequirePhone(event)

  return { data: ['yasminflowers', 'yasmin.store', 'yasmin_gifts'] }
}

export function demoQrImage(event: H3Event) {
  demoRequirePhone(event)

  throw apiError(422, t('server.notInDemo'))
}
