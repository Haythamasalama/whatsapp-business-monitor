<script setup lang="ts">
const { api, accountId, current } = useManager()

const days = ref<number>(30)
const phone = ref<string>('')
const country = ref<string>('')

const periods = computed(() => REPORT_PERIODS.map(value => ({ label: tOr(`reports.period.${value}`, String(value)), value })))
// The bucket follows the range, so there is one choice less to make: half hours for a day, months for a year.
const granularity = computed<ReportGranularity>(() => (days.value === 1 ? 'HALF_HOUR' : days.value === 365 ? 'MONTHLY' : 'DAILY'))

// One part at a time keeps the page short; extra cost breakdowns wait behind "More details".
const section = ref<'costs' | 'messages' | 'templates' | 'calls'>('costs')
const more = ref(false)

const ALL = '*'
const phoneItems = computed(() => [
  { label: t('reports.allNumbers'), value: ALL },
  ...(current.value?.phones ?? []).map(entry => ({ label: entry.display_phone_number, value: entry.display_phone_number.replace(/\D/g, '') })),
])

const costs = ref<CostReport | null>(null)
const traffic = ref<TrafficReport | null>(null)
const groups = ref<TemplateGroupReport | null>(null)
const calls = ref<CallReport | null>(null)
const errors = reactive<Record<string, string | null>>({ costs: null, traffic: null })
const loading = ref(false)

const countryItems = computed(() => [
  { label: t('reports.allCountries'), value: ALL },
  ...(traffic.value?.countries ?? []).map(code => ({ label: countryName(code), value: code })),
])

function query(): string {
  const params = new URLSearchParams({ days: String(days.value), granularity: granularity.value })

  if (phone.value) {
    params.set('phone', phone.value)
  }

  if (country.value) {
    params.set('country', country.value)
  }

  return params.toString()
}

async function load(): Promise<void> {
  loading.value = true

  const asked = query()
  const get = <T>(path: string) => api<T>(`/api/reports/${path}?${asked}`)
  const [cost, messages, group, call] = await Promise.allSettled([
    get<CostReport>('costs'),
    get<TrafficReport>('traffic'),
    get<TemplateGroupReport>('groups'),
    get<CallReport>('calls'),
  ])

  // A slower, older answer must not overwrite a newer one.
  if (asked !== query()) {
    return
  }

  costs.value = cost.status === 'fulfilled' ? cost.value : null
  errors.costs = cost.status === 'rejected' ? (cost.reason as Error).message : null
  traffic.value = messages.status === 'fulfilled' ? messages.value : null
  errors.traffic = messages.status === 'rejected' ? (messages.reason as Error).message : null
  groups.value = group.status === 'fulfilled' ? group.value : null
  calls.value = call.status === 'fulfilled' ? call.value : null
  loading.value = false
}

watch([days, granularity, phone, country, accountId], () => void load(), { immediate: true })
watch(locale, () => void load())

const currency = computed(() => costs.value?.currency ?? null)
const typeCost = (key: string) => costs.value?.by_pricing_type.find(slice => slice.key === key)
const freeMessages = computed(() => (typeCost('FREE_CUSTOMER_SERVICE')?.messages ?? 0) + (typeCost('FREE_ENTRY_POINT')?.messages ?? 0))
const paidMessages = computed(() => typeCost('REGULAR')?.messages ?? 0)

const phoneLabel = (digits: string) => current.value?.phones.find(entry => entry.display_phone_number.replace(/\D/g, '') === digits)?.display_phone_number ?? digits

const shares = (slices: ReportSlice[] | undefined, label: (key: string) => string) => (slices ?? []).map(slice => ({ ...slice, label: label(slice.key) }))

const costPoints = computed(() => (costs.value?.series ?? []).map(slice => ({ key: slice.key, values: [slice.cost] })))
const trafficSeries = computed(() => [
  { name: t('reports.types.template'), color: 'var(--chart-bar)' },
  { name: t('reports.types.non_template'), color: 'var(--chart-2)' },
  { name: t('reports.types.incoming'), color: 'var(--chart-3)' },
])
const trafficPoints = computed(() => (traffic.value?.series ?? []).map(point => ({ key: point.key, values: [point.template, point.non_template, point.incoming] })))
const callPoints = computed(() => (calls.value?.series ?? []).map(point => ({ key: point.key, values: [point.count] })))
const hasCalls = computed(() => Boolean(calls.value?.count))

