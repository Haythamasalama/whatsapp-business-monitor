<script setup lang="ts">
// Bars over time, stacked when there is more than one series. Colours come from --chart-bar, --chart-2, --chart-3.
const props = defineProps<{
  title: string
  points: { key: string, values: number[] }[]
  series: { name: string, color: string }[]
  format: (value: number) => string
}>()

const totals = computed(() => props.points.map(point => point.values.reduce((sum, value) => sum + value, 0)))
const max = computed(() => Math.max(...totals.value, 0))
const empty = computed(() => max.value === 0)

const top = computed(() => {
  if (!max.value) {
    return 1
  }

  const step = 10 ** Math.floor(Math.log10(max.value))

  return Math.ceil(max.value / step) * step
})

const ticks = computed(() => [top.value, top.value / 2, 0])

function tooltip(index: number): string {
  const point = props.points[index]!
  const parts = props.series.length > 1
    ? props.series.map((entry, i) => `${entry.name} ${ltr(props.format(point.values[i] ?? 0))}`)
    : [ltr(props.format(point.values[0] ?? 0))]

  return `${bucketLabel(point.key)} · ${parts.join(' · ')}`
}

// The first and last bucket always, and a few in between where the chart is wide enough.
function labelClass(index: number): string | null {
  const last = props.points.length - 1
  const every = Math.max(1, Math.ceil(props.points.length / 6))

  if (index === 0 || index === last) {
    return 'block'
  }

  return index % every === 0 && last - index >= every / 2 ? 'hidden sm:block' : null
}
</script>

<template>
  <div class="rounded-xl border border-default bg-default p-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h3 class="font-semibold text-highlighted">
        {{ title }}
      </h3>
      <ul v-if="series.length > 1" class="flex flex-wrap gap-3 text-xs text-toned">
        <li v-for="entry in series" :key="entry.name" class="inline-flex items-center gap-1.5">
          <span class="size-2.5 rounded-sm" :style="{ background: entry.color }" /> {{ entry.name }}
        </li>
      </ul>
    </div>

    <div v-if="empty" class="grid h-48 place-items-center text-sm text-muted">
      {{ t('chart.empty') }}
    </div>

    <template v-else>
      <div class="mt-5 flex gap-3">
        <div class="relative h-48 min-w-0 flex-1">
          <div v-for="tick in ticks" :key="tick" class="absolute inset-x-0 border-t border-default" :style="{ top: `${100 - (tick / top) * 100}%` }" />
          <div class="absolute inset-0 flex items-end gap-px">
            <UTooltip v-for="(point, index) in points" :key="point.key" :text="tooltip(index)" :delay-duration="0">
              <div class="group flex h-full min-w-0 flex-1 items-end justify-center">
                <div class="flex w-full max-w-6 flex-col-reverse overflow-hidden rounded-t-[4px] transition-opacity group-hover:opacity-80" :style="{ height: `${(totals[index]! / top) * 100}%`, minHeight: totals[index] ? '2px' : '0' }">
                  <div v-for="(entry, i) in series" :key="entry.name" :style="{ height: totals[index] ? `${((point.values[i] ?? 0) / totals[index]!) * 100}%` : '0', background: entry.color }" />
                </div>
              </div>
            </UTooltip>
          </div>
        </div>
        <div class="flex h-48 w-12 shrink-0 flex-col justify-between text-[11px] text-muted tabular-nums" dir="ltr">
          <span v-for="tick in ticks" :key="tick" class="-translate-y-1/2 first:translate-y-0 last:translate-y-0">{{ format(tick) }}</span>
        </div>
      </div>

      <div class="me-15 mt-2 flex h-4 gap-px text-[11px] text-muted">
        <span v-for="(point, index) in points" :key="point.key" class="relative min-w-0 flex-1">
          <span
            v-if="labelClass(index)"
            class="absolute top-0 whitespace-nowrap"
            :class="[labelClass(index), index === 0 ? 'start-0' : index === points.length - 1 ? 'end-0' : 'left-1/2 -translate-x-1/2']"
          >{{ bucketLabel(point.key) }}</span>
        </span>
      </div>
    </template>

    <table class="sr-only">
      <caption>{{ title }}</caption>
      <tr v-for="(point, index) in points" :key="point.key">
        <th>{{ bucketLabel(point.key) }}</th>
        <td>{{ tooltip(index) }}</td>
      </tr>
    </table>
  </div>
</template>
