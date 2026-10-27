export function money(value: number | string | undefined, currency?: string | null, fractionDigits = 2): string {
  const number = Number(value) || 0

  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD', maximumFractionDigits: fractionDigits }).format(number)
  }
  catch {
    return `${number.toFixed(2)} ${currency ?? ''}`.trim()
  }
}

export const amount = (value?: CurrencyAmount) => (value ? money(value.amount, value.currency) : '—')

export const count = (value?: number) => new Intl.NumberFormat('en-US').format(value ?? 0)

// A message sent before the window can be delivered or read inside it, so a rate may pass 100 without the cap.
export const rate = (part: number, whole: number) => (whole ? t('common.percent', { n: Math.min(100, Math.round((part / whole) * 100)) }) : '—')

export function monthDay(isoDate: string): string {
  return new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'long' }).format(new Date(`${isoDate}T00:00:00`))
}

export function accountTitle(account: AccountSummary): string {
  if (account.label !== account.id) {
    return account.label
  }

  return account.phones[0]?.verified_name || account.name || account.id
}

export function compactMoney(value: number, currency?: string | null): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(value)
  }
  catch {
    return value.toFixed(1)
  }
}

export function shortDay(isoDate: string): string {
  return new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short' }).format(new Date(`${isoDate}T00:00:00`))
}

export function templateText(template: MetaTemplate) {
  const components = template.components ?? []
  const header = components.find(c => c.type === 'HEADER')
  const body = components.find(c => c.type === 'BODY')
  const isText = (header?.format ?? 'TEXT') === 'TEXT'

  return {
    header: header && isText ? (header.text ?? '') : '',
    media: header && !isText ? (header.format ?? null) : null,
    body: body?.text ?? '',
    footer: components.find(c => c.type === 'FOOTER')?.text ?? '',
    examples: body?.example?.body_text?.[0] ?? [],
    buttons: components.find(c => c.type === 'BUTTONS')?.buttons ?? [],
  }
}

export const timeOfDay = (date: Date | number) => new Intl.DateTimeFormat(intlLocale(), { hour: 'numeric', minute: '2-digit' }).format(date)
