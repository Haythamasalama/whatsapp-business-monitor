<script setup lang="ts">
import { installCommand } from '~/utils/content'

const { text, lang } = useLang()
const { version, repo } = useRuntimeConfig().public

const INSTALL = installCommand(repo)
const shot = ref('dashboard.png')
const tabs = computed(() => text.value.screenshots.tabs.map(tab => ({ label: tab.label, value: tab.file })))
const currentShot = computed(() => text.value.screenshots.tabs.find(tab => tab.file === shot.value) ?? text.value.screenshots.tabs[0]!)
const installOn = ref<'computer' | 'server'>('computer')
const installTabs = computed(() => [
  { label: text.value.install.tabs.computer, value: 'computer', icon: 'i-lucide-laptop' },
  { label: text.value.install.tabs.server, value: 'server', icon: 'i-lucide-server' },
])
const installCommandFor = computed(() => (installOn.value === 'server' ? `${INSTALL} -s -- --server` : INSTALL))

useSiteSeo()
</script>

<template>
  <div id="top" class="min-h-screen bg-muted text-default">
    <SiteHeader />

    <main>
      <section class="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
        <UBadge :label="`v${version} · ${text.hero.badge}`" color="primary" variant="subtle" size="lg" class="rounded-full" />
        <h1 class="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance text-highlighted sm:text-5xl">
          {{ text.hero.title }}
        </h1>
        <p class="mx-auto mt-5 max-w-2xl text-lg/8 text-pretty text-muted">
          {{ text.hero.text }}
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton :label="text.hero.install" href="#install" icon="i-lucide-download" size="xl" />
          <UButton :label="text.hero.docs" :to="docs[lang].path" icon="i-lucide-book-open" size="xl" color="neutral" variant="outline" class="bg-default" />
        </div>
        <ul class="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-toned">
          <li v-for="note in text.hero.notes" :key="note" class="inline-flex items-center gap-1.5">
            <UIcon name="i-lucide-circle-check" class="size-4 text-primary" />
            {{ note }}
          </li>
        </ul>

        <div class="mt-14 rounded-2xl border border-default bg-default p-1.5 sm:p-2">
          <img
            v-if="lang === 'ar'"
            :src="asset('screenshots/arabic.png')"
            :alt="text.hero.image"
            width="2880"
            height="1800"
            fetchpriority="high"
            class="h-auto w-full rounded-xl"
          >
          <template v-else>
            <img :src="asset('screenshots/overview.png')" :alt="text.hero.image" width="2880" height="1800" fetchpriority="high" class="h-auto w-full rounded-xl dark:hidden">
            <img :src="asset('screenshots/dashboard-dark.png')" :alt="text.hero.image" width="2880" height="1800" class="hidden h-auto w-full rounded-xl dark:block">
          </template>
        </div>
      </section>

      <section id="features" class="border-y border-default bg-default">
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div class="mx-auto max-w-2xl text-center">
            <h2 class="text-3xl font-semibold tracking-tight text-balance text-highlighted">
              {{ text.features.title }}
            </h2>
            <p class="mt-4 text-pretty text-muted">
              {{ text.features.text }}
            </p>
          </div>
          <ul class="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li v-for="feature in text.features.items" :key="feature.icon" class="rounded-xl border border-default bg-muted/50 p-5">
              <div class="grid size-10 place-items-center rounded-lg border border-default bg-default text-primary">
                <UIcon :name="feature.icon" class="size-5" />
              </div>
              <h3 class="mt-4 font-semibold text-highlighted">
                {{ feature.title }}
              </h3>
              <p class="mt-1.5 text-sm/6 text-muted">
                {{ feature.text }}
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section id="screenshots" class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div class="text-center">
          <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ text.screenshots.title }}
          </h2>
          <p class="mt-3 text-muted">
            {{ text.screenshots.text }}
          </p>
        </div>
        <div class="mt-8 overflow-x-auto">
          <UTabs v-model="shot" :items="tabs" :content="false" class="mx-auto w-max" />
        </div>
        <div class="mt-6 rounded-2xl border border-default bg-default p-1.5 sm:p-2">
          <img :key="currentShot.file" :src="asset(`screenshots/${currentShot.file}`)" :alt="currentShot.alt" width="2880" height="1800" loading="lazy" class="h-auto w-full rounded-xl">
        </div>
      </section>

      <section id="install" class="border-y border-default bg-default">
        <div class="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
          <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
            {{ text.install.title }}
          </h2>
          <p class="mt-3 text-muted">
            {{ text.install.text }}
          </p>
          <UTabs v-model="installOn" :items="installTabs" :content="false" class="mx-auto mt-8 w-max" />
          <CommandBox :command="installCommandFor" class="mt-4" />
          <p class="mt-4 text-sm text-muted">
            {{ text.install.next }}
          </p>
        </div>
      </section>

      <section class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 class="text-center text-3xl font-semibold tracking-tight text-highlighted">
          {{ text.privacy.title }}
        </h2>
        <ul class="mt-10 grid gap-4 md:grid-cols-3">
          <li v-for="item in text.privacy.items" :key="item.icon" class="rounded-xl border border-default bg-default p-5">
            <div class="grid size-10 place-items-center rounded-lg border border-default bg-muted text-primary">
              <UIcon :name="item.icon" class="size-5" />
            </div>
            <h3 class="mt-4 font-semibold text-highlighted">
              {{ item.title }}
            </h3>
            <p class="mt-1.5 text-sm/6 text-muted">
              {{ item.text }}
            </p>
          </li>
        </ul>
      </section>
      <section id="faq" class="border-t border-default bg-default">
        <div class="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <h2 class="text-center text-3xl font-semibold tracking-tight text-highlighted">
            {{ text.faq.title }}
          </h2>
          <!-- Native details keep every answer in the page's HTML, for search engines and AI answers. -->
          <div class="mt-10 divide-y divide-default overflow-hidden rounded-2xl border border-default bg-muted/40">
            <details v-for="(item, index) in text.faq.items" :key="item.question" class="group" :open="index === 0">
              <summary class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-highlighted transition-colors hover:bg-elevated/50 focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                {{ item.question }}
                <UIcon name="i-lucide-chevron-down" class="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p class="px-5 pb-5 text-sm/7 text-muted">
                {{ item.answer }}
              </p>
            </details>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>
