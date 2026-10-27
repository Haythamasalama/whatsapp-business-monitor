/** One template with all its languages: what the «كود القالب» tab shows, the copy button copies, and paste reads back. */
export interface TemplateDoc {
  name: string
  category: string
  languages: Record<string, TemplateText>
}

export const SEPARATOR = '----------------'

export const KEY_LINE = /^(الاسم|name|الفئة|category|اللغة|language|العنوان|header|التذييل|footer)\s*:\s*(.*)$/i
export const EXAMPLE_LINE = /^\{\{\s*(\d+)\s*\}\}\s*[=:]\s*(.*)$/
const SEPARATOR_LINE = /^[-–—_=]{3,}$/
const BARE_NAME = /^[a-z][a-z0-9_]*$/

const KEYS: Record<string, 'name' | 'category' | 'language' | 'header' | 'footer'> = {
  'الاسم': 'name',
  'name': 'name',
  'الفئة': 'category',
  'category': 'category',
  'اللغة': 'language',
  'language': 'language',
  'العنوان': 'header',
  'header': 'header',
  'التذييل': 'footer',
  'footer': 'footer',
}

function normalizeCategory(value: string): string {
  const byLabel = Object.entries(CATEGORY).find(([, label]) => label === value)?.[0]

  return byLabel ?? (value.toUpperCase() || 'UTILITY')
}

function normalizeLanguage(value: string): string {
  const code = value.split(/[\s(]/)[0]!

  if (/^[a-z]{2,3}(_[A-Z]{2})?$/.test(code)) {
    return code
  }

  return META_LANGUAGES.find(code => languageName(code) === value) ?? value
}

/** The text a template is copied as: labelled lines in Arabic, the body as it is, then `{{n}} = value`. */
export function toText(docs: TemplateDoc[]): string {
  return docs.map((doc) => {
    const lines = [`الاسم: ${doc.name}`, `الفئة: ${CATEGORY[doc.category] ?? doc.category}`]

    for (const code of sortLanguages(Object.keys(doc.languages))) {
      const values = doc.languages[code]!

      if (!values.body.trim()) {
        continue
      }

      const vars = placeholders(values.body)

      lines.push(
        SEPARATOR,
        `اللغة: ${code}`,
        ...(values.header ? [`العنوان: ${values.header}`] : []),
        values.body.trim(),
        ...(values.footer ? [`التذييل: ${values.footer}`] : []),
        ...(vars.length ? ['', ...vars.map((n, i) => `{{${n}}} = ${values.examples[i] ?? ''}`)] : []),
      )
    }

    return lines.join('\n')
  }).join('\n\n')
}

/**
 * Reads that text back, and the older paste format too: a bare name line with blocks split by
 * dashes. A block without an `اللغة:` line is Arabic when it has Arabic letters, English otherwise.
 */
export function fromText(text: string): TemplateDoc[] {
  const docs: TemplateDoc[] = []
  let doc: TemplateDoc | null = null
  let block = freshBlock()

  function freshBlock() {
    return { code: '', header: '', footer: '', examples: [] as string[], body: [] as string[] }
  }

  function ensureDoc(name = ''): TemplateDoc {
    if (!doc) {
      doc = { name, category: 'UTILITY', languages: {} }
      docs.push(doc)
    }

    return doc
  }

  function flushBlock(): void {
    const body = block.body.join('\n').trim().replace(/\n{3,}/g, '\n\n')

    if (body) {
      const target = ensureDoc()
      const code = block.code || (/[؀-ۿ]/.test(body) ? 'ar' : 'en')
      const values = (target.languages[code] ??= emptyText())

      values.body = [values.body, body].filter(Boolean).join('\n\n')
      values.header ||= block.header
      values.footer ||= block.footer

      if (block.examples.length) {
        values.examples = Array.from({ length: block.examples.length }, (_, i) => block.examples[i] ?? '')
      }
    }

    block = freshBlock()
  }

  function startDoc(name: string): void {
    flushBlock()
    doc = null
    ensureDoc(name)
  }

  for (const line of text.replace(/\r/g, '').split('\n')) {
    const trimmed = line.trim()
    const key = trimmed.match(KEY_LINE)
    const example = trimmed.match(EXAMPLE_LINE)

    if (SEPARATOR_LINE.test(trimmed)) {
      flushBlock()
    }
    else if (key) {
      const field = KEYS[key[1]!.toLowerCase()]!
      const value = key[2]!.trim()

      if (field === 'name') {
        startDoc(value)
      }
      else if (field === 'category') {
        ensureDoc().category = normalizeCategory(value)
      }
      else if (field === 'language') {
        if (block.body.some(previous => previous.trim())) {
          flushBlock()
        }

        block.code = normalizeLanguage(value)
      }
      else {
        block[field] = value
      }
    }
    else if (example) {
      block.examples[Number(example[1]) - 1] = example[2]!.trim()
    }
    // A bare lowercase word only counts as a name when it has an underscore or opens the paste.
    else if (BARE_NAME.test(trimmed) && (trimmed.includes('_') || (!docs.length && !block.body.some(previous => previous.trim())))) {
      startDoc(trimmed)
    }
    else {
      block.body.push(line)
    }
  }

  flushBlock()

  return docs
}

export function templateDoc(group: TemplateGroup): TemplateDoc {
  return {
    name: group.name,
    category: group.category,
    languages: Object.fromEntries(group.items.map((item) => {
      const text = templateText(item)

      return [item.language, { header: text.header, body: text.body, footer: text.footer, examples: [...text.examples] }]
    })),
  }
}
