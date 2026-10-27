<script setup lang="ts">
const props = defineProps<{ template: MetaTemplate }>()

const status = computed(() => statusOf(props.template.status))

const details = computed(() => {
  const { template } = props
  const variables = placeholders(templateText(template).body).length
  const score = template.quality_score?.score
  const reason = template.rejected_reason

  return [
    { label: t('details.category'), value: categoryLabel(template.category) },
    { label: t('details.language'), value: languageName(template.language) },
    { label: t('details.variables'), value: variables ? t('details.variableCount', { n: variables }) : t('common.none') },
    ...(score && score !== 'UNKNOWN' && qualityOf(score) ? [{ label: t('details.quality'), value: qualityOf(score)!.label }] : []),
    ...(reason && reason !== 'NONE' ? [{ label: t('details.rejection'), value: rejectionLabel(reason) }] : []),
    { label: t('details.id'), value: template.id, mono: true },
  ]
})
</script>

<template>
  <dl class="h-fit divide-y divide-default rounded-xl border border-default text-sm">
    <div class="flex items-center justify-between gap-3 px-4 py-2.5">
      <dt class="text-muted">
        {{ t('details.status') }}
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
