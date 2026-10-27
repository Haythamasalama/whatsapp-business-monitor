<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const emit = defineEmits<{ open: [id: string] }>()

const { accounts, summary, summaryError, summaryLoading } = useManager()

const ATTENTION = ['PENDING', 'IN_APPEAL', 'REJECTED', 'PAUSED', 'DISABLED']

const rows = computed(() => accounts.value.map(account => ({
  account,
  stats: summary.value?.find(stats => stats.id === account.id) ?? null,
})))

type Row = (typeof rows.value)[number]

const spends = computed(() => rows.value.flatMap(row => (row.stats?.spend ? [{ account: row.account, spend: row.stats.spend }] : [])))

const totals = computed(() => {
  const byCurrency = new Map<string, number>()

  for (const { spend } of spends.value) {
    const key = spend.currency ?? ''
    byCurrency.set(key, (byCurrency.get(key) ?? 0) + spend.total)
  }

  return [...byCurrency].sort((a, b) => b[1] - a[1]).map(([currency, total]) => ({ currency: currency || null, total }))
})

// The chart and the per-account bars add up the accounts billed in the main currency; others only show in the cost tile.
const main = computed<Spend | null>(() => {
  const currency = totals.value[0]?.currency ?? null
  const list = spends.value.filter(({ spend }) => spend.currency === currency).map(({ spend }) => spend)

  if (!list.length) {
    return null
  }

  const byCategory: Spend['by_category'] = {}
  const byDay = new Map<string, { cost: number, messages: number }>()

  for (const spend of list) {
    for (const [key, row] of Object.entries(spend.by_category)) {
      const bucket = (byCategory[key] ??= { cost: 0, messages: 0 })
      bucket.cost += row.cost
      bucket.messages += row.messages
    }

    for (const day of spend.daily) {
      const bucket = byDay.get(day.date) ?? { cost: 0, messages: 0 }
      bucket.cost += day.cost
      bucket.messages += day.messages
      byDay.set(day.date, bucket)
    }
  }

  return {
    since: list.map(spend => spend.since).sort()[0]!,
    currency,
    total: list.reduce((sum, spend) => sum + spend.total, 0),
    messages: list.reduce((sum, spend) => sum + spend.messages, 0),
    by_category: byCategory,
    daily: [...byDay].sort(([a], [b]) => a.localeCompare(b)).map(([date, day]) => ({ date, ...day })),
  }
})

const messages = computed(() => spends.value.reduce((sum, { spend }) => sum + spend.messages, 0))

const byAccount = computed(() => spends.value
  .filter(({ spend }) => spend.currency === main.value?.currency)
  .map(({ account, spend }) => ({ key: account.id, label: accountTitle(account), cost: spend.total, messages: spend.messages })))

const statusTotal = (status: string) => rows.value.reduce((sum, row) => sum + (row.stats?.templates?.statuses[status] ?? 0), 0)
const templatesTotal = computed(() => rows.value.reduce((sum, row) => sum + (row.stats?.templates?.total ?? 0), 0))
const attention = computed(() => ATTENTION.map(status => ({ status, count: statusTotal(status) })).filter(item => item.count))

function attentionOf(row: Row) {
  return ATTENTION.map(status => ({ status, count: row.stats?.templates?.statuses[status] ?? 0 })).filter(item => item.count)
}

const phoneQuality = (row: Row) => qualityOf(row.stats?.phones[0]?.quality_rating)

const columns = computed<TableColumn<Row>[]>(() => [
  { id: 'account', header: t('overview.account'), meta: { class: { td: 'w-full min-w-52' } } },
  { id: 'cost', header: t('stats.monthCost') },
  { id: 'messages', header: t('chart.messages'), meta: { class: { th: 'hidden sm:table-cell', td: 'hidden sm:table-cell' } } },
  { id: 'templates', header: t('overview.templates'), meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } } },
  { id: 'attention', header: t('overview.attention'), meta: { class: { th: 'hidden lg:table-cell', td: 'hidden lg:table-cell' } } },
  { id: 'quality', header: t('overview.quality'), meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } } },
  { id: 'open', header: () => h('span', { class: 'sr-only' }, t('overview.open')), meta: { class: { td: 'w-0' } } },
])

