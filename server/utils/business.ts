import type { H3Event } from 'h3'

// Reads and writes for "account and numbers". Doc base for the links below:
// https://developers.facebook.com/documentation/business-messaging/whatsapp/

const PHONE_FIELDS = [
  'id,display_phone_number,verified_name,quality_rating,whatsapp_business_manager_messaging_limit,status,name_status,new_display_name,new_name_status,is_official_business_account,official_business_account,health_status,account_mode,throughput',
  'id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,status,name_status,new_display_name,new_name_status,is_official_business_account,health_status,throughput',
  'id,display_phone_number,verified_name,quality_rating,messaging_limit_tier,status,name_status',
]

export async function businessDetails(account: Account): Promise<BusinessDetails> {
  const [waba, phones, templates] = await Promise.all([
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-account/whatsapp-business-account-api
    graphFields(account, account.waba, [
      'id,name,account_review_status,business_verification_status,ownership_type,primary_funding_id,health_status,owner_business_info',
      'id,name,account_review_status,business_verification_status,health_status,owner_business_info',
      'id,name,account_review_status',
    ]),
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers
    graphFields(account, `${account.waba}/phone_numbers`, PHONE_FIELDS),
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/support/health-status
    graph(account, 'GET', `${account.waba}/message_templates`, { fields: 'id,name,language,health_status', limit: 100 }),
  ])

  return {
    account: waba,
    phones,
    // Only templates that can't be sent freely are worth showing.
    templates: templates.error
      ? { error: templates.error }
      : { data: (templates.data ?? []).filter((item: TemplateHealth) => item.health_status && item.health_status.can_send_message !== 'AVAILABLE') },
  }
}

export async function activities(account: Account, after?: string): Promise<{ data: Activity[], after: string | null }> {
  // https://developers.facebook.com/documentation/business-messaging/whatsapp/reference/whatsapp-business-account/activities-api
  const response = orFail(await graph(account, 'GET', `${account.waba}/activities`, {
    fields: 'id,actor_business_id,actor_id,category,event_type,timestamp',
    limit: 25,
    after,
  }))

  return { data: response.data ?? [], after: response.paging?.next ? response.paging?.cursors?.after ?? null : null }
}

export async function assignedUsers(account: Account): Promise<{ data: AssignedUser[] }> {
  const waba = orFail(await graph(account, 'GET', account.waba, { fields: 'owner_business_info' }))
  const business = waba.owner_business_info?.id

  if (!business) {
    return { data: [] }
  }

  // https://developers.facebook.com/docs/graph-api/reference/whats-app-business-account/assigned_users/
  const response = orFail(await graph(account, 'GET', `${account.waba}/assigned_users`, { business, fields: 'id,name,user_type,tasks', limit: 100 }))

  return { data: response.data ?? [] }
}

/** The phone id from the query, after checking it belongs to this account, so a request can't reach another number. */
export async function requirePhone(event: H3Event, account: Account): Promise<string> {
  const phone = String(getQuery(event).phone ?? '')

  if (!PHONE_ID.test(phone)) {
    throw apiError(400, t('business.errors.phone'))
  }

  // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers
  const list = orFail(await graph(account, 'GET', `${account.waba}/phone_numbers`, { fields: 'id', limit: 100 }))

  if (!(list.data ?? []).some((item: { id: string }) => item.id === phone)) {
    throw apiError(404, t('business.errors.phone'))
  }

  return phone
}

const part = <T>(response: GraphResponse, pick: (value: GraphResponse) => T) => (response.error ? { error: response.error } : { data: pick(response) })

export async function phoneSettings(account: Account, phone: string): Promise<PhoneSettings> {
  const [profile, automation, username, qr, blocked] = await Promise.all([
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles
    graph(account, 'GET', `${phone}/whatsapp_business_profile`, { fields: 'about,address,description,email,profile_picture_url,websites,vertical' }),
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/conversational-components
    graph(account, 'GET', phone, { fields: 'conversational_automation' }),
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/username
    graph(account, 'GET', `${phone}/username`),
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes
    graph(account, 'GET', `${phone}/message_qrdls`, { limit: 100 }),
    // https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users
    graph(account, 'GET', `${phone}/block_users`, { limit: 100 }),
  ])

  return {
    profile: part(profile, value => (value.data?.[0] ?? {}) as BusinessProfile),
    automation: part(automation, value => (value.conversational_automation ?? {}) as Automation),
    username: part(username, value => ({ username: value.username ?? value.data?.[0]?.username, status: value.status ?? value.data?.[0]?.status }) as Username),
    qr: part(qr, value => (value.data ?? []) as QrCode[]),
    blocked: { ...part(blocked, value => (value.data?.[0]?.block_users ?? value.data ?? []) as BlockedUser[]), more: Boolean(blocked.paging?.next) },
  }
}

/** Throws a 422 with one translated problem per line. */
export function failOn(problems: string[]): void {
  if (problems.length) {
    throw apiError(422, problems.map(key => tOr(key, key)).join('\n'))
  }
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')
const list = (value: unknown) => (Array.isArray(value) ? value.map(text).filter(Boolean) : [])

export function readProfile(body: Record<string, unknown>): ProfileInput {
  return {
    about: text(body.about),
    address: text(body.address),
    description: text(body.description),
    email: text(body.email),
    websites: list(body.websites),
    vertical: text(body.vertical),
  }
}

export function readAutomation(body: Record<string, unknown>): AutomationInput {
  const commands = Array.isArray(body.commands) ? body.commands : []

  return {
    enable_welcome_message: body.enable_welcome_message === true,
    prompts: list(body.prompts),
    commands: commands.map((command: Record<string, unknown>) => ({
      command_name: text(command?.command_name).replace(/^\//, ''),
      command_description: text(command?.command_description),
    })),
  }
}

export function readOba(body: Record<string, unknown>): ObaInput {
  return {
    business_website_url: text(body.business_website_url),
    primary_country_of_operation: text(body.primary_country_of_operation).toUpperCase(),
    primary_language: text(body.primary_language),
    supporting_links: list(body.supporting_links),
    parent_business_or_brand: text(body.parent_business_or_brand),
    additional_supporting_information: text(body.additional_supporting_information).slice(0, 1000),
  }
}

export const readText = text
export const readList = list

/** The bytes must really be the image the browser says it is. */
export function isImageOf(data: Uint8Array, type: string): boolean {
  if (type === 'image/png') {
    return [0x89, 0x50, 0x4E, 0x47].every((byte, index) => data[index] === byte)
  }

  return data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF
}