const sections = computed(() => [
  { label: t('reports.costs.title'), value: 'costs', icon: 'i-lucide-wallet' },
  { label: t('reports.traffic.title'), value: 'messages', icon: 'i-lucide-messages-square' },
  { label: t('reports.templatesTab'), value: 'templates', icon: 'i-lucide-file-text' },
  ...(hasCalls.value ? [{ label: t('reports.calls.title'), value: 'calls', icon: 'i-lucide-phone-call' }] : []),
])

watch(hasCalls, (value) => {
  if (!value && section.value === 'calls') {
    section.value = 'costs'
  }
})

const tierProgress = (tier: CostReport['tiers'][number]) => (tier.upper ? Math.min(100, Math.round((tier.volume / tier.upper) * 100)) : 0)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <UTabs v-model="section" :items="sections" :content="false" color="neutral" size="sm" />
      <UButton :to="docsUrl('reports-and-costs')" target="_blank" icon="i-lucide-book-open" color="neutral" variant="ghost" size="sm" :label="t('reports.guide')" />
    </div>

    <div v-if="section !== 'templates'" class="flex flex-wrap items-center gap-2">
      <UTabs v-model="days" :items="periods" :content="false" size="xs" variant="link" />
      <div class="flex flex-wrap items-center gap-2 sm:ms-auto">
        <USelect
          v-if="phoneItems.length > 2"
          :model-value="phone || ALL"
          :items="phoneItems"
          size="sm"
          class="w-44"
          :aria-label="t('reports.number')"
          @update:model-value="(value) => (phone = value === ALL ? '' : String(value))"
        />
        <USelect
          v-if="countryItems.length > 2"
          :model-value="country || ALL"
          :items="countryItems"
          size="sm"
          class="w-40"
          :aria-label="t('reports.country')"
          @update:model-value="(value) => (country = value === ALL ? '' : String(value))"
        />
      </div>
    </div>

    <section v-if="section === 'costs'" class="space-y-4">

      <UAlert v-if="errors.costs" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('reports.costs.failed')" :description="errors.costs" />

      <template v-else>
        <div class="grid gap-3 md:grid-cols-3">
          <StatTile :title="t('reports.costs.total')" icon="i-lucide-wallet" :hint="t('reports.costs.totalHint')" :loading="loading && !costs">
            <p class="text-2xl font-bold text-highlighted tabular-nums">
              <bdi dir="ltr">{{ money(costs?.total, currency) }}</bdi>
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ t('reports.costs.paidCount', { n: count(paidMessages), amount: ltr(money(paidMessages ? (costs?.total ?? 0) / paidMessages : 0, currency, 3)) }) }}
            </p>
          </StatTile>
          <StatTile :title="t('reports.costs.free')" icon="i-lucide-gift" :hint="t('reports.costs.freeHint')" :loading="loading && !costs">
            <p class="text-2xl font-bold text-highlighted tabular-nums">
              <bdi dir="ltr">{{ count(freeMessages) }}</bdi>
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ rate(freeMessages, costs?.messages ?? 0) }} {{ t('reports.costs.ofAll') }}
            </p>
          </StatTile>
          <StatTile :title="t('reports.costs.freeTier')" icon="i-lucide-hourglass" :hint="t('reports.costs.freeTierHint')" :loading="loading && !costs">
            <ul class="space-y-2">
              <li v-for="entry in costs?.free_service.length ? costs.free_service : [{ phone: '', used: 0 }]" :key="entry.phone">
                <p class="text-2xl font-bold text-highlighted tabular-nums">
                  {{ t('reports.costs.freeLeft', { n: count(freeServiceLeft(entry.used)) }) }}
                </p>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--chart-track)">
                  <div class="h-full rounded-full bg-(--chart-bar)" :style="{ width: `${Math.min(100, (entry.used / FREE_SERVICE_MESSAGES) * 100)}%` }" />
                </div>
                <p class="mt-1 text-xs text-muted">
                  <bdi v-if="entry.phone && costs!.free_service.length > 1" dir="ltr">{{ phoneLabel(entry.phone) }} · </bdi>{{ t('reports.costs.freeUsed', { n: count(entry.used) }) }}
                </p>
              </li>
            </ul>
          </StatTile>
        </div>

        <p class="flex items-start gap-2 rounded-lg bg-elevated/60 px-3 py-2 text-sm text-toned">
          <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-info" />
          {{ t('reports.costs.october') }}
        </p>

        <ReportBars :title="t('reports.costs.overTime')" :points="costPoints" :series="[{ name: t('chart.cost'), color: 'var(--chart-bar)' }]" :format="(value) => compactMoney(value, currency)" />

        <div class="grid gap-3 lg:grid-cols-2">
          <CostShares :title="t('reports.costs.byCategory')" :rows="shares(costs?.by_category, pricingLabel)" :total="costs?.total ?? 0" :currency="currency" />
          <CostShares :title="t('reports.costs.byCountry')" :rows="shares(costs?.by_country, countryName)" :total="costs?.total ?? 0" :currency="currency" />
        </div>

        <UButton
          :label="more ? t('reports.lessDetails') : t('reports.moreDetails')"
          :trailing-icon="more ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="more = !more"
        />

        <!-- A lone last card takes the full row, so the grid never leaves a hole. -->
        <div v-if="more" class="grid gap-3 lg:grid-cols-2 lg:[&>*:last-child:nth-child(odd)]:col-span-2">
          <CostShares :title="t('reports.costs.byType')" :rows="shares(costs?.by_pricing_type, key => tOr(`reports.pricingType.${key}`, humanize(key)))" :total="costs?.total ?? 0" :currency="currency" />
          <CostShares v-if="(costs?.by_phone.length ?? 0) > 1" :title="t('reports.costs.byPhone')" :rows="shares(costs?.by_phone, phoneLabel)" :total="costs?.total ?? 0" :currency="currency" />
          <div v-if="costs?.tiers.length" class="rounded-xl border border-default bg-default p-5">
            <h3 class="flex items-center gap-1.5 font-semibold text-highlighted">
              {{ t('reports.tiers.title') }}
              <UTooltip :text="t('reports.tiers.hint')">
                <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" />
              </UTooltip>
            </h3>
            <ul class="mt-4 space-y-4">
              <li v-for="tier in costs.tiers" :key="`${tier.country}:${tier.category}`">
                <div class="flex items-baseline justify-between gap-2 text-sm">
                  <span class="font-medium text-highlighted">{{ countryName(tier.country) }} · {{ pricingLabel(tier.category) }}</span>
                  <span class="text-toned tabular-nums" dir="ltr">{{ count(tier.volume) }} / {{ count(tier.upper ?? 0) }}</span>
                </div>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--chart-track)">
                  <div class="h-full rounded-full bg-(--chart-bar)" :style="{ width: `${tierProgress(tier)}%` }" />
                </div>
                <p class="mt-1 text-xs text-muted">
                  {{ t('reports.tiers.left', { n: count(Math.max(0, (tier.upper ?? 0) - tier.volume)) }) }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </template>
    </section>

    <section v-if="section === 'messages'" class="space-y-4">

      <UAlert v-if="errors.traffic" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="t('reports.traffic.failed')" :description="errors.traffic" />

      <template v-else>
        <div class="grid gap-3 sm:grid-cols-3">
          <StatTile
            v-for="kind in (['template', 'non_template', 'incoming'] as const)"
            :key="kind"
            :title="t(`reports.types.${kind}`)"
            :icon="{ template: 'i-lucide-file-text', non_template: 'i-lucide-message-square-reply', incoming: 'i-lucide-inbox' }[kind]"
            :hint="t(`reports.typeHints.${kind}`)"
            :loading="loading && !traffic"
          >
            <p class="text-2xl font-bold text-highlighted tabular-nums">
              <bdi dir="ltr">{{ count(traffic?.types[kind].sent) }}</bdi>
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ kind === 'incoming' ? t('reports.traffic.received') : t('reports.traffic.delivered', { rate: rate(traffic?.types[kind].delivered ?? 0, traffic?.types[kind].sent ?? 0) }) }}
            </p>
          </StatTile>
        </div>

        <ReportBars :title="t('reports.traffic.overTime')" :points="trafficPoints" :series="trafficSeries" :format="(value) => count(Math.round(value))" />
      </template>
    </section>

    <ReportCompare v-if="section === 'templates'" />

    <!-- Template groups: only when the account has some. -->
    <section v-if="section === 'templates' && groups?.groups.length" class="space-y-4 rounded-xl border border-default bg-default p-5">
      <div>
        <h2 class="font-semibold text-highlighted">
          {{ t('reports.groups.title') }}
        </h2>
        <p class="mt-1 text-sm text-muted">
          {{ t('reports.groups.intro') }}
        </p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="text-xs text-muted">
            <tr>
              <th class="py-2 text-start font-medium">
                {{ t('reports.groups.name') }}
              </th>
              <th class="py-2 text-end font-medium">
                {{ t('reports.groups.sent') }}
              </th>
              <th class="py-2 text-end font-medium">
                {{ t('reports.groups.read') }}
              </th>
              <th class="py-2 text-end font-medium">
                {{ t('reports.groups.clicked') }}
              </th>
              <th class="py-2 text-end font-medium">
                {{ t('reports.groups.cost') }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-default">
            <tr v-for="group in groups.groups" :key="group.id">
              <td class="py-2.5">
                <p class="font-medium text-highlighted">
                  {{ group.name }}
                </p>
                <p class="text-xs text-muted">
                  {{ group.description ? `${group.description} · ` : '' }}{{ t('reports.groups.templates', { n: group.templates }) }}
                </p>
              </td>
              <td class="py-2.5 text-end tabular-nums">
                <bdi dir="ltr">{{ count(group.sent) }}</bdi>
              </td>
              <td class="py-2.5 text-end tabular-nums">
                {{ rate(group.read, group.delivered) }}
              </td>
              <td class="py-2.5 text-end tabular-nums">
                <bdi dir="ltr">{{ count(group.clicked) }}</bdi>
              </td>
              <td class="py-2.5 text-end tabular-nums">
                <bdi dir="ltr">{{ money(group.cost, currency) }}</bdi>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="days > 90" class="text-xs text-muted">
        {{ t('reports.groups.ninetyDays') }}
      </p>
    </section>

    <!-- Calls: only when the account had any in the range. -->
    <section v-if="section === 'calls' && hasCalls" class="space-y-4">
      <div class="grid gap-3 sm:grid-cols-3">
        <StatTile :title="t('reports.calls.count')" icon="i-lucide-phone-call">
          <p class="text-2xl font-bold text-highlighted tabular-nums">
            <bdi dir="ltr">{{ count(calls?.count) }}</bdi>
          </p>
        </StatTile>
        <StatTile :title="t('reports.calls.cost')" icon="i-lucide-wallet" :hint="t('reports.calls.costHint')">
          <p class="text-2xl font-bold text-highlighted tabular-nums">
            <bdi dir="ltr">{{ money(calls?.cost, currency) }}</bdi>
          </p>
        </StatTile>
        <StatTile :title="t('reports.calls.duration')" icon="i-lucide-timer">
          <p class="text-2xl font-bold text-highlighted tabular-nums">
            <bdi dir="ltr">{{ duration(calls?.average_duration ?? 0) }}</bdi>
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ t('reports.calls.minutes') }}
          </p>
        </StatTile>
      </div>
      <ReportBars :title="t('reports.calls.overTime')" :points="callPoints" :series="[{ name: t('reports.calls.count'), color: 'var(--chart-bar)' }]" :format="(value) => count(Math.round(value))" />
    </section>
  </div>
</template>
