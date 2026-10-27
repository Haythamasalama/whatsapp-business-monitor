import { guides } from '../../app/utils/docs'

export default defineEventHandler((event) => {
  const { siteUrl } = useRuntimeConfig().public
  const english = `${siteUrl}/`
  const arabic = `${siteUrl}/ar/`
  const today = new Date().toISOString().slice(0, 10)
  const alternates = [['en', english], ['ar', arabic], ['x-default', english]]
    .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`)
    .join('\n')

  // Each guide is listed in both languages, each pointing at the other.
  const guideUrls = Object.values(guides).flatMap((guide) => {
    const docsAlternates = [['en', `${siteUrl}${guide.en.path}`], ['ar', `${siteUrl}${guide.ar.path}`], ['x-default', `${siteUrl}${guide.en.path}`]]
      .map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`)
      .join('\n')

    return [`${siteUrl}${guide.en.path}`, `${siteUrl}${guide.ar.path}`].map(loc => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${docsAlternates}\n  </url>`)
  })

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...[english, arabic].map(loc => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n  </url>`),
    ...guideUrls,
    '</urlset>',
    '',
  ].join('\n')
})
