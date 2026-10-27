<script setup lang="ts">
const props = defineProps<{ template: MetaTemplate }>()

const status = computed(() => statusOf(props.template.status))

const details = computed(() => {
  const { template } = props
  const variables = placeholders(templateText(template).body).length
  const score = template.quality_score?.score
  const reason = template.rejected_reason

  return [
    { label: 'الفئة', value: CATEGORY[template.category] ?? template.category },
    { label: 'اللغة', value: languageName(template.language) },
    { label: 'المتغيرات', value: variables ? `${variables} متغير` : 'لا يوجد' },
    ...(score && score !== 'UNKNOWN' && QUALITY[score] ? [{ label: 'الجودة', value: QUALITY[score].label }] : []),
    ...(reason && reason !== 'NONE' ? [{ label: 'سبب الرفض', value: REJECTIONS[reason] ?? reason }] : []),
    { label: 'المعرّف', value: template.id, mono: true },
  ]
})
</script>

<template>
  <dl class="h-fit divide-y divide-default rounded-xl border border-default text-sm">
    <div class="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt class="text-muted">
        الحالة
      </dt>
      <dd><UBadge :color="status.tone" :icon="status.icon" :label="status.label" variant="subtle" class="rounded-full" /></dd>
    </div>
    <div v-for="item in details" :key="item.label" class="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt class="text-muted">
        {{ item.label }}
      </dt>
      <dd class="text-end text-highlighted" :class="item.mono ? 'font-mono text-xs' : ''">
        {{ item.value }}
      </dd>
    </div>
  </dl>
</template>
