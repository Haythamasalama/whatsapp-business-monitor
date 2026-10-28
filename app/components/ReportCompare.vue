<script setup lang="ts">
// Template comparison: Meta ranks two templates by block rate. It only answers for templates sent 1,000 times.
const { api, templates } = useManager()

const windows = computed(() => COMPARE_WINDOWS.map(value => ({ label: t('reports.compare.window', { n: value }), value })))
const days = ref<number>(30)
const first = ref<string | undefined>()
const second = ref<string | undefined>()
const result = ref<TemplateComparison | null>(null)
const error = ref<string | null>(null)
const loading = ref(false)

const sendable = computed(() => templates.value
  .filter(template => template.status === 'APPROVED' || template.status === 'PAUSED')
  .map(template => ({ label: `${template.name} · ${languageCode(template.language)}`, value: template.id })))

const nameOf = (id: string) => sendable.value.find(item => item.value === id)?.label ?? id

// Two different templates by default, so the button is ready on first sight.
watch(sendable, (items) => {
  first.value ??= items[0]?.value
  second.value ??= items.find(item => item.value !== first.value)?.value
}, { immediate: true })

async function compare(): Promise<void> {
  if (!first.value || !second.value) {
    return
  }

  loading.value = true
  error.value = null

  try {
    result.value = await api<TemplateComparison>(`/api/reports/compare?template=${first.value}&other=${second.value}&days=${days.value}`)
  }
  catch (failure) {
    result.value = null
    error.value = (failure as Error).message
  }
  finally {
    loading.value = false
  }
}

watch([first, second, days], () => {
  result.value = null
  error.value = null
})
</script>

<template>
  <section class="space-y-4 rounded-xl border border-default bg-default p-5">
    <div>
      <h2 class="font-semibold text-highlighted">
        {{ t('reports.compare.title') }}
      </h2>
      <p class="mt-1 text-sm text-muted">
        {{ t('reports.compare.intro') }}
      </p>
    </div>

    <p v-if="sendable.length < 2" class="text-sm text-muted">
      {{ t('reports.compare.needTwo') }}
    </p>

    <template v-else>
      <div class="flex flex-wrap items-end gap-2">
        <USelect v-model="first" :items="sendable" class="w-60 max-w-full" :aria-label="t('reports.compare.first')" />
        <USelect v-model="second" :items="sendable" class="w-60 max-w-full" :aria-label="t('reports.compare.second')" />
        <UTabs v-model="days" :items="windows" :content="false" size="sm" />
        <UButton :label="t('reports.compare.run')" icon="i-lucide-scale" :loading="loading" :disabled="!first || !second || first === second" @click="compare()" />
      </div>

      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" />

      <UAlert
        v-else-if="result && !result.ranking.length"
        color="neutral"
        variant="subtle"
        icon="i-lucide-info"
        :title="t('reports.compare.notEnoughTitle')"
        :description="t('reports.compare.notEnough', { n: count(COMPARE_MIN_SENDS) })"
      />

      <ol v-else-if="result" class="grid gap-3 sm:grid-cols-2">
        <li v-for="(id, index) in result.ranking" :key="id" class="rounded-lg border border-default p-4">
          <div class="flex items-center justify-between gap-2">
            <bdi dir="ltr" class="truncate font-medium text-highlighted">{{ nameOf(id) }}</bdi>
            <UBadge :color="index === 0 ? 'success' : 'warning'" variant="subtle" :label="index === 0 ? t('reports.compare.lower') : t('reports.compare.higher')" />
          </div>
          <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt class="text-muted">
              {{ t('reports.compare.sends') }}
            </dt>
            <dd class="text-end tabular-nums">
              <bdi dir="ltr">{{ count(result.sends[id]) }}</bdi>
            </dd>
            <dt class="text-muted">
              {{ t('reports.compare.reason') }}
            </dt>
            <dd class="text-end">
              {{ tOr(`reports.blockReason.${result.top_block_reason[id]}`, result.top_block_reason[id] ?? '—') }}
            </dd>
          </dl>
        </li>
      </ol>

      <p v-if="result?.ranking.length" class="text-sm text-toned">
        {{ t('reports.compare.advice') }}
      </p>
    </template>
  </section>
</template>
