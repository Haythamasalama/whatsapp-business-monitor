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
const editTab = ref<'fields' | 'code'>('fields')
const copy = useCopy()
const { run, busy } = useTemplateAction()
const { accounts } = useManager()
const copyOpen = ref(false)

// Editing covers one language: the code shows it alone, and a pasted code with several languages
// gives this one its text (or the first one when it is missing).
const editDoc = computed<TemplateDoc>(() => ({
  name: group.value?.name ?? '',
  category: template.value?.category ?? 'UTILITY',
  languages: { [template.value?.language ?? 'ar']: values.value },
}))

function applyCode(doc: TemplateDoc): void {
  const next = doc.languages[template.value?.language ?? ''] ?? Object.values(doc.languages)[0]

  if (next) {
    values.value = { ...next, examples: [...next.examples] }
  }
}

const group = computed(() => groups.value.find(g => g.name === props.name) ?? null)
const template = computed(() => group.value?.items.find(entry => entry.id === activeId.value) ?? group.value?.items[0] ?? null)
const parts = computed(() => (template.value ? templateText(template.value) : null))
const positional = computed(() => (template.value?.parameter_format ?? 'POSITIONAL') === 'POSITIONAL')
const editable = computed(() => Boolean(template.value && EDITABLE_STATUSES.includes(template.value.status) && positional.value))
const status = computed(() => statusOf(template.value?.status ?? ''))

const lockedReason = computed(() => {
  if (!positional.value) {
    return t('template.lockedNamed')
  }

  return template.value?.status === 'PENDING'
    ? t('template.lockedPending')
    : t('template.lockedStatus', { status: status.value.label })
})

const tabs = computed(() => (group.value?.items ?? []).map(entry => ({
  value: entry.id,
  label: languageName(entry.language),
  badge: { label: statusOf(entry.status).label, color: statusOf(entry.status).tone, variant: 'subtle' as const },
})))

// Every language of the template as text, so it can be copied and reused for a new one.
const asText = computed(() => (group.value ? toText([templateDoc(group.value)]) : ''))

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

// Writes on this template. Each one is confirmed with Meta's rule for it before anything is sent.
async function unpause(): Promise<void> {
  if (template.value) {
    await run({ path: `/api/templates/${template.value.id}/unpause`, confirm: t('templateActions.unpauseConfirm'), confirmLabel: t('templateActions.unpause'), done: () => t('templateActions.unpaused') })
  }
}

async function archive(unarchive: boolean): Promise<void> {
  if (template.value) {
    await run<TemplateActionResult>({
      path: '/api/templates/archive',
      body: { ids: [template.value.id], action: unarchive ? 'unarchive' : 'archive' },
      confirm: t(unarchive ? 'templateActions.unarchiveConfirm' : 'templateActions.archiveConfirm', { n: 1 }),
      confirmLabel: t(unarchive ? 'templateActions.unarchive' : 'templateActions.archive'),
      done: result => t(unarchive ? 'templateActions.unarchivedDone' : 'templateActions.archived', { n: result.done.length }),
    })
  }
}

async function remove(all: boolean): Promise<void> {
  const current = template.value

  if (!current) {
    return
  }

  const removed = await run<{ success?: boolean }>({
    path: '/api/templates',
    method: 'DELETE',
    query: all ? { name: current.name } : { name: current.name, id: current.id },
    confirm: all
      ? t('templateActions.deleteAllConfirm', { name: current.name })
      : t('templateActions.deleteOneConfirm', { name: current.name, language: languageName(current.language) }),
    confirmLabel: t('templateActions.deleteSelected'),
    danger: true,
    done: () => t('templateActions.deleted'),
  })

  if (removed && (all || (group.value?.items.length ?? 0) === 0)) {
    open.value = false
  }
}

const anyDisabled = computed(() => Boolean(group.value?.items.some(entry => entry.status === 'DISABLED')))

