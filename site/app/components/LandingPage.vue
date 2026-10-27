<script setup lang="ts">
import { installCommand } from '~/utils/content'

const { text, lang } = useLang()
const { version, repo } = useRuntimeConfig().public

const INSTALL = installCommand(repo)
const shot = ref('dashboard.png')
const tabs = computed(() => text.value.screenshots.tabs.map(tab => ({ label: tab.label, value: tab.file })))
const currentShot = computed(() => text.value.screenshots.tabs.find(tab => tab.file === shot.value) ?? text.value.screenshots.tabs[0]!)
const serverText = computed(() => text.value.install.server.split('{flag}'))

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
          <UButton :label="text.hero.github" :href="repo" target="_blank" icon="i-lucide-github" size="xl" color="neutral" variant="outline" class="bg-default" />
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
        <div class="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <div class="text-center">
            <h2 class="text-3xl font-semibold tracking-tight text-highlighted">
              {{ text.install.title }}
            </h2>
            <p class="mt-3 text-pretty text-muted">
              {{ text.install.text }}
            </p>
          </div>

          <ol class="mt-10 space-y-6">
            <li v-for="(step, index) in text.install.steps" :key="step.title" class="flex gap-4">
              <span class="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-inverted">{{ index + 1 }}</span>
              <div class="min-w-0 flex-1 pt-1">
                <h3 class="font-semibold text-highlighted">
                  {{ step.title }}
                </h3>
                <p class="mt-1 text-sm/6 text-muted">
                  {{ step.text }}
                </p>
                <CommandBox v-if="index === 0" :command="INSTALL" class="mt-3" />
              </div>
            </li>
          </ol>

          <div class="mt-10 space-y-3 rounded-xl border border-default bg-muted/50 p-5 text-sm/6 text-toned">
            <p>
              {{ serverText[0] }}<code dir="ltr" class="rounded bg-elevated px-1.5 py-0.5 font-mono text-[13px] text-highlighted">--server</code>{{ serverText[1] }}
            </p>
            <CommandBox :command="`${INSTALL} -s -- --server`" />
            <p class="flex items-start gap-2 pt-2">
              <UIcon name="i-lucide-refresh-cw" class="mt-1 size-4 shrink-0 text-primary" />
              {{ text.install.updates }}
            </p>
            <p class="flex items-start gap-2">
              <UIcon name="i-lucide-terminal" class="mt-1 size-4 shrink-0 text-primary" />
              <span>
                {{ text.install.source }}
                <ULink :href="`${repo}#readme`" target="_blank" class="font-medium text-primary hover:underline">{{ text.install.sourceLink }}</ULink>
              </span>
            </p>
          </div>
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
        <div class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 class="text-center text-3xl font-semibold tracking-tight text-highlighted">
            {{ text.faq.title }}
          </h2>
          <dl class="mx-auto mt-10 grid max-w-5xl gap-x-10 gap-y-8 md:grid-cols-2">
            <div v-for="item in text.faq.items" :key="item.question">
              <dt class="font-semibold text-highlighted">
                {{ item.question }}
              </dt>
              <dd class="mt-2 text-sm/6 text-muted">
                {{ item.answer }}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>

    <footer class="border-t border-default">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center text-sm text-muted sm:px-6">
        <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <span class="inline-flex items-center gap-2 font-medium text-highlighted">
            <img :src="asset('logo.svg')" width="20" height="20" alt="" class="size-5">
            {{ text.brand }}
          </span>
          <span aria-hidden="true">·</span>
          <ULink :href="`${repo}/releases`" target="_blank" class="font-mono hover:text-highlighted"><bdi dir="ltr">v{{ version }}</bdi></ULink>
          <span aria-hidden="true">·</span>
          <ULink :href="`${repo}/blob/main/LICENSE`" target="_blank" class="hover:text-highlighted">{{ text.footer.license }}</ULink>
          <span aria-hidden="true">·</span>
          <span>{{ text.footer.madeBy }} <ULink href="https://haythamasalama.me" target="_blank" class="font-medium text-highlighted hover:underline">Haytham A. Salama</ULink></span>
        </div>
        <p class="max-w-xl text-xs text-dimmed">
          {{ text.footer.trademark }}
        </p>
      </div>
    </footer>
  </div>
</template>
