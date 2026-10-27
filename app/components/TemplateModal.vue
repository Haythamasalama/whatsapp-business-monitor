<script setup lang="ts">
const props = defineProps<{ name: string | null, initialId?: string }>()

const open = defineModel<boolean>('open', { default: false })
const mode = defineModel<'view' | 'edit'>('mode', { default: 'view' })

const { groups, api, reloadTemplates, managerUrl, analytics, analyticsError, analyticsLoading, statsFor, overview } = useManager()

const stats = computed(() => (template.value ? statsFor([template.value.id]) : null))
const currency = computed(() => overview.value?.account?.currency ?? null)
const confirm = useConfirm()
const toast = useToast()

const activeId = ref<string>()
const values = ref<TemplateText>({ header: '', body: '', footer: '', examples: [] })
const result = ref<{ tone: Tone, message: string } | null>(null)
const saving = ref(false)

const group = computed(() => groups.value.find(g => g.name === props.name) ?? null)
const template = computed(() => group.value?.items.find(t => t.id === activeId.value) ?? group.value?.items[0] ?? null)
const parts = computed(() => (template.value ? templateText(template.value) : null))
const positional = computed(() => (template.value?.parameter_format ?? 'POSITIONAL') === 'POSITIONAL')
const editable = computed(() => Boolean(template.value && EDITABLE_STATUSES.includes(template.value.status) && positional.value))
const status = computed(() => statusOf(template.value?.status ?? ''))

const quality = computed(() => {
  const score = template.value?.quality_score?.score

  return score && score !== 'UNKNOWN' ? QUALITY[score] : null
})

const rejected = computed(() => {
  const reason = template.value?.rejected_reason

  return reason && reason !== 'NONE' ? (REJECTIONS[reason] ?? reason) : null
})

const lockedReason = computed(() => {
  if (!positional.value) {
    return 'متغيراته مسمّاة، ويُعدَّل من Meta.'
  }

  return template.value?.status === 'PENDING'
    ? 'قيد المراجعة، يُعدَّل بعد صدور النتيجة.'
    : `لا يُعدَّل وهو «${status.value.label}».`
})

const tabs = computed(() => (group.value?.items ?? []).map(t => ({
  value: t.id,
  label: LANG_NAMES[t.language] ?? t.language,
  badge: { label: statusOf(t.status).label, color: statusOf(t.status).tone, variant: 'subtle' as const },
})))

const details = computed(() => {
  if (!template.value || !parts.value) {
    return []
  }

  return [
    { label: 'الفئة', value: CATEGORY[template.value.category] ?? template.value.category },
    { label: 'اللغة', value: LANG_NAMES[template.value.language] ?? template.value.language },
    { label: 'المتغيرات', value: placeholders(parts.value.body).length ? `${placeholders(parts.value.body).length} متغير` : 'لا يوجد' },
    ...(quality.value ? [{ label: 'الجودة', value: quality.value.label }] : []),
    ...(rejected.value ? [{ label: 'سبب الرفض', value: rejected.value }] : []),
    { label: 'المعرّف', value: template.value.id, mono: true },
  ]
})

const previewValues = computed<TemplateText>(() => ({
  header: parts.value?.header ?? '',
  body: parts.value?.body ?? '',
  footer: parts.value?.footer ?? '',
  examples: parts.value?.examples ?? [],
}))

watch([open, () => props.initialId], () => {
  if (open.value) {
    activeId.value = props.initialId ?? group.value?.items[0]?.id
  }
}, { immediate: true })

watch([() => template.value?.id, mode], () => {
  if (parts.value) {
    values.value = { header: parts.value.header, body: parts.value.body, footer: parts.value.footer, examples: [...parts.value.examples] }
  }

  result.value = null
}, { immediate: true })

async function save(): Promise<void> {
  const problems = templateProblems(values.value)

  if (problems.length) {
    result.value = { tone: 'error', message: problems.join('\n') }

    return
  }

  const confirmed = await confirm({ title: 'إرسال التعديل للمراجعة؟', confirmLabel: 'إرسال' })

  if (!confirmed || !template.value) {
    return
  }

  saving.value = true

  try {
    await api(`/api/templates/${template.value.id}`, { method: 'POST', body: { ...values.value } })
    toast.add({ title: 'أُرسل التعديل للمراجعة', color: 'success', icon: 'i-lucide-check' })
    await reloadTemplates()
    mode.value = 'view'
  }
  catch (error) {
    result.value = { tone: 'error', message: (error as Error).message }
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'sm:max-w-5xl' }">
    <template #title>
      <span class="flex flex-wrap items-center gap-2">
        <UIcon :name="mode === 'edit' ? 'i-lucide-pencil' : 'i-lucide-eye'" class="size-4 text-muted" />
        <bdi dir="ltr" class="font-mono">{{ name }}</bdi>
      </span>
    </template>

    <template #body>
      <div v-if="template && parts" class="space-y-5">
        <UTabs v-if="tabs.length > 1" v-model="activeId" :items="tabs" :content="false" variant="link" />

        <template v-if="mode === 'view'">
          <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_16rem]">
            <WhatsAppPreview :values="previewValues" :media="parts.media" :buttons="parts.buttons" />

            <dl class="divide-y divide-default rounded-xl border border-default text-sm">
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
          </div>

          <TemplateStatsCard
            :stats="stats"
            :days="analytics?.days ?? 30"
            :currency="currency"
            :loading="analyticsLoading"
            :error="analyticsError ? 'غير متاحة' : null"
          />
        </template>

        <template v-else>
          <UAlert v-if="!editable" color="warning" variant="subtle" icon="i-lucide-lock" :description="lockedReason" />

          <TemplateForm v-model="values" :disabled="!editable" :media="parts.media" :buttons="parts.buttons" />

          <UAlert v-if="result" :color="result.tone" variant="subtle" :description="result.message" class="whitespace-pre-line" />
        </template>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap items-center justify-between gap-2">
        <UButton
          :to="managerUrl()"
          target="_blank"
          external
          label="فتح في Meta"
          trailing-icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
        />
        <div v-if="mode === 'view'" class="flex gap-2">
          <UTooltip :text="editable ? '' : lockedReason" :disabled="editable">
            <UButton label="تعديل" icon="i-lucide-pencil" :disabled="!editable" @click="mode = 'edit'" />
          </UTooltip>
        </div>
        <div v-else class="flex items-center gap-2">
          <UTooltip text="تقبل Meta تعديل القالب المُعتمد مرة كل 24 ساعة، وحتى 10 مرات في 30 يوماً.">
            <UIcon name="i-lucide-info" class="size-4 text-dimmed" />
          </UTooltip>
          <UButton label="إلغاء" color="neutral" variant="outline" :disabled="saving" @click="mode = 'view'" />
          <UButton label="إرسال للمراجعة" icon="i-lucide-send" :loading="saving" :disabled="!editable" @click="save" />
        </div>
      </div>
    </template>
  </UModal>
</template>
