export const CATEGORIES = ['UTILITY', 'MARKETING', 'AUTHENTICATION'] as const
export const EDITABLE_STATUSES = ['APPROVED', 'REJECTED', 'PAUSED']
export const TEMPLATE_NAME = /^[a-z0-9_]{1,512}$/

const VARIABLE = /\{\{\s*(\d+)\s*\}\}/g

export function placeholders(text: string): number[] {
  return [...new Set([...text.matchAll(VARIABLE)].map(match => Number(match[1])))].sort((a, b) => a - b)
}

export function fillPlaceholders(text: string, fill: (n: number) => string): string {
  return text.replace(VARIABLE, (_, n) => fill(Number(n)))
}

export function templateProblems(values: TemplateText): string[] {
  const problems: string[] = []
  const body = values.body ?? ''
  const vars = placeholders(body)
  const examples = values.examples ?? []

  if (!body.trim()) {
    problems.push(t('rules.bodyEmpty'))
  }

  if ([...body].length > 1024) {
    problems.push(t('rules.bodyTooLong'))
  }

  if (/\{\{\s*[^}\d\s][^}]*\}\}/.test(body)) {
    problems.push(t('rules.variablesNumeric'))
  }

  if (vars.some((n, i) => n !== i + 1)) {
    problems.push(t('rules.variablesSequence'))
  }

  if (examples.length !== vars.length || examples.some(example => !String(example).trim())) {
    problems.push(t('rules.examplesMissing'))
  }

  for (const [part, text] of [[t('rules.header'), values.header ?? ''], [t('rules.footer'), values.footer ?? '']] as const) {
    if ([...text].length > 60) {
      problems.push(t('rules.partTooLong', { part }))
    }

    if (text.includes('{{')) {
      problems.push(t('rules.partNoVariables', { part }))
    }
  }

  return problems
}

// Meta's own wording is terse; the codes that mean the same thing every time get a plain sentence instead.
const META_ERRORS: Record<number, MessageKey> = {
  190: 'metaErrors.tokenExpired',
  200: 'metaErrors.permission',
  10: 'metaErrors.permission',
  3: 'metaErrors.appPermission',
  4: 'metaErrors.rateLimit',
  17: 'metaErrors.rateLimit',
  32: 'metaErrors.rateLimit',
  613: 'metaErrors.rateLimit',
  80008: 'metaErrors.rateLimit',
  368: 'metaErrors.restricted',
  131031: 'metaErrors.locked',
}

// Meta used to reject a body that starts or ends with a variable and still approves some that do, so it only warns.
export function templateWarnings(values: TemplateText): string[] {
  return /^\s*\{\{|\}\}\s*$/.test(values.body ?? '') ? [t('rules.edgeVariable')] : []
}

export function errorText(error: MetaError | null | undefined): string {
  if (!error) {
    return ''
  }

  const known = error.code ? META_ERRORS[error.code] : undefined

  if (known) {
    return t(known)
  }

  return [error.error_user_title, error.error_user_msg || error.message].filter(Boolean).join(' — ')
}
