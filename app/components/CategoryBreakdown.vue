<script setup lang="ts">
const props = defineProps<{ spend: Spend }>()

const rows = computed(() => Object.entries(props.spend.by_category)
  .filter(([, row]) => row.cost || row.messages)
  .sort((a, b) => b[1].cost - a[1].cost || b[1].messages - a[1].messages)
  .map(([key, row]) => ({
    key,
    label: PRICING[key] ?? key,
    ...row,
    share: props.spend.total ? Math.round((row.cost / props.spend.total) * 100) : 0,
  })))
</script>

<template>
  <div class="rounded-xl border border-default bg-default p-5">
    <h3 class="font-semibold text-highlighted">
      التكلفة حسب النوع
    </h3>

    <p v-if="!rows.length" class="grid h-40 place-items-center text-sm text-muted">
      لا توجد رسائل هذا الشهر
    </p>

    <ul v-else class="mt-5 space-y-4">
      <li v-for="row in rows" :key="row.key">
        <div class="flex items-baseline justify-between gap-2 text-sm">
          <span class="font-medium text-highlighted">{{ row.label }}</span>
          <span class="text-toned tabular-nums" dir="ltr">{{ money(row.cost, spend.currency) }}</span>
        </div>
        <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--chart-track)">
          <div class="h-full rounded-full bg-(--chart-bar)" :style="{ width: `${row.share}%` }" />
        </div>
        <p class="mt-1 text-xs text-muted">
          {{ count(row.messages) }} رسالة · {{ row.share }}٪
        </p>
      </li>
    </ul>
  </div>
</template>
