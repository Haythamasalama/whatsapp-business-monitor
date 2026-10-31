<script setup lang="ts">
const props = defineProps<{ template: MetaTemplate, editable: boolean }>()
const emit = defineEmits<{ fix: [] }>()

const { managerUrl } = useManager()

// Meta sends only a reason code, so each known code gets what it usually means and how to fix it;
// any other code falls back to the general advice.
const REASONS = ['ABUSIVE_CONTENT', 'INCORRECT_CATEGORY', 'INVALID_FORMAT', 'PROMOTIONAL', 'TAG_CONTENT_MISMATCH', 'SCAM']

const reason = computed(() => props.template.rejected_reason ?? 'NONE')
const key = computed(() => (REASONS.includes(reason.value) ? reason.value : 'OTHER'))
const known = computed(() => reason.value !== 'NONE')

const meaning = computed(() => tOr(`rejectionHelp.reasons.${key.value}.meaning`, ''))
const steps = computed(() => [1, 2, 3].map(n => tOr(`rejectionHelp.reasons.${key.value}.step${n}`, '')).filter(Boolean))

// The same checks the editor runs before sending, applied to the text Meta rejected.
const findings = computed(() => {
  const text = templateText(props.template)

  return [...templateProblems(text), ...templateWarnings(text)]
})
</script>

<template>
  <section class="space-y-4 rounded-xl border border-error/30 bg-error/5 p-4">
    <div class="flex flex-wrap items-center gap-2">
      <UIcon name="i-lucide-circle-x" class="size-5 text-error" />
      <h4 class="text-sm font-semibold text-highlighted">
        {{ t('rejectionHelp.title') }}
      </h4>
      <UBadge v-if="known" color="error" variant="subtle" :label="rejectionLabel(reason)" class="rounded-full" />
    </div>

    <p class="text-sm text-toned">
      {{ meaning }}
    </p>

    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2">
        <h5 class="text-xs font-medium text-muted">
          {{ t('rejectionHelp.howToFix') }}
        </h5>
        <ol class="space-y-1.5 text-sm text-default">
          <li v-for="(step, index) in steps" :key="index" class="flex gap-2">
            <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-error/10 text-xs font-medium text-error">{{ index + 1 }}</span>
            <span>{{ step }}</span>
          </li>
        </ol>
      </div>

      <div class="space-y-2">
        <h5 class="text-xs font-medium text-muted">
          {{ t('rejectionHelp.checks') }}
        </h5>
        <ul v-if="findings.length" class="space-y-1.5 text-sm text-default">
          <li v-for="finding in findings" :key="finding" class="flex gap-2">
            <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-4 shrink-0 text-warning" />
            <span>{{ finding }}</span>
          </li>
        </ul>
        <p v-else class="flex gap-2 text-sm text-muted">
          <UIcon name="i-lucide-check" class="mt-0.5 size-4 shrink-0 text-success" />
          <span>{{ t('rejectionHelp.checksClean') }}</span>
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 border-t border-error/20 pt-3">
      <p class="text-xs text-muted">
        {{ t('rejectionHelp.appeal') }}
      </p>
      <div class="flex gap-2">
        <UButton
          :to="managerUrl()"
          target="_blank"
          external
          :label="t('rejectionHelp.requestReview')"
          trailing-icon="i-lucide-external-link"
          color="neutral"
          variant="outline"
          size="sm"
        />
        <UButton v-if="editable" :label="t('rejectionHelp.fix')" icon="i-lucide-pencil" color="error" size="sm" @click="emit('fix')" />
      </div>
    </div>
  </section>
</template>
