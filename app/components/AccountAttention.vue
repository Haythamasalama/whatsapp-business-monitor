<script setup lang="ts">
// The account's home under the stat tiles: what needs action now, and the templates that are sent most.
const emit = defineEmits<{ open: [name: string, id: string] }>()

const { templates, overview, analytics, loading, accountTab } = useManager()

interface Item { key: string, icon: string, tone: Tone, title: string, detail: string, template?: MetaTemplate }

const PROBLEM_STATUSES = ['REJECTED', 'PAUSED', 'DISABLED']
const WEAK_QUALITY = ['RED', 'YELLOW']

const items = computed<Item[]>(() => {
  const list: Item[] = []

  for (const phone of overview.value?.phones?.data ?? []) {
    const status = phoneStatusOf(phone.status)
    const quality = qualityOf(phone.quality_rating)

    if (status && status.tone !== 'success' && status.tone !== 'neutral') {
      list.push({ key: `phone-status-${phone.id}`, icon: 'i-lucide-phone-off', tone: status.tone, title: phone.display_phone_number, detail: t('home.phoneStatus', { status: status.label }) })
    }
    else if (quality && WEAK_QUALITY.includes(phone.quality_rating ?? '')) {
      list.push({ key: `phone-quality-${phone.id}`, icon: 'i-lucide-phone', tone: quality.tone, title: phone.display_phone_number, detail: t('home.phoneQuality', { quality: quality.label }) })
    }
  }

  for (const template of templates.value) {
    const score = template.quality_score?.score ?? ''

    if (PROBLEM_STATUSES.includes(template.status)) {
      const status = statusOf(template.status)

      list.push({ key: template.id, icon: status.icon, tone: status.tone, title: `${template.name} · ${languageCode(template.language)}`, detail: status.label, template })
    }
    else if (template.status === 'APPROVED' && WEAK_QUALITY.includes(score)) {
      const quality = qualityOf(score)!

      list.push({ key: template.id, icon: 'i-lucide-triangle-alert', tone: quality.tone, title: `${template.name} · ${languageCode(template.language)}`, detail: t('home.templateQuality', { quality: quality.label }), template })
    }
  }

  // Errors first, then warnings.
  return list.sort((a, b) => Number(b.tone === 'error') - Number(a.tone === 'error'))
})

const SHOWN = 5
const top = computed(() => {
  const data = analytics.value?.data

  if (!data) {
    return []
  }

  return templates.value
    .map(template => ({ template, stats: data[template.id] }))
    .filter(entry => entry.stats?.sent)
    .sort((a, b) => b.stats!.sent - a.stats!.sent)
    .slice(0, SHOWN)
})

const topMax = computed(() => top.value[0]?.stats?.sent ?? 0)
</script>

<template>
  <div v-if="loading" class="grid gap-4 lg:grid-cols-2">
    <USkeleton class="h-64 rounded-xl" />
    <USkeleton class="h-64 rounded-xl" />
  </div>

  <div v-else class="grid gap-4 lg:grid-cols-2">
    <section class="rounded-xl border border-default bg-default p-5">
      <h2 class="font-semibold text-highlighted">
        {{ t('home.attention') }}
      </h2>

      <div v-if="!items.length" class="grid h-48 place-items-center text-center">
        <div>
          <span class="mx-auto grid size-10 place-items-center rounded-full bg-success/10 text-success">
            <UIcon name="i-lucide-check" class="size-5" />
          </span>
          <p class="mt-2 text-sm text-muted">
            {{ t('home.allGood') }}
          </p>
        </div>
      </div>

      <ul v-else class="mt-3 divide-y divide-default">
        <li v-for="item in items.slice(0, 6)" :key="item.key">
          <component
            :is="item.template ? 'button' : 'div'"
            :type="item.template ? 'button' : undefined"
            class="flex w-full items-center gap-3 py-2.5 text-start"
            :class="item.template ? 'rounded-md hover:bg-elevated/60' : ''"
            @click="item.template && emit('open', item.template.name, item.template.id)"
          >
            <UIcon :name="item.icon" class="size-4.5 shrink-0" :class="item.tone === 'error' ? 'text-error' : 'text-warning'" />
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-highlighted"><bdi dir="ltr">{{ item.title }}</bdi></span>
              <span class="block text-xs text-muted">{{ item.detail }}</span>
            </span>
          </component>
        </li>
      </ul>
      <UButton v-if="items.length > 6" :label="t('home.more', { n: items.length - 6 })" color="neutral" variant="link" size="sm" class="mt-2 px-0" @click="accountTab = 'templates'" />
    </section>

    <section class="rounded-xl border border-default bg-default p-5">
      <div class="flex items-center justify-between gap-2">
        <h2 class="font-semibold text-highlighted">
          {{ t('home.topTemplates') }}
        </h2>
        <UButton :label="t('home.allTemplates')" trailing-icon="i-lucide-chevron-right" color="neutral" variant="ghost" size="sm" @click="accountTab = 'templates'" />
      </div>

      <p v-if="!top.length" class="grid h-48 place-items-center text-sm text-muted">
        {{ analytics ? t('home.noSends') : t('home.noAnalytics') }}
      </p>

      <ul v-else class="mt-3 space-y-3.5">
        <li v-for="entry in top" :key="entry.template.id">
          <button type="button" class="w-full text-start" @click="emit('open', entry.template.name, entry.template.id)">
            <div class="flex items-baseline justify-between gap-2 text-sm">
              <bdi dir="ltr" class="min-w-0 truncate font-medium text-highlighted">{{ entry.template.name }} · {{ languageCode(entry.template.language) }}</bdi>
              <span class="shrink-0 text-toned tabular-nums">
                <bdi dir="ltr">{{ count(entry.stats!.sent) }}</bdi>
              </span>
            </div>
            <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--chart-track)">
              <div class="h-full rounded-full bg-(--chart-bar)" :style="{ width: `${(entry.stats!.sent / topMax) * 100}%` }" />
            </div>
            <p class="mt-1 text-xs text-muted">
              {{ t('home.readRate', { rate: rate(entry.stats!.read, entry.stats!.delivered) }) }}
            </p>
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>
