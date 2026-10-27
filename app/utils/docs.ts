const SITE = 'https://wbm.haythamasalama.me'

/** A page of the project's website, in the interface language. */
export const docsUrl = (page: string) => `${SITE}${locale.value === 'ar' ? '/ar' : ''}/docs/${page}/`

/** Meta's codes as words when no translation exists: PHONE_NUMBER_REGISTERED → "Phone number registered". */
export function humanize(code: string): string {
  const words = code.toLowerCase().replace(/_/g, ' ')

  return words.charAt(0).toUpperCase() + words.slice(1)
}
