// Checks for the reports' query, shared by the server routes and the tests. Problems are translation keys.

/** Meta keeps messaging, pricing and call analytics for 1 year. */
export const REPORT_PERIODS = [1, 7, 30, 90, 365] as const

/** How Meta buckets the numbers in time. */
export const REPORT_GRANULARITIES = ['HALF_HOUR', 'DAILY', 'MONTHLY'] as const

/** Half-hour points over more than a week are too many to read, and too heavy to fetch. */
export const HALF_HOUR_MAX_DAYS = 7

/** Template comparison only takes these lookback windows. */
export const COMPARE_WINDOWS = [7, 30, 60, 90] as const

/** Meta compares only templates sent this many times in the window. */
export const COMPARE_MIN_SENDS = 1000

/** template_group_analytics takes at most 10 group ids per request. */
export const TEMPLATE_GROUPS_MAX = 10

/** Since 2026-10-01 each number gets 1,000 free service messages a month, then Meta charges. */
export const FREE_SERVICE_MESSAGES = 1000

export type ReportGranularity = typeof REPORT_GRANULARITIES[number]

export interface ReportQuery {
  days: number
  granularity: ReportGranularity
  phone?: string
  country?: string
}

/** Reads days, granularity, phone and country from a query string; returns the query or the problems found. */
export function readReportQuery(query: Record<string, unknown>): { query: ReportQuery, problems: string[] } {
  const problems: string[] = []
  const days = Number(query.days ?? 30)
  const granularity = String(query.granularity ?? 'DAILY')
  const phone = query.phone ? String(query.phone) : undefined
  const country = query.country ? String(query.country).toUpperCase() : undefined

  if (!REPORT_PERIODS.some(period => period === days)) {
    problems.push('reports.errors.badPeriod')
  }

  if (!REPORT_GRANULARITIES.some(value => value === granularity)) {
    problems.push('reports.errors.badGranularity')
  }
  else if (granularity === 'HALF_HOUR' && days > HALF_HOUR_MAX_DAYS) {
    problems.push('reports.errors.halfHourTooLong')
  }

  if (phone !== undefined && !/^\d{6,15}$/.test(phone)) {
    problems.push('reports.errors.badPhone')
  }

  if (country !== undefined && !/^[A-Z]{2}$/.test(country)) {
    problems.push('reports.errors.badCountry')
  }

  return { query: { days, granularity: granularity as ReportGranularity, phone, country }, problems }
}

/** The window as unix seconds, ending now. */
export function reportWindow(days: number, now = Date.now()): { start: number, end: number } {
  const end = Math.floor(now / 1000)

  return { start: end - days * 86_400, end }
}

export function compareProblems(target: string, other: string, days: number): string[] {
  const problems: string[] = []

  if (!/^\d+$/.test(target) || !/^\d+$/.test(other)) {
    problems.push('reports.errors.badTemplate')
  }
  else if (target === other) {
    problems.push('reports.errors.sameTemplate')
  }

  if (!COMPARE_WINDOWS.some(window => window === days)) {
    problems.push('reports.errors.badWindow')
  }

  return problems
}

/**
 * How many of a number's free service messages are left this month. Free service messages are counted per
 * business number, so pass that number's FREE_CUSTOMER_SERVICE volume for the current month.
 */
export function freeServiceLeft(freeUsed: number): number {
  return Math.max(0, FREE_SERVICE_MESSAGES - freeUsed)
}

/** Meta writes a volume tier as "<lower>:<upper>", the upper bound being a number or MAX. */
export function parseTier(tier: string): { lower: number, upper: number | null } | null {
  const match = /^(\d+):(\d+|MAX)$/.exec(tier)

  if (!match) {
    return null
  }

  return { lower: Number(match[1]), upper: match[2] === 'MAX' ? null : Number(match[2]) }
}
