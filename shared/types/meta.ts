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
  /** Deprecated by Meta; read only when whatsapp_business_manager_messaging_limit is missing. */
  messaging_limit_tier?: string
  whatsapp_business_manager_messaging_limit?: string
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
  setup_code_required?: boolean
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

export interface HealthError {
  error_code?: number
  error_description?: string
  possible_solution?: string
}

export interface HealthEntity {
  entity_type: string
  id: string
  can_send_message: string
  errors?: HealthError[]
}

export interface HealthStatus {
  can_send_message: string
  entities?: HealthEntity[]
}

export interface PhoneDetails extends Phone {
  id: string
  new_display_name?: string
  new_name_status?: string
  is_official_business_account?: boolean
  official_business_account?: { oba_status?: string }
  health_status?: HealthStatus
  account_mode?: string
  code_verification_status?: string
}

export interface TemplateHealth {
  id: string
  name: string
  language: string
  health_status: HealthStatus
}

export interface BusinessDetails {
  account: {
    id?: string
    name?: string
    account_review_status?: string
    business_verification_status?: string
    ownership_type?: string
    primary_funding_id?: string
    health_status?: HealthStatus
    owner_business_info?: { id: string, name?: string }
    error?: MetaError
  }
  phones: { data?: PhoneDetails[], error?: MetaError }
  templates: { data?: TemplateHealth[], error?: MetaError }
}

export interface Activity {
  id: string
  category?: string
  event_type?: string
  timestamp?: string
  actor_id?: string
  actor_business_id?: string
}

export interface AssignedUser {
  id: string
  name?: string
  user_type?: string
  tasks?: string[]
}

export interface BusinessProfile {
  about?: string
  address?: string
  description?: string
  email?: string
  profile_picture_url?: string
  websites?: string[]
  vertical?: string
}

export interface Automation {
  enable_welcome_message?: boolean
  prompts?: string[]
  commands?: { command_name: string, command_description: string }[]
}

export interface QrCode {
  code: string
  prefilled_message: string
  deep_link_url: string
  qr_image_url?: string
}

export interface BlockedUser {
  wa_id?: string
  input?: string
}

export interface Username {
  username?: string
  status?: string
}

/** One read per feature, each with its own error so one refusal does not hide the rest. */
export interface PhoneSettings {
  profile: { data?: BusinessProfile, error?: MetaError }
  automation: { data?: Automation, error?: MetaError }
  username: { data?: Username, error?: MetaError }
  qr: { data?: QrCode[], error?: MetaError }
  blocked: { data?: BlockedUser[], error?: MetaError, more?: boolean }
}

export interface TemplateQuota {
  used: number
  limit: number
}

export interface TemplateActionResult {
  done: string[]
  failed: { id: string, reason: string }[]
}

/** One slice of a report: a country, a number, a pricing type or a time bucket. */
export interface ReportSlice {
  key: string
  cost: number
  messages: number
}

export interface CostReport {
  currency: string | null
  granularity: string
  total: number
  messages: number
  series: ReportSlice[]
  by_country: ReportSlice[]
  by_phone: ReportSlice[]
  by_pricing_type: ReportSlice[]
  by_category: ReportSlice[]
  /** Volume tier progress per country and category; upper is null for "MAX". */
  tiers: { country: string, category: string, lower: number, upper: number | null, volume: number }[]
  /** Free service messages used this month per number (FREE_CUSTOMER_SERVICE volume). */
  free_service: { phone: string, used: number }[]
}

export interface TrafficReport {
  granularity: string
  types: Record<'template' | 'non_template' | 'incoming', { sent: number, delivered: number }>
  series: { key: string, template: number, non_template: number, incoming: number }[]
  phones: string[]
  countries: string[]
}

export interface TemplateComparison {
  days: number
  /** Ids from the lowest block rate to the highest. */
  ranking: string[]
  sends: Record<string, number>
  top_block_reason: Record<string, string>
}

export interface TemplateGroupReport {
  groups: { id: string, name: string, description?: string, templates: number, sent: number, delivered: number, read: number, clicked: number, cost: number }[]
}

export interface CallReport {
  count: number
  cost: number
  average_duration: number
  series: { key: string, count: number, cost: number }[]
}
