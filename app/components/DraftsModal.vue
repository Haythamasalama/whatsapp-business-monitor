<script setup lang="ts">
defineProps<{ title: string }>()

const open = defineModel<boolean>('open', { default: false })
const drafts = defineModel<Draft[]>('drafts', { required: true })

const { api, findTemplate, reloadTemplates } = useManager()
const confirm = useConfirm()
const toast = useToast()

const submitting = ref(false)
const blocked = ref<Record<number, string[]>>({})
const tabs = ref<Record<number, 'fields' | 'code'>>({})

const categoryItems = computed(() => CATEGORIES.map((value): { label: string, value: string } => ({ label: categoryLabel(value), value })))

type Plan
  = | { kind: 'create' }
    | { kind: 'update' | 'same', template: MetaTemplate }
    | { kind: 'locked', template: MetaTemplate, reason: string }

const PLAN_TONES: Record<Plan['kind'], Tone> = { create: 'primary', update: 'info', same: 'neutral', locked: 'warning' }
const planBadge = (kind: Plan['kind']) => ({ label: t(`drafts.plan.${kind}`), tone: PLAN_TONES[kind] })

const nameError = (draft: Draft) => (draft.name && !TEMPLATE_NAME.test(draft.name) ? t('drafts.nameFormat') : undefined)
const langsOf = (draft: Draft) => sortLanguages(Object.keys(draft.languages))
const existing = (draft: Draft, lang: Lang) => (draft.name ? findTemplate(draft.name, lang) : undefined)
const existsOnMeta = (draft: Draft) => langsOf(draft).some(lang => existing(draft, lang))
const clean = (text?: string) => (text ?? '').replace(/\s+/g, ' ').trim()

const otherLanguages = (draft: Draft) => META_LANGUAGES
  .filter(code => !draft.languages[code])
  .map(code => ({ label: `${languageName(code)} · ${code}`, value: code }))

function planFor(draft: Draft, lang: Lang): Plan {
  const found = existing(draft, lang)

  if (!found) {
    return { kind: 'create' }
  }

  const stored = templateText(found)
  const values = draft.languages[lang]!

  if (clean(stored.body) === clean(values.body) && clean(stored.header) === clean(values.header) && clean(stored.footer) === clean(values.footer)) {
    return { kind: 'same', template: found }
  }

  if (!EDITABLE_STATUSES.includes(found.status) || (found.parameter_format ?? 'POSITIONAL') !== 'POSITIONAL') {
    return { kind: 'locked', template: found, reason: t('template.lockedStatus', { status: statusOf(found.status).label }) }
  }

  return { kind: 'update', template: found }
}

// An update starts from the template as Meta has it: its category, and its sample values when none were pasted.
function syncWithMeta(draft: Draft): void {
  for (const lang of langsOf(draft)) {
    const found = existing(draft, lang)

    if (!found) {
      continue
    }

    draft.category = found.category

    const values = draft.languages[lang]!

    if (values.body.trim() && !values.examples.some(example => example.trim())) {
      values.examples = [...templateText(found).examples]
    }
  }
}

function addLanguage(draft: Draft, lang: Lang): void {
  draft.languages = { ...draft.languages, [lang]: emptyText() }
}

function removeLanguage(draft: Draft, lang: Lang): void {
  const { [lang]: _removed, ...rest } = draft.languages
  draft.languages = rest
  delete draft.results[lang]
}

function applyCode(draft: Draft, doc: TemplateDoc): void {
  draft.name = doc.name
  draft.category = doc.category
  draft.languages = Object.keys(doc.languages).length ? doc.languages : { ar: emptyText() }
  syncWithMeta(draft)
}

watch(open, (isOpen) => {
  if (isOpen) {
    drafts.value.forEach(syncWithMeta)
  }
})

function remove(draft: Draft): void {
  drafts.value = drafts.value.filter(d => d.key !== draft.key)
}

function skipped(plan: Plan): { tone: Tone, message: string } {
  return { tone: 'neutral', message: plan.kind === 'locked' ? plan.reason : t('drafts.unchanged') }
}