const loading = computed(() => summaryLoading.value && !summary.value)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ t('nav.overview') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ t('overview.accountCount', { n: accounts.length }) }}<template v-if="main">
          · {{ t('stats.since', { date: monthDay(main.since) }) }}
        </template>
      </p>
    </div>

    <UAlert v-if="summaryError" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="summaryError" />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile :title="t('stats.monthCost')" icon="i-lucide-receipt" :loading="loading">
        <template v-if="totals.length">
          <p class="text-3xl font-semibold text-highlighted">
            <span dir="ltr">{{ money(totals[0]!.total, totals[0]!.currency) }}</span>
          </p>
          <p v-for="other in totals.slice(1)" :key="other.currency ?? ''" class="mt-1 text-sm font-medium text-toned">
            <span dir="ltr">+ {{ money(other.total, other.currency) }}</span>
          </p>
          <p class="mt-1 text-xs text-muted">
            {{ t('overview.allAccounts') }}
          </p>
        </template>
        <p v-else class="text-sm text-muted">
          {{ t('common.unavailable') }}
        </p>
      </StatTile>

      <StatTile :title="t('stats.messages')" icon="i-lucide-send" :loading="loading">
        <template v-if="spends.length">
          <p class="text-3xl font-semibold text-highlighted">
            {{ count(messages) }}
          </p>
          <p v-if="main?.messages && totals.length === 1" class="mt-1 text-xs text-muted">
            {{ t('stats.averageBefore') }} <span dir="ltr">{{ money(main.total / main.messages, main.currency, 4) }}</span> {{ t('stats.averageAfter') }}
          </p>
        </template>
        <p v-else class="text-sm text-muted">
          {{ t('common.unavailable') }}
        </p>
      </StatTile>

      <StatTile :title="t('overview.templates')" icon="i-lucide-layout-template" :loading="loading">
        <p class="text-3xl font-semibold text-highlighted">
          {{ count(templatesTotal) }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ statusOf('APPROVED').label }}: {{ count(statusTotal('APPROVED')) }}
        </p>
      </StatTile>

      <StatTile :title="t('overview.attention')" icon="i-lucide-bell-ring" :loading="loading">
        <p class="text-3xl font-semibold" :class="attention.length ? 'text-highlighted' : 'text-dimmed'">
          {{ count(attention.reduce((sum, item) => sum + item.count, 0)) }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ attention.length ? attention.map(item => `${statusOf(item.status).label} ${count(item.count)}`).join(' · ') : t('overview.nothingWaiting') }}
        </p>
      </StatTile>
    </div>

    <div v-if="loading" class="grid gap-4 lg:grid-cols-3">
      <USkeleton class="h-72 rounded-xl lg:col-span-2" />
      <USkeleton class="h-72 rounded-xl" />
    </div>
    <div v-else-if="main" class="grid gap-4 lg:grid-cols-3">
      <SpendChart :daily="main.daily" :currency="main.currency" class="lg:col-span-2" />
      <CostShares :title="t('chart.byAccount')" :rows="byAccount" :total="main.total" :currency="main.currency" />
    </div>

    <section class="rounded-xl border border-default bg-default">
      <h2 class="p-5 pb-4 text-lg font-semibold text-highlighted">
        {{ t('overview.accounts') }}
      </h2>
      <UTable
        :data="rows"
        :columns="columns"
        :loading="loading"
        :ui="{ thead: 'border-t border-default', th: 'py-2.5 text-xs font-medium whitespace-nowrap text-muted', td: 'py-3.5', tr: 'cursor-pointer hover:bg-muted/50' }"
        @select="(_event: Event, row) => emit('open', row.original.account.id)"
      >
        <template #account-cell="{ row }">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar
              :src="row.original.account.photo ?? undefined"
              :alt="accountTitle(row.original.account)"
              icon="i-lucide-message-circle"
              class="size-9 shrink-0"
              :ui="{ root: 'bg-primary/10', icon: 'size-4.5 text-primary' }"
            />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">
                {{ accountTitle(row.original.account) }}
              </p>
              <p class="truncate text-xs text-muted">
                <bdi dir="ltr">{{ row.original.account.phones.map(phone => phone.display_phone_number).join(t('common.listSeparator')) || row.original.account.waba_id }}</bdi>
              </p>
            </div>
            <UTooltip v-if="row.original.stats?.error || row.original.account.error" :text="row.original.stats?.error || row.original.account.error || ''">
              <UIcon name="i-lucide-circle-alert" class="size-4 shrink-0 text-error" />
            </UTooltip>
          </div>
        </template>

        <template #cost-cell="{ row }">
          <span v-if="row.original.stats?.spend" class="font-semibold whitespace-nowrap text-highlighted tabular-nums" dir="ltr">
            {{ money(row.original.stats.spend.total, row.original.stats.spend.currency) }}
          </span>
          <UTooltip v-else-if="row.original.stats?.spendError" :text="row.original.stats.spendError">
            <span class="text-xs text-dimmed">{{ t('common.unavailable') }}</span>
          </UTooltip>
          <span v-else class="text-dimmed">—</span>
        </template>

        <template #messages-cell="{ row }">
          <span class="tabular-nums" :class="row.original.stats?.spend ? 'text-highlighted' : 'text-dimmed'">
            {{ row.original.stats?.spend ? count(row.original.stats.spend.messages) : '—' }}
          </span>
        </template>

        <template #templates-cell="{ row }">
          <div v-if="row.original.stats?.templates" class="whitespace-nowrap">
            <p class="font-semibold text-highlighted tabular-nums">
              {{ count(row.original.stats.templates.total) }}
            </p>
            <p class="text-xs text-muted">
              {{ statusOf('APPROVED').label }}: {{ count(row.original.stats.templates.statuses.APPROVED ?? 0) }}
            </p>
          </div>
          <span v-else class="text-dimmed">—</span>
        </template>

        <template #attention-cell="{ row }">
          <div v-if="attentionOf(row.original).length" class="flex flex-wrap gap-1">
            <UBadge
              v-for="item in attentionOf(row.original)"
              :key="item.status"
              :color="statusOf(item.status).tone"
              :icon="statusOf(item.status).icon"
              :label="`${statusOf(item.status).label} ${count(item.count)}`"
              variant="subtle"
              class="rounded-full whitespace-nowrap"
            />
          </div>
          <span v-else class="text-dimmed">—</span>
        </template>

        <template #quality-cell="{ row }">
          <UBadge v-if="phoneQuality(row.original)" :color="phoneQuality(row.original)!.tone" :label="phoneQuality(row.original)!.label" variant="subtle" class="rounded-full" />
          <span v-else class="text-dimmed">—</span>
        </template>

        <template #open-cell>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
        </template>
      </UTable>
    </section>
  </div>
</template>
