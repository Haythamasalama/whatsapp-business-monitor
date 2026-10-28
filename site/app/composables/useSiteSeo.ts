const SCREENSHOTS = ['overview.png', 'dashboard.png', 'templates-actions.png', 'reports.png']

export function useSiteSeo() {
  const { text, lang, isRtl } = useLang()
  const { version, siteUrl, repo } = useRuntimeConfig().public
  const pageUrl = computed(() => `${siteUrl}${lang.value === 'ar' ? '/ar/' : '/'}`)
  const image = computed(() => `${siteUrl}/screenshots/${lang.value === 'ar' ? 'arabic.png' : 'overview.png'}`)

  // One graph for search engines and AI answers: what the app is, where its code lives, and the questions below.
  const structuredData = computed(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#app`,
        'name': content.en.brand,
        'alternateName': content.ar.brand,
        'description': text.value.description,
        'url': pageUrl.value,
        'applicationCategory': 'BusinessApplication',
        'applicationSubCategory': 'WhatsApp Business template monitoring',
        'operatingSystem': 'Linux, macOS, Windows (Docker)',
        'softwareVersion': version,
        'license': 'https://opensource.org/licenses/MIT',
        'isAccessibleForFree': true,
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
        'downloadUrl': repo,
        'installUrl': `${pageUrl.value}#install`,
        'screenshot': SCREENSHOTS.map(file => `${siteUrl}/screenshots/${file}`),
        'featureList': text.value.features.items.map(item => `${item.title}: ${item.text}`),
        'inLanguage': ['en', 'ar'],
        'keywords': `${content.en.keywords}, ${content.ar.keywords}`,
        'author': { '@type': 'Person', 'name': 'Haytham A. Salama', 'url': 'https://haythamasalama.me' },
        'sameAs': [repo],
      },
      {
        '@type': 'SoftwareSourceCode',
        'name': content.en.brand,
        'codeRepository': repo,
        'programmingLanguage': ['TypeScript', 'Vue'],
        'runtimePlatform': 'Node.js',
        'license': 'https://opensource.org/licenses/MIT',
        'targetProduct': { '@id': `${siteUrl}/#app` },
      },
      {
        '@type': 'FAQPage',
        'inLanguage': lang.value,
        'mainEntity': text.value.faq.items.map(item => ({
          '@type': 'Question',
          'name': item.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': item.answer },
        })),
      },
    ],
  }))

  useHead({
    htmlAttrs: { lang, dir: () => (isRtl.value ? 'rtl' : 'ltr') },
    meta: [{ name: 'keywords', content: () => text.value.keywords }],
    link: [
      { rel: 'icon', type: 'image/svg+xml', href: asset('favicon.svg') },
      { rel: 'canonical', href: pageUrl },
      { rel: 'alternate', hreflang: 'en', href: `${siteUrl}/` },
      { rel: 'alternate', hreflang: 'ar', href: `${siteUrl}/ar/` },
      { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}/` },
      { rel: 'alternate', type: 'text/markdown', title: 'llms.txt', href: `${siteUrl}/llms.txt` },
      { rel: 'sitemap', type: 'application/xml', href: `${siteUrl}/sitemap.xml` },
    ],
    script: [{ type: 'application/ld+json', innerHTML: () => JSON.stringify(structuredData.value) }],
  })

  useSeoMeta({
    title: () => text.value.title,
    description: () => text.value.description,
    author: 'Haytham A. Salama',
    robots: 'index, follow',
    ogType: 'website',
    ogSiteName: content.en.brand,
    ogTitle: () => text.value.title,
    ogDescription: () => text.value.description,
    ogUrl: pageUrl,
    ogLocale: () => (lang.value === 'ar' ? 'ar_AR' : 'en_US'),
    ogLocaleAlternate: () => [lang.value === 'ar' ? 'en_US' : 'ar_AR'],
    ogImage: image,
    ogImageWidth: 2880,
    ogImageHeight: 1800,
    ogImageAlt: () => text.value.hero.image,
    twitterCard: 'summary_large_image',
    twitterTitle: () => text.value.title,
    twitterDescription: () => text.value.description,
    twitterImage: image,
  })
}
