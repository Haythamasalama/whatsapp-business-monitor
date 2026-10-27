<script setup lang="ts">
const props = defineProps<{ daily: Spend['daily'], currency: string | null }>()

const metric = ref<'cost' | 'messages'>('cost')
const metricItems = computed(() => [{ label: t('chart.cost'), value: 'cost' }, { label: t('chart.messages'), value: 'messages' }])

const values = computed(() => props.daily.map(day => day[metric.value]))
const max = computed(() => Math.max(...values.value, 0))
const empty = computed(() => max.value === 0)

// Three clean gridlines: 0, half and the rounded-up top, so the bars never touch the ceiling.
const top = computed(() => {
  if (!max.value) {
    return 1
  }

  const step = 10 ** Math.floor(Math.log10(max.value))

  return Math.ceil(max.value / step) * step
})

const ticks = computed(() => [top.value, top.value / 2, 0])

const format = (value: number) => (metric.value === 'cost' ? compactMoney(value, props.currency) : count(Math.round(value)))
const tooltip = (day: Spend['daily'][number]) => `${shortDay(day.date)} · ${money(day.cost, props.currency)} · ${t('chart.messageCount', { n: count(day.messages) })}`
// The first day and today always; every fifth day only where the chart is wide enough, never right next to today.
function labelClass(index: number): string | null {
  const last = props.daily.length - 1

  if (index === 0 || index === last) {
    return 'block'
  }

  return index % 5 === 0 && last - index >= 3 ? 'hidden sm:block' : null
}
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-default bg-default p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="font-semibold text-highlighted">
        {{ metric === 'cost' ? t('chart.dailyCost') : t('chart.dailyMessages') }}
      </h3>
      <UTabs v-model="metric" :items="metricItems" :content="false" size="xs" />
    </div>

    <div v-if="empty" class="grid h-48 place-items-center text-sm text-muted">
      {{ t('chart.empty') }}
    </div>

    <div v-else class="mt-5 flex gap-3">
      <div class="relative h-48 min-w-0 flex-1">
        <div
          v-for="tick in ticks"
          :key="tick"
          class="absolute inset-x-0 border-t border-default"
          :style="{ top: `${100 - (tick / top) * 100}%` }"
        />
        <div class="absolute inset-0 flex items-end gap-0.5">
          <UTooltip v-for="(day, index) in daily" :key="day.date" :text="tooltip(day)" :delay-duration="0">
            <div class="group flex h-full flex-1 items-end justify-center">
              <div
                class="w-full max-w-6 rounded-t-[4px] bg-(--chart-bar) transition-opacity group-hover:opacity-80"
                :style="{ height: `${(values[index]! / top) * 100}%`, minHeight: values[index] ? '2px' : '0' }"
              />
            </div>
          </UTooltip>
        </div>
      </div>
      <div class="flex h-48 w-12 shrink-0 flex-col justify-between text-[11px] text-muted tabular-nums" dir="ltr">
        <span v-for="tick in ticks" :key="tick" class="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{{ format(tick) }}</span>
      </div>
    </div>

    <div v-if="!empty" class="me-15 mt-2 flex h-4 gap-0.5 text-[11px] text-muted">
      <span v-for="(day, index) in daily" :key="day.date" class="relative min-w-0 flex-1">
        <span
          v-if="labelClass(index)"
          class="absolute top-0 whitespace-nowrap"
          :class="[labelClass(index), index === 0 ? 'start-0' : index === daily.length - 1 ? 'end-0' : 'left-1/2 -translate-x-1/2']"
        >{{ shortDay(day.date) }}</span>
      </span>
    </div>

    <table class="sr-only">
      <caption>{{ metric === 'cost' ? t('chart.dailyCost') : t('chart.dailyMessages') }}</caption>
      <tr v-for="day in daily" :key="day.date">
        <th>{{ shortDay(day.date) }}</th>
        <td>{{ money(day.cost, currency) }}</td>
        <td>{{ count(day.messages) }}</td>
      </tr>
    </table>
  </div>
</template>
