<script setup lang="ts">
defineProps<{ title: string }>()

const open = defineModel<boolean>('open', { default: false })
const drafts = defineModel<Draft[]>('drafts', { required: true })

const { api, current, findTemplate, reloadTemplates } = useManager()
const confirm = useConfirm()
const toast = useToast()

const submitting = ref(false)
const blocked = ref<Record<number, string[]>>({})

const categoryItems: { label: string, value: string }[] = CATEGORIES.map(value => ({ label: CATEGORY[value]!, value }))

type Plan
  = | { kind: 'create' }
    | { kind: 'update' | 'same', template: MetaTemplate }
    | { kind: 'locked', template: MetaTemplate, reason: string }

const PLAN_BADGE: Record<Plan['kind'], { label: string, tone: Tone }> = {
  create: { label: 'جديد', tone: 'primary' },
  update: { label: 'تحديث', tone: 'info' },
  same: { label: 'بلا تغيير', tone: 'neutral' },
  locked: { label: 'لا يُعدَّل', tone: 'warning' },
}

const nameError = (draft: Draft) => (draft.name && !TEMPLATE_NAME.test(draft.name) ? 'أحرف إنجليزية صغيرة وأرقام و _ فقط' : undefined)
const existing = (draft: Draft, lang: Lang) => (draft.name ? findTemplate(draft.name, lang) : undefined)
const existsOnMeta = (draft: Draft) => LANGS.some(lang => existing(draft, lang))
const clean = (text?: string) => (text ?? '').replace(/\s+/g, ' ').trim()

function planFor(draft: Draft, lang: Lang): Plan {
  const found = existing(draft, lang)

  if (!found) {
    return { kind: 'create' }
  }

  const stored = templateText(found)
  const values = draft.languages[lang]

  if (clean(stored.body) === clean(values.body) && clean(stored.header) === clean(values.header) && clean(stored.footer) === clean(values.footer)) {
    return { kind: 'same', template: found }
  }

  if (!EDITABLE_STATUSES.includes(found.status) || (found.parameter_format ?? 'POSITIONAL') !== 'POSITIONAL') {
    return { kind: 'locked', template: found, reason: `لا يُعدَّل وهو «${statusOf(found.status).label}»` }
  }

  return { kind: 'update', template: found }
}

// An update starts from the template as Meta has it: its category, and its sample values when none were pasted.
function syncWithMeta(draft: Draft): void {
  for (const lang of LANGS) {
    const found = existing(draft, lang)

    if (!found) {
      continue
    }

    draft.category = found.category

    const values = draft.languages[lang]

    if (values.body.trim() && !values.examples.some(example => example.trim())) {
      values.examples = [...templateText(found).examples]
    }
  }
}

watch(open, (isOpen) => {
  if (isOpen) {
    drafts.value.forEach(syncWithMeta)
  }
})

function remove(draft: Draft): void {
  drafts.value = drafts.value.filter(d => d.key !== draft.key)
}

