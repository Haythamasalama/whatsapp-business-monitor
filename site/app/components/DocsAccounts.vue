<script setup lang="ts">
const { text, lang, isRtl } = useLang()
const { siteUrl } = useRuntimeConfig().public
const page = computed(() => docs[lang.value])

useHead({
  htmlAttrs: { lang, dir: () => (isRtl.value ? 'rtl' : 'ltr') },
  meta: [{ name: 'keywords', content: () => page.value.keywords }],
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: asset('favicon.svg') },
    { rel: 'canonical', href: () => `${siteUrl}${page.value.path}` },
    { rel: 'alternate', hreflang: 'en', href: `${siteUrl}${docs.en.path}` },
    { rel: 'alternate', hreflang: 'ar', href: `${siteUrl}${docs.ar.path}` },
    { rel: 'alternate', hreflang: 'x-default', href: `${siteUrl}${docs.en.path}` },
  ],
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          'headline': page.value.heading,
          'description': page.value.description,
          'keywords': page.value.keywords,
          'inLanguage': lang.value,
          'url': `${siteUrl}${page.value.path}`,
          'image': `${siteUrl}/screenshots/${lang.value === 'ar' ? 'account-settings-ar.png' : 'account-settings.png'}`,
          'author': { '@type': 'Person', 'name': 'Haytham A. Salama', 'url': 'https://haythamasalama.me' },
          'about': { '@id': `${siteUrl}/#app` },
          'articleSection': page.value.sections.map(section => section.title),
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': text.value.brand, 'item': `${siteUrl}${lang.value === 'ar' ? '/ar/' : '/'}` },
            { '@type': 'ListItem', 'position': 2, 'name': page.value.heading, 'item': `${siteUrl}${page.value.path}` },
          ],
        },
      ],
    }),
  }],
})

useSeoMeta({
  title: () => page.value.title,
  description: () => page.value.description,
  author: 'Haytham A. Salama',
  ogSiteName: () => text.value.brand,
  ogLocale: () => (lang.value === 'ar' ? 'ar_AR' : 'en_US'),
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
  ogType: 'article',
  ogTitle: () => page.value.title,
  ogDescription: () => page.value.description,
  ogUrl: () => `${siteUrl}${page.value.path}`,
  ogImage: () => `${siteUrl}/screenshots/${lang.value === 'ar' ? 'account-settings-ar.png' : 'account-settings.png'}`,
})
</script>

<template>
  <div class="min-h-screen bg-muted text-default">
    <SiteHeader />

    <main class="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[14rem_1fr]">
      <aside class="hidden lg:block">
        <nav class="sticky top-24 space-y-1 text-sm">
          <p class="mb-2 font-semibold text-highlighted">
            {{ page.onThisPage }}
          </p>
          <a v-for="section in page.sections" :key="section.id" :href="`#${section.id}`" class="block rounded-md px-2 py-1 text-muted hover:bg-elevated hover:text-highlighted">
            {{ section.title }}
          </a>
          <a href="#limits" class="block rounded-md px-2 py-1 text-muted hover:bg-elevated hover:text-highlighted">{{ page.limitsTitle }}</a>
        </nav>
      </aside>

      <article class="min-w-0 space-y-12">
        <header class="space-y-4">
          <ULink :to="lang === 'ar' ? '/ar/' : '/'" class="inline-flex items-center gap-1.5 text-sm text-muted hover:text-highlighted">
            <UIcon name="i-lucide-arrow-left" class="size-4 rtl:rotate-180" /> {{ page.back }}
          </ULink>
          <h1 class="text-4xl font-semibold tracking-tight text-highlighted">
            {{ page.heading }}
          </h1>
          <p class="max-w-3xl text-lg/8 text-muted">
            {{ page.intro }}
          </p>
        </header>

        <section v-for="section in page.sections" :id="section.id" :key="section.id" class="scroll-mt-24 space-y-4">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ section.title }}
          </h2>
          <p class="max-w-3xl text-pretty text-toned">
            {{ section.text }}
          </p>
          <ul v-if="section.points" class="max-w-3xl space-y-1.5">
            <li v-for="point in section.points" :key="point" class="flex gap-2 text-toned">
              <UIcon name="i-lucide-circle-check" class="mt-1 size-4 shrink-0 text-primary" /> {{ point }}
            </li>
          </ul>
          <div v-if="section.image" class="rounded-2xl border border-default bg-default p-1.5">
            <img :src="asset(`screenshots/${section.image.file}`)" :alt="section.image.alt" loading="lazy" class="h-auto w-full rounded-xl">
          </div>
        </section>

        <section id="limits" class="scroll-mt-24 space-y-4">
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ page.limitsTitle }}
          </h2>
          <dl class="divide-y divide-default overflow-hidden rounded-xl border border-default bg-default">
            <div v-for="[name, limit] in page.limits" :key="name" class="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr]">
              <dt class="font-medium text-highlighted">
                {{ name }}
              </dt>
              <dd class="text-toned">
                {{ limit }}
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </main>

    <SiteFooter />
  </div>
</template>
