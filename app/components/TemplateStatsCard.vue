<script setup lang="ts">
const props = defineProps<{ stats: TemplateStats | null, days: number, currency?: string | null, loading?: boolean, error?: string | null }>()

const series = computed(() => {
  const sentByDay = new Map((props.stats?.daily ?? []).map(day => [day.date, day.sent]))
  const today = new Date()

  return Array.from({ length: props.days }, (_, i) => {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - (props.days - 1 - i))).toISOString().slice(0, 10)

    return { date, sent: sentByDay.get(date) ?? 0 }
  })
})

const max = computed(() => Math.max(...series.value.map(day => day.sent), 0))

const figures = computed(() => {
  const stats = props.stats

  if (!stats) {
    return []
  }

  return [
    { label: 'أُرسل', value: count(stats.sent), note: '' },
    { label: 'سُلّم', value: count(stats.delivered), note: rate(stats.delivered, stats.sent) },
    { label: 'قُرئ', value: count(stats.read), note: rate(stats.read, stats.delivered) },
    { label: 'التكلفة', value: money(stats.cost, props.currency), note: '' },
    ...(stats.clicked ? [{ label: 'نقرات الأزرار', value: count(stats.clicked), note: '' }] : []),
  ]
})
</script>

<template>
  <div class="rounded-xl border border-default p-4">
    <div class="flex flex-wrap items-baseline justify-between gap-2">
      <h4 class="text-sm font-semibold text-highlighted">
        أداء القالب · آخر {{ days }} يوماً
      </h4>
      <UTooltip text="تُحسب القراءة والنقر خلال 7 أيام من الإرسال.">
        <span class="flex items-center gap-1 text-xs text-muted"><UIcon name="i-lucide-info" class="size-3.5" /></span>
      </UTooltip>
    </div>

    <div v-if="loading" class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <USkeleton v-for="n in 4" :key="n" class="h-12" />
    </div>

    <p v-else-if="error" class="mt-3 text-sm text-muted">
      {{ error }}
    </p>

    <template v-else-if="stats">
      <dl class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div v-for="figure in figures" :key="figure.label" class="rounded-lg bg-muted px-3 py-2">
          <dt class="text-xs text-muted">
            {{ figure.label }}
          </dt>
          <dd class="mt-0.5 flex items-baseline gap-1.5">
            <span class="font-semibold text-highlighted tabular-nums" dir="ltr">{{ figure.value }}</span>
            <span v-if="figure.note" class="text-xs text-muted">{{ figure.note }}</span>
          </dd>
        </div>
      </dl>

      <div v-if="max" class="mt-4 flex h-16 items-end gap-0.5" aria-hidden="true">
        <UTooltip v-for="day in series" :key="day.date" :text="`${shortDay(day.date)} · ${count(day.sent)} رسالة`" :delay-duration="0">
          <div class="flex h-full flex-1 items-end">
            <div
              class="w-full rounded-t-[3px] bg-(--chart-bar)"
              :style="{ height: `${(day.sent / max) * 100}%`, minHeight: day.sent ? '2px' : '0' }"
            />
          </div>
        </UTooltip>
      </div>
      <p v-else class="mt-3 text-sm text-muted">
        لا إرسال خلال الفترة
      </p>
    </template>

    <p v-else class="mt-3 text-sm text-muted">
      لا توجد بيانات
    </p>
  </div>
</template>
