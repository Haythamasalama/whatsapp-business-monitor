// Meta's limits for the "account and numbers" features. The page and the server check the same rules, and
// each check returns translation keys, so the rules stay free of runtime imports (see the Nitro pitfalls).

export const PHONE_ID = /^\d{5,20}$/

// https://developers.facebook.com/documentation/business-messaging/whatsapp/business-profiles
export const PROFILE_LIMITS = { about: 139, address: 256, description: 512, email: 128, website: 256, websites: 2 }

export const VERTICALS = ['UNDEFINED', 'OTHER', 'AUTO', 'BEAUTY', 'APPAREL', 'EDU', 'ENTERTAIN', 'EVENT_PLAN', 'FINANCE', 'GROCERY', 'GOVT', 'HOTEL', 'HEALTH', 'NONPROFIT', 'PROF_SERVICES', 'RETAIL', 'TRAVEL', 'RESTAURANT', 'NOT_A_BIZ']

/** Profile photos: JPEG or PNG, at most 5 MB (Meta's limit for profile_picture_handle uploads). */
export const PHOTO_TYPES = ['image/jpeg', 'image/png']
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024

// https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/conversational-components
export const AUTOMATION_LIMITS = { prompts: 4, prompt: 80, commands: 30, command: 32, hint: 256 }

// https://developers.facebook.com/documentation/business-messaging/whatsapp/qr-codes
export const QR_MESSAGE_MAX = 140

// https://developers.facebook.com/documentation/business-messaging/whatsapp/block-users
export const BLOCK_MAX = 1000

export const DISPLAY_NAME_MAX = 512
export const USERNAME_PATTERN = /^[a-z0-9._]{3,35}$/

export interface ProfileInput {
  about: string
  address: string
  description: string
  email: string
  websites: string[]
  vertical: string
}

export interface AutomationInput {
  enable_welcome_message: boolean
  prompts: string[]
  commands: { command_name: string, command_description: string }[]
}

export interface ObaInput {
  business_website_url: string
  primary_country_of_operation: string
  primary_language: string
  supporting_links: string[]
  parent_business_or_brand: string
  additional_supporting_information: string
}

const chars = (text: string) => [...text].length
const isUrl = (text: string) => /^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]+$/i.test(text)
const EMOJI = /\p{Extended_Pictographic}/u

export function profileProblems(input: ProfileInput): string[] {
  const problems: string[] = []

  if (chars(input.about) > PROFILE_LIMITS.about) {
    problems.push('business.rules.aboutTooLong')
  }

  if (chars(input.address) > PROFILE_LIMITS.address) {
    problems.push('business.rules.addressTooLong')
  }

  if (chars(input.description) > PROFILE_LIMITS.description) {
    problems.push('business.rules.descriptionTooLong')
  }

  if (input.email && (chars(input.email) > PROFILE_LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))) {
    problems.push('business.rules.email')
  }

  if (input.websites.length > PROFILE_LIMITS.websites || input.websites.some(site => chars(site) > PROFILE_LIMITS.website || !isUrl(site))) {
    problems.push('business.rules.websites')
  }

  if (input.vertical && !VERTICALS.some(vertical => vertical === input.vertical)) {
    problems.push('business.rules.vertical')
  }

  return problems
}

export function automationProblems(input: AutomationInput): string[] {
  const problems: string[] = []

  if (input.prompts.length > AUTOMATION_LIMITS.prompts || input.prompts.some(prompt => !prompt.trim() || chars(prompt) > AUTOMATION_LIMITS.prompt)) {
    problems.push('business.rules.prompts')
  }

  if (input.commands.length > AUTOMATION_LIMITS.commands) {
    problems.push('business.rules.commandsCount')
  }

  if (input.commands.some(command => !/^[\p{L}\p{N}_-]{1,32}$/u.test(command.command_name) || chars(command.command_name) > AUTOMATION_LIMITS.command)) {
    problems.push('business.rules.commandName')
  }

  if (input.commands.some(command => !command.command_description.trim() || chars(command.command_description) > AUTOMATION_LIMITS.hint)) {
    problems.push('business.rules.commandHint')
  }

  if ([...input.prompts, ...input.commands.flatMap(command => [command.command_name, command.command_description])].some(text => EMOJI.test(text))) {
    problems.push('business.rules.noEmoji')
  }

  if (new Set(input.commands.map(command => command.command_name.toLowerCase())).size !== input.commands.length) {
    problems.push('business.rules.commandDuplicate')
  }

  return problems
}

export function qrProblems(message: string): string[] {
  return !message.trim() || chars(message) > QR_MESSAGE_MAX ? ['business.rules.qrMessage'] : []
}

/** Numbers as the customer wrote them: digits with an optional +, 7 to 15 digits (E.164). */
export function normalizeUsers(list: string[]): { users: string[], problems: string[] } {
  const users = [...new Set(list.map(entry => entry.replace(/[\s()-]/g, '')).filter(Boolean))]
  const problems: string[] = []

  if (!users.length) {
    problems.push('business.rules.usersEmpty')
  }

  if (users.length > BLOCK_MAX) {
    problems.push('business.rules.usersTooMany')
  }

  if (users.some(user => !/^\+?\d{7,15}$/.test(user))) {
    problems.push('business.rules.userFormat')
  }

  return { users, problems }
}

export function displayNameProblems(name: string): string[] {
  const value = name.trim()

  if (!value || chars(value) > DISPLAY_NAME_MAX) {
    return ['business.rules.displayName']
  }

  return EMOJI.test(value) ? ['business.rules.noEmoji'] : []
}

export function usernameProblems(username: string): string[] {
  return USERNAME_PATTERN.test(username) && !/^[._]|[._]$|\.\./.test(username) ? [] : ['business.rules.username']
}

export function obaProblems(input: ObaInput): string[] {
  const problems: string[] = []

  if (!isUrl(input.business_website_url)) {
    problems.push('business.rules.obaWebsite')
  }

  if (!/^[A-Z]{2}$/.test(input.primary_country_of_operation)) {
    problems.push('business.rules.obaCountry')
  }

  if (!/^[a-z]{2,3}(_[A-Z]{2})?$/.test(input.primary_language)) {
    problems.push('business.rules.obaLanguage')
  }

  if (input.supporting_links.length < 5 || input.supporting_links.length > 10 || input.supporting_links.some(link => !isUrl(link))) {
    problems.push('business.rules.obaLinks')
  }

  return problems
}
export const QR_CODE = /^[A-Za-z0-9]{6,32}$/