async function submit(): Promise<void> {
  const jobs: [Draft, Lang, Plan][] = []
  const problems: Record<number, string[]> = {}

  for (const draft of drafts.value) {
    const filled = langsOf(draft).filter(lang => draft.languages[lang]!.body.trim())
    const plans = filled.map(lang => [lang, planFor(draft, lang)] as const)
    const toSend = plans.filter(([, plan]) => plan.kind === 'create' || plan.kind === 'update')
    const list = [
      ...(TEMPLATE_NAME.test(draft.name) ? [] : [t('rules.nameFormat')]),
      ...(filled.length ? [] : [t('drafts.needOneLanguage')]),
      ...toSend.flatMap(([lang]) => templateProblems(draft.languages[lang]!).map(p => `${languageName(lang)}: ${p}`)),
    ]

    if (list.length) {
      problems[draft.key] = list
    }
    else {
      jobs.push(...plans.map(([lang, plan]) => [draft, lang, plan] as [Draft, Lang, Plan]))
    }
  }

  blocked.value = problems

  if (Object.keys(problems).length) {
    tabs.value = Object.fromEntries(drafts.value.map(draft => [draft.key, 'fields']))

    return
  }

  const creates = jobs.filter(([, , plan]) => plan.kind === 'create').length
  const updates = jobs.filter(([, , plan]) => plan.kind === 'update').length

  if (!creates && !updates) {
    jobs.forEach(([draft, lang, plan]) => (draft.results[lang] = skipped(plan)))
    toast.add({ title: t('drafts.nothingToSend'), color: 'neutral' })

    return
  }

  const confirmed = await confirm({
    title: t('drafts.submitTitle', { n: creates + updates }),
    description: [creates && t('drafts.creates', { n: creates }), updates && t('drafts.updates', { n: updates })].filter(Boolean).join(' · '),
    confirmLabel: t('template.submitConfirm'),
  })

  if (!confirmed) {
    return
  }

  submitting.value = true
  tabs.value = Object.fromEntries(drafts.value.map(draft => [draft.key, 'fields']))
  let sent = 0

  for (const [draft, lang, plan] of jobs) {
    if (plan.kind !== 'create' && plan.kind !== 'update') {
      draft.results[lang] = skipped(plan)
      continue
    }

    try {
      if (plan.kind === 'update') {
        await api(`/api/templates/${plan.template.id}`, { method: 'POST', body: { ...draft.languages[lang] } })
        draft.results[lang] = { tone: 'success', message: t('drafts.updateSent') }
      }
      else {
        const response = await api<{ id: string, status: string, category?: string }>('/api/templates', {
          method: 'POST',
          body: { name: draft.name, category: draft.category, language: lang, ...draft.languages[lang] },
        })
        const moved = response.category && response.category !== draft.category
          ? ` · ${t('drafts.moved', { category: categoryLabel(response.category) })}`
          : ''

        draft.results[lang] = { tone: 'success', message: `${t('drafts.created')} · ${statusOf(response.status).label}${moved}` }
      }

      sent++
    }
    catch (error) {
      draft.results[lang] = { tone: 'error', message: (error as Error).message }
    }
  }

  submitting.value = false
  await reloadTemplates()
  toast.add({ title: sent ? t('drafts.sent', { n: sent }) : t('drafts.noneSent'), color: sent ? 'success' : 'warning' })
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :dismissible="!submitting" :ui="{ content: 'sm:max-w-5xl' }">
    <template #body>
      <div class="space-y-5">
        <UCard v-for="draft in drafts" :key="draft.key" variant="subtle" :ui="{ body: 'space-y-4' }">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <UTabs v-model="tabs[draft.key]" default-value="fields" :items="editTabs()" :content="false" size="sm" />
            <UButton
              v-if="drafts.length > 1"
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="t('drafts.removeTemplate')"
              @click="remove(draft)"
            />
          </div>

          <UAlert v-if="blocked[draft.key]" color="error" variant="subtle" icon="i-lucide-circle-alert">
            <template #description>
              <ul class="list-inside list-disc space-y-0.5">
                <li v-for="problem in blocked[draft.key]" :key="problem">
                  {{ problem }}
                </li>
              </ul>
            </template>
          </UAlert>

          <TemplateCodeEditor
            v-if="tabs[draft.key] === 'code'"
            :model-value="docFromDraft(draft)"
            @update:model-value="(doc) => applyCode(draft, doc)"
          />

          <template v-else>
            <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <UFormField :label="t('drafts.name')" :error="nameError(draft)">
                <UInput
                  v-model.trim="draft.name"
                 
                  placeholder="order_confirmation"
                  class="w-full"
                  :ui="{ base: 'font-mono' }"
                  @update:model-value="syncWithMeta(draft)"
                />
              </UFormField>
              <UFormField :label="t('details.category')">
                <USelect v-model="draft.category" :items="categoryItems" class="w-full" :disabled="existsOnMeta(draft)" />
              </UFormField>
            </div>

            <div v-for="lang in langsOf(draft)" :key="lang" class="space-y-3 rounded-lg border border-default bg-default p-4">
              <div class="flex flex-wrap items-center justify-between gap-2">
                <h4 class="font-medium text-highlighted">
                  {{ languageName(lang) }} <code class="text-xs text-muted">{{ languageCode(lang) }}</code>
                </h4>
                <div class="flex items-center gap-1">
                  <UBadge
                    v-if="draft.name && draft.languages[lang]!.body.trim()"
                    :label="planBadge(planFor(draft, lang).kind).label"
                    :color="planBadge(planFor(draft, lang).kind).tone"
                    variant="subtle"
                    class="rounded-full"
                  />
                  <UButton
                    v-if="langsOf(draft).length > 1"
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    :aria-label="t('drafts.removeLanguage', { language: languageName(lang) })"
                    @click="removeLanguage(draft, lang)"
                  />
                </div>
              </div>
              <TemplateForm v-model="draft.languages[lang]!" />
              <UAlert
                v-if="draft.results[lang]"
                :color="draft.results[lang]!.tone"
                variant="subtle"
                :description="draft.results[lang]!.message"
              />
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                v-for="lang in LANGS.filter(code => !draft.languages[code])"
                :key="lang"
                :label="languageName(lang)"
                icon="i-lucide-plus"
                color="neutral"
                variant="soft"
                size="xs"
                @click="addLanguage(draft, lang)"
              />
              <USelectMenu
                :items="otherLanguages(draft)"
                value-key="value"
                :placeholder="t('drafts.otherLanguage')"
                size="xs"
                icon="i-lucide-languages"
                class="w-44"
                :search-input="{ placeholder: t('drafts.searchLanguage') }"
                @update:model-value="(code) => code && addLanguage(draft, String(code))"
              />
            </div>
          </template>
        </UCard>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-2">
        <UButton :label="t('drafts.another')" icon="i-lucide-plus" color="neutral" variant="outline" :disabled="submitting" @click="drafts.push(newDraft())" />
        <UButton :label="t('template.submit')" icon="i-lucide-send" :loading="submitting" @click="submit" />
      </div>
    </template>
  </UModal>
</template>
