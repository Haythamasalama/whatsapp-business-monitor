<script setup lang="ts">
const props = defineProps<{
  title: string
  rows: { key: string, label: string, cost: number, messages: number }[]
  total: number
  currency: string | null
}>()

const shares = computed(() => props.rows
  .filter(row => row.cost || row.messages)
  .sort((a, b) => b.cost - a.cost || b.messages - a.messages)
  .map(row => ({ ...row, share: props.total ? Math.round((row.cost / props.total) * 100) : 0 })))
</script>

<template>
  <div class="rounded-xl border border-default bg-default p-5">
    <h3 class="font-semibold text-highlighted">
      {{ title }}
    </h3>

    <p v-if="!shares.length" class="grid h-40 place-items-center text-sm text-muted">
      {{ t('chart.empty') }}
    </p>

    <ul v-else class="mt-5 space-y-4">
      <li v-for="row in shares" :key="row.key">
        <div class="flex items-baseline justify-between gap-2 text-sm">
          <span class="min-w-0 truncate font-medium text-highlighted">{{ row.label }}</span>
          <span class="text-toned tabular-nums" dir="ltr">{{ money(row.cost, currency) }}</span>
        </div>
        <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--chart-track)">
          <div class="h-full rounded-full bg-(--chart-bar)" :style="{ width: `${row.share}%` }" />
        </div>
        <p class="mt-1 text-xs text-muted">
          {{ t('chart.messageCount', { n: count(row.messages) }) }} · {{ t('common.percent', { n: row.share }) }}
        </p>
      </li>
    </ul>
  </div>
</template>