async function submit(): Promise<void> {
  const jobs: [Draft, Lang, Plan][] = []
  const problems: Record<number, string[]> = {}

  for (const draft of drafts.value) {
    const filled = LANGS.filter(lang => draft.languages[lang].body.trim())
    const plans = filled.map(lang => [lang, planFor(draft, lang)] as const)
    const toSend = plans.filter(([, plan]) => plan.kind === 'create' || plan.kind === 'update')
    const list = [
      ...(TEMPLATE_NAME.test(draft.name) ? [] : ['الاسم: أحرف إنجليزية صغيرة وأرقام و _ فقط']),
      ...(filled.length ? [] : ['أدخل النص بلغة واحدة على الأقل']),
      ...toSend.flatMap(([lang]) => templateProblems(draft.languages[lang]).map(p => `${LANG_NAMES[lang]}: ${p}`)),
    ]

    if (list.length) {
      problems[draft.key] = list
    }
    else {
      jobs.push(...plans.map(([lang, plan]) => [draft, lang, plan] as [Draft, Lang, Plan]))
    }
  }

  blocked.value = problems

  const creates = jobs.filter(([, , plan]) => plan.kind === 'create').length
  const updates = jobs.filter(([, , plan]) => plan.kind === 'update').length

  if (Object.keys(problems).length) {
    return
  }

  if (!creates && !updates) {
    jobs.forEach(([draft, lang, plan]) => (draft.results[lang] = skipped(plan)))
    toast.add({ title: 'لا شيء لإرساله', color: 'neutral' })

    return
  }

  const confirmed = await confirm({
    title: `إرسال ${creates + updates} قالب للمراجعة؟`,
    description: [creates && `جديد: ${creates}`, updates && `تحديث: ${updates}`].filter(Boolean).join(' · '),
    confirmLabel: 'إرسال',
  })

  if (!confirmed) {
    return
  }

  submitting.value = true
  let sent = 0

  for (const [draft, lang, plan] of jobs) {
    if (plan.kind !== 'create' && plan.kind !== 'update') {
      draft.results[lang] = skipped(plan)
      continue
    }

    try {
      if (plan.kind === 'update') {
        await api(`/api/templates/${plan.template.id}`, { method: 'POST', body: { ...draft.languages[lang] } })
        draft.results[lang] = { tone: 'success', message: 'أُرسل التحديث للمراجعة' }
      }
      else {
        const response = await api<{ id: string, status: string, category?: string }>('/api/templates', {
          method: 'POST',
          body: { name: draft.name, category: draft.category, language: lang, ...draft.languages[lang] },
        })
        const moved = response.category && response.category !== draft.category
          ? ` · نقله Meta إلى «${CATEGORY[response.category] ?? response.category}»`
          : ''

        draft.results[lang] = { tone: 'success', message: `أُنشئ · ${statusOf(response.status).label}${moved}` }
      }

      sent++
    }
    catch (error) {
      draft.results[lang] = { tone: 'error', message: (error as Error).message }
    }
  }

  submitting.value = false
  await reloadTemplates()
  toast.add({ title: sent ? `أُرسل ${sent} قالب للمراجعة` : 'لم يُرسل أي قالب', color: sent ? 'success' : 'warning' })
}

function skipped(plan: Plan): { tone: Tone, message: string } {
  return { tone: 'neutral', message: plan.kind === 'locked' ? plan.reason : 'بلا تغيير، لم يُرسل' }
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :dismissible="!submitting" :ui="{ content: 'sm:max-w-5xl' }">
    <template #body>
      <div class="space-y-5">
        <UCard v-for="draft in drafts" :key="draft.key" variant="subtle" :ui="{ body: 'space-y-4' }">
          <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-start">
            <UFormField label="اسم القالب" :error="nameError(draft)">
              <UInput
                v-model.trim="draft.name"
                dir="ltr"
                placeholder="order_confirmation"
                class="w-full"
                :ui="{ base: 'font-mono' }"
                @update:model-value="syncWithMeta(draft)"
              />
            </UFormField>
            <UFormField label="الفئة">
              <USelect v-model="draft.category" :items="categoryItems" class="w-full" :disabled="existsOnMeta(draft)" />
            </UFormField>
            <UButton
              v-if="drafts.length > 1"
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              aria-label="حذف القالب"
              class="sm:mt-6"
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

          <div v-for="lang in LANGS" :key="lang" class="space-y-3 rounded-lg border border-default bg-default p-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h4 class="font-medium text-highlighted">
                {{ LANG_NAMES[lang] }} <code class="text-xs text-muted">{{ lang }}</code>
              </h4>
              <UBadge
                v-if="draft.name && draft.languages[lang].body.trim()"
                :label="PLAN_BADGE[planFor(draft, lang).kind].label"
                :color="PLAN_BADGE[planFor(draft, lang).kind].tone"
                variant="subtle"
                class="rounded-full"
              />
            </div>
            <TemplateForm v-model="draft.languages[lang]" optional collapsible />
            <UAlert
              v-if="draft.results[lang]"
              :color="draft.results[lang]!.tone"
              variant="subtle"
              :description="draft.results[lang]!.message"
            />
          </div>
        </UCard>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full flex-wrap justify-between gap-2">
        <UButton label="قالب آخر" icon="i-lucide-plus" color="neutral" variant="outline" :disabled="submitting" @click="drafts.push(newDraft())" />
        <UButton label="إرسال للمراجعة" icon="i-lucide-send" :loading="submitting" @click="submit" />
      </div>
    </template>
  </UModal>
</template>
