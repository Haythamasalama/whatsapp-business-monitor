export interface Draft {
  key: number
  name: string
  category: string
  languages: Record<Lang, TemplateText>
  results: Partial<Record<Lang, { tone: Tone, message: string }>>
}

let nextKey = 0

export function newDraft(name = ''): Draft {
  const empty = (): TemplateText => ({ header: '', body: '', footer: '', examples: [] })

  return { key: ++nextKey, name, category: 'UTILITY', languages: { ar: empty(), en: empty() }, results: {} }
}

/** The paste format used so far: a name line, then the Arabic and English bodies, split by lines of dashes. */
export function parseDrafts(text: string): Draft[] {
  const drafts: Draft[] = []
  let block: string[] = []

  const flush = () => {
    const body = block.join('\n').trim().replace(/\n{3,}/g, '\n\n')
    block = []

    if (!body) {
      return
    }

    if (!drafts.length) {
      drafts.push(newDraft())
    }

    const language = drafts.at(-1)!.languages[/[؀-ۿ]/.test(body) ? 'ar' : 'en']
    language.body = [language.body, body].filter(Boolean).join('\n\n')
  }

  for (const line of text.replace(/\r/g, '').split('\n')) {
    const trimmed = line.trim()

    if (/^[-–—_=]{3,}$/.test(trimmed)) {
      flush()
      continue
    }

    // A bare lowercase word only counts as a name when it has an underscore or opens the paste.
    const opensPaste = !drafts.length && !block.some(previous => previous.trim())

    if (/^[a-z][a-z0-9_]*$/.test(trimmed) && (trimmed.includes('_') || opensPaste)) {
      flush()
      drafts.push(newDraft(trimmed))
      continue
    }

    block.push(line)
  }

  flush()

  return drafts
}