const actions = computed(() => {
  const current = template.value

  if (!current) {
    return []
  }

  return [
    [
      ...(current.status === 'PAUSED' ? [{ label: t('templateActions.unpause'), icon: 'i-lucide-circle-play', onSelect: unpause }] : []),
      ...(ARCHIVABLE_STATUSES.includes(current.status) ? [{ label: t('templateActions.archive'), icon: 'i-lucide-archive', onSelect: () => archive(false) }] : []),
      ...(current.status === 'ARCHIVED' ? [{ label: t('templateActions.unarchive'), icon: 'i-lucide-archive-restore', onSelect: () => archive(true) }] : []),
      { label: t('templateActions.copy'), icon: 'i-lucide-copy-plus', disabled: accounts.value.length < 2 || !canCopyTemplate(current), onSelect: () => { copyOpen.value = true } },
    ],
    [
      { label: t('templateActions.deleteOne'), icon: 'i-lucide-trash', color: 'error' as const, disabled: current.status === 'DISABLED', onSelect: () => remove(false) },
      { label: t('templateActions.deleteAll'), icon: 'i-lucide-trash-2', color: 'error' as const, disabled: anyDisabled.value, onSelect: () => remove(true) },
    ],
  ]
})

async function save(): Promise<void> {
  const problems = templateProblems(values.value)

  if (problems.length) {
    result.value = { tone: 'error', message: problems.join('\n') }

    return
  }

  const confirmed = await confirm({ title: t('template.submitTitle'), confirmLabel: t('template.submitConfirm') })

  if (!confirmed || !template.value) {
    return
  }

  saving.value = true

  try {
    await api(`/api/templates/${template.value.id}`, { method: 'POST', body: { ...values.value } })
    toast.add({ title: t('template.submitted'), color: 'success', icon: 'i-lucide-check' })
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
          <UAlert v-if="template.status === 'PAUSED'" color="warning" variant="subtle" icon="i-lucide-circle-pause" :description="t('templateActions.pausedNote')" :actions="[{ label: t('templateActions.unpause'), color: 'warning', variant: 'solid', loading: busy, onClick: unpause }]" />
          <UAlert v-else-if="template.status === 'ARCHIVED'" color="neutral" variant="subtle" icon="i-lucide-archive" :description="t('templateActions.archivedNote')" :actions="[{ label: t('templateActions.unarchive'), color: 'neutral', variant: 'solid', loading: busy, onClick: () => archive(true) }]" />

          <div class="grid gap-5 md:grid-cols-[minmax(0,1fr)_20rem]">
            <WhatsAppPreview :values="previewValues" :media="parts.media" :buttons="parts.buttons" class="min-w-0" />

            <TemplateDetails :template="template" />
          </div>

          <TemplateStatsCard
            :stats="stats"
            :days="analytics?.days ?? 30"
            :currency="currency"
            :loading="analyticsLoading"
            :error="analyticsError ? t('common.unavailable') : null"
          />
        </template>

        <template v-else>
          <UAlert v-if="!editable" color="warning" variant="subtle" icon="i-lucide-lock" :description="lockedReason" />

          <UTabs v-model="editTab" :items="editTabs()" :content="false" size="sm" />

          <TemplateCodeEditor
            v-if="editTab === 'code'"
            :model-value="editDoc"
            @update:model-value="applyCode"
          />
          <TemplateForm v-else v-model="values" :disabled="!editable" :media="parts.media" :buttons="parts.buttons" />

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
          :label="t('template.openInMeta')"
          trailing-icon="i-lucide-external-link"
          color="neutral"
          variant="ghost"
        />
        <div v-if="mode === 'view'" class="flex gap-2">
          <UDropdownMenu :items="actions" :content="{ align: 'end' }">
            <UButton :label="t('templateActions.more')" icon="i-lucide-ellipsis" color="neutral" variant="outline" :loading="busy" />
          </UDropdownMenu>
          <UTooltip :text="t('template.copyHint')">
            <UButton :label="t('template.copy')" icon="i-lucide-copy" color="neutral" variant="outline" @click="copy(asText)" />
          </UTooltip>
          <UTooltip :text="editable ? '' : lockedReason" :disabled="editable">
            <UButton :label="t('common.edit')" icon="i-lucide-pencil" :disabled="!editable" @click="mode = 'edit'" />
          </UTooltip>
        </div>
        <div v-else class="flex items-center gap-2">
          <UTooltip :text="t('template.editLimits')">
            <UIcon name="i-lucide-info" class="size-4 text-dimmed" />
          </UTooltip>
          <UButton :label="t('common.cancel')" color="neutral" variant="outline" :disabled="saving" @click="mode = 'view'" />
          <UButton :label="t('template.submit')" icon="i-lucide-send" :loading="saving" :disabled="!editable" @click="save" />
        </div>
      </div>
    </template>
  </UModal>

  <CopyTemplatesModal v-if="template" v-model:open="copyOpen" :ids="[template.id]" />
</template>
