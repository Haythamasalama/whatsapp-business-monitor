<script setup lang="ts">
const { text, lang, otherPath } = useLang()
const { repo } = useRuntimeConfig().public

// Section links point at the home page, so they also work from the docs.
const home = computed(() => (lang.value === 'ar' ? '/ar/' : '/'))
const links = computed(() => [
  { label: text.value.nav.features, href: `${home.value}#features` },
  { label: text.value.nav.screenshots, href: `${home.value}#screenshots` },
  { label: text.value.nav.install, href: `${home.value}#install` },
  { label: text.value.nav.faq, href: `${home.value}#faq` },
  { label: text.value.nav.docs, href: docs[lang.value].path },
])
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-default bg-muted/80 backdrop-blur">
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
      <a :href="home" class="flex min-w-0 items-center gap-2.5 font-semibold text-highlighted">
        <img :src="asset('logo.svg')" width="32" height="32" alt="" class="size-8 shrink-0">
        <span class="truncate">{{ text.brand }}</span>
      </a>

      <nav class="hidden items-center gap-1 md:flex">
        <UButton v-for="link in links" :key="link.href" :label="link.label" :to="link.href" color="neutral" variant="ghost" />
      </nav>

      <div class="flex shrink-0 items-center gap-1">
        <UButton
          :label="lang === 'ar' ? 'EN' : 'AR'"
          :aria-label="text.language"
          :to="otherPath"
          :hreflang="lang === 'ar' ? 'en' : 'ar'"
          color="neutral"
          variant="ghost"
          class="font-semibold"
        />
        <UColorModeButton />
        <UButton icon="i-lucide-github" :href="repo" target="_blank" color="neutral" variant="ghost" aria-label="GitHub" />
      </div>
    </div>
  </header>
</template>
