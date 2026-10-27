<script setup lang="ts">
const { text, lang } = useLang()
const { version, repo } = useRuntimeConfig().public

const home = computed(() => (lang.value === 'ar' ? '/ar/' : '/'))
const links = computed(() => [
  { label: text.value.nav.docs, to: docs[lang.value].path },
  { label: 'GitHub', href: repo },
  { label: `v${version}`, href: `${repo}/releases`, mono: true },
  { label: text.value.footer.license, href: `${repo}/blob/main/LICENSE` },
])
</script>

<template>
  <footer class="border-t border-default bg-default">
    <div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <a :href="home" class="inline-flex items-center gap-2.5 font-semibold text-highlighted">
          <img :src="asset('logo.svg')" width="28" height="28" alt="" class="size-7">
          {{ text.brand }}
        </a>
        <nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          <ULink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            :href="link.href"
            :target="link.href ? '_blank' : undefined"
            class="hover:text-highlighted"
            :class="{ 'font-mono': link.mono }"
          >
            <bdi dir="auto">{{ link.label }}</bdi>
          </ULink>
        </nav>
      </div>

      <p class="mt-8 border-t border-default pt-6 text-xs text-dimmed">
        {{ text.footer.madeBy }}
        <ULink href="https://haythamasalama.me" target="_blank" class="text-muted hover:text-highlighted">Haytham A. Salama</ULink>
      </p>
    </div>
  </footer>
</template>
