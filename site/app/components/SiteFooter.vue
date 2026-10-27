<script setup lang="ts">
const { text, lang } = useLang()
const { version, repo } = useRuntimeConfig().public

const home = computed(() => (lang.value === 'ar' ? '/ar/' : '/'))
</script>

<template>
  <footer class="border-t border-default bg-default">
    <div class="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div class="flex items-center gap-3">
        <img :src="asset('logo.svg')" width="36" height="36" alt="" class="size-9 shrink-0">
        <div class="min-w-0">
          <a :href="home" class="font-semibold text-highlighted">{{ text.brand }}</a>
          <p class="mt-0.5 text-xs text-muted">
            {{ text.footer.madeBy }}
            <ULink raw href="https://haythamasalama.me" target="_blank" class="text-toned hover:text-highlighted">Haytham A. Salama</ULink>
          </p>
        </div>
      </div>

      <nav class="flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
        <ULink raw :to="docs[lang].path" class="hover:text-highlighted">{{ text.nav.docs }}</ULink>
        <ULink raw :href="`${repo}/blob/main/LICENSE`" target="_blank" class="hover:text-highlighted">{{ text.footer.license }}</ULink>
        <ULink raw :href="`${repo}/releases`" target="_blank" class="rounded-full border border-default px-2.5 py-0.5 font-mono text-xs hover:text-highlighted">
          <bdi dir="ltr">v{{ version }}</bdi>
        </ULink>
        <ULink raw :href="repo" target="_blank" aria-label="GitHub" class="hover:text-highlighted">
          <GithubMark class="size-5" />
        </ULink>
      </nav>
    </div>
  </footer>
</template>
