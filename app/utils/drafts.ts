export interface Draft {
  key: number
  name: string
  category: string
  languages: Record<string, TemplateText>
  results: Partial<Record<string, { tone: Tone, message: string }>>
}

let nextKey = 0

export const emptyText = (): TemplateText => ({ header: '', body: '', footer: '', examples: [] })

export function newDraft(name = ''): Draft {
  return { key: ++nextKey, name, category: 'UTILITY', languages: { ar: emptyText() }, results: {} }
}

export function draftFromDoc(doc: TemplateDoc): Draft {
  const languages = Object.keys(doc.languages).length ? doc.languages : { ar: emptyText() }

  return { ...newDraft(doc.name), category: doc.category, languages }
}

export const docFromDraft = (draft: Draft): TemplateDoc => ({ name: draft.name, category: draft.category, languages: draft.languages })

export const parseDrafts = (text: string): Draft[] => fromText(text).map(draftFromDoc)
