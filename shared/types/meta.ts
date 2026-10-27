export interface MetaError {
  message?: string
  error_user_title?: string
  error_user_msg?: string
  code?: number
  error_subcode?: number
}

export interface MetaComponent {
  type: string
  format?: string
  text?: string
  example?: { body_text?: string[][], header_handle?: string[] }
  buttons?: { type: string, text: string }[]
}

export interface MetaTemplate {
  id: string
  name: string
  language: string
  status: string
  category: string
  parameter_format?: string
  components?: MetaComponent[]
  quality_score?: { score?: string }
  rejected_reason?: string
}

export interface TemplateGroup {
  name: string
  category: string
  items: MetaTemplate[]
}

export interface TemplateText {
  header?: string
  body: string
  footer?: string
  examples: string[]
}

export interface Phone {
  id?: string
  display_phone_number: string
  verified_name?: string
  quality_rating?: string
  messaging_limit_tier?: string
  status?: string
  name_status?: string
  throughput?: { level?: string }
}

export interface AccountSummary {
  id: string
  label: string
  waba_id: string
  version: string
  name: string | null
  phones: Phone[]
  photo: string | null
  error: string | null
}

export interface DiscoveredAccount {
  waba_id: string
  name: string | null
  phones: Phone[]
}

export interface CurrencyAmount {
  amount?: string
  currency?: string
}

export interface CreditLine {
  id: string
  legal_entity_name?: string
  balance?: CurrencyAmount
  credit_available?: CurrencyAmount
  max_balance?: CurrencyAmount
}

export interface Spend {
  since: string
  currency: string | null
  total: number
  messages: number
  by_category: Record<string, { cost: number, messages: number }>
  daily: { date: string, cost: number, messages: number }[]
}

export interface TemplateStats {
  sent: number
  delivered: number
  read: number
  clicked: number
  cost: number
  daily: { date: string, sent: number }[]
}

export interface Analytics {
  data: Record<string, TemplateStats>
  days: number
}

export interface Overview {
  account: { name?: string, currency?: string, owner_business_info?: { id: string, name?: string }, error?: MetaError }
  phones: { data?: Phone[], error?: MetaError }
  spend: Spend | { error: MetaError }
  credit: { data?: CreditLine[], error?: MetaError } | null
}

export interface TemplateCounts {
  /** Templates by name, whatever their languages. */
  total: number
  statuses: Record<string, number>
}

export interface AccountStats {
  id: string
  spend: Spend | null
  spendError: string | null
  phones: Phone[]
  templates: TemplateCounts | null
  error: string | null
}

export interface Release {
  version: string
  url: string
}

export interface VersionInfo {
  current: string
  /** A newer release than the one running, or null. */
  latest: Release | null
  /** An updater container installs new releases by itself (compose.yaml). */
  autoUpdate: boolean
}

export interface ImportResult {
  added: string[]
  replaced: string[]
  skipped: { id: string, reason: 'exists' | 'invalid' }[]
}

export interface AppInfo {
  setup_required: boolean
  user: { username: string } | null
  instance_name: string
  public_url: string
  default_locale: 'ar' | 'en'
}

export interface SettingsInfo {
  instance_name: string
  public_url: string
  default_locale: 'ar' | 'en'
  update_check: boolean
  /** Where the database file is, with ~ for the home folder. */
  storage: string
  /** WHATSAPP_TEMPLATES_UPDATE_CHECK=false turns the check off whatever the setting says. */
  update_check_forced_off: boolean
}
