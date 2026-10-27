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
    problems.push('نص الرسالة فارغ')
  }

  if ([...body].length > 1024) {
    problems.push('نص الرسالة أطول من 1024 حرفاً')
  }

  if (/\{\{\s*[^}\d\s][^}]*\}\}/.test(body)) {
    problems.push('المتغيرات بالأرقام فقط: {{1}}، {{2}}…')
  }

  if (vars.some((n, i) => n !== i + 1)) {
    problems.push('المتغيرات يجب أن تتسلسل من {{1}} دون فجوات')
  }

  if (examples.length !== vars.length || examples.some(example => !String(example).trim())) {
    problems.push('أدخل مثالاً لكل متغير')
  }

  if (/^\s*\{\{|\}\}\s*$/.test(body)) {
    problems.push('يرفض Meta نصاً يبدأ بمتغير أو ينتهي به')
  }

  for (const [label, text] of [['الترويسة', values.header ?? ''], ['التذييل', values.footer ?? '']] as const) {
    if ([...text].length > 60) {
      problems.push(`${label} أطول من 60 حرفاً`)
    }

    if (text.includes('{{')) {
      problems.push(`${label} لا تقبل متغيرات`)
    }
  }

  return problems
}

// Meta's own wording is English; the codes that mean the same thing every time get an Arabic sentence instead.
const META_ERRORS: Record<number, string> = {
  190: 'انتهت صلاحية رمز الوصول أو أنه غير صالح.',
  200: 'رمز الوصول لا يملك الصلاحية اللازمة لهذه البيانات.',
  10: 'رمز الوصول لا يملك الصلاحية اللازمة لهذه البيانات.',
  3: 'التطبيق المرتبط بالرمز لا يملك هذه الصلاحية.',
  4: 'تجاوزت عدد الطلبات المسموح، حاول بعد قليل.',
  17: 'تجاوزت عدد الطلبات المسموح، حاول بعد قليل.',
  32: 'تجاوزت عدد الطلبات المسموح، حاول بعد قليل.',
  613: 'تجاوزت عدد الطلبات المسموح، حاول بعد قليل.',
  80008: 'تجاوزت عدد الطلبات المسموح، حاول بعد قليل.',
  368: 'قيّدت Meta الحساب مؤقتاً بسبب مخالفة السياسات.',
  131031: 'الحساب مقفل لدى Meta.',
}

export function errorText(error: MetaError | null | undefined): string {
  if (!error) {
    return ''
  }

  const known = error.code ? META_ERRORS[error.code] : undefined

  if (known) {
    return known
  }

  return [error.error_user_title, error.error_user_msg || error.message].filter(Boolean).join(' — ')
}
