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

const nameError = (draft: Draft) => (draft.name && !TEMPLATE_NAME.test(draft.name) ? 'أحرف إنجليزية صغيرة وأرقام و _ فقط' : undefined)
const existing = (draft: Draft, lang: Lang) => (draft.name ? findTemplate(draft.name, lang) : undefined)

function remove(draft: Draft): void {
  drafts.value = drafts.value.filter(d => d.key !== draft.key)
}

async function submit(): Promise<void> {
  const jobs: [Draft, Lang][] = []
  const problems: Record<number, string[]> = {}

  for (const draft of drafts.value) {
    const filled = LANGS.filter(lang => draft.languages[lang].body.trim())
    const list = [
      ...(TEMPLATE_NAME.test(draft.name) ? [] : ['الاسم: أحرف إنجليزية صغيرة وأرقام و _ فقط']),
      ...(filled.length ? [] : ['أدخل النص بلغة واحدة على الأقل']),
      ...filled.flatMap(lang => templateProblems(draft.languages[lang]).map(p => `${LANG_NAMES[lang]}: ${p}`)),
    ]

    if (list.length) {
      problems[draft.key] = list
    }
    else {
      jobs.push(...filled.map(lang => [draft, lang] as [Draft, Lang]))
    }
  }

  blocked.value = problems

  if (Object.keys(problems).length || !jobs.length) {
    return
  }

  const confirmed = await confirm({
    title: `إنشاء ${jobs.length} قالب على Meta؟`,
    description: `على حساب «${current.value ? accountTitle(current.value) : ''}»`,
    confirmLabel: 'إنشاء',
  })

  if (!confirmed) {
    return
  }

  submitting.value = true
  let created = 0

  for (const [draft, lang] of jobs) {
    const found = findTemplate(draft.name, lang)

    if (found) {
      draft.results[lang] = { tone: 'neutral', message: `موجود مسبقاً (${statusOf(found.status).label})، لم يُرسَل.` }
      continue
    }

    try {
      const response = await api<{ id: string, status: string, category?: string }>('/api/templates', {
        method: 'POST',
        body: { name: draft.name, category: draft.category, language: lang, ...draft.languages[lang] },
      })
      const moved = response.category && response.category !== draft.category
        ? ` · نقله Meta إلى «${CATEGORY[response.category] ?? response.category}»`
        : ''

      draft.results[lang] = { tone: 'success', message: `أُنشئ · ${statusOf(response.status).label}${moved}` }
      created++
    }
    catch (error) {
      draft.results[lang] = { tone: 'error', message: (error as Error).message }
    }
  }

  submitting.value = false
  await reloadTemplates()
  toast.add({ title: created ? `أُنشئ ${created} قالب` : 'لم يُنشأ أي قالب', color: created ? 'success' : 'warning' })
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :dismissible="!submitting" :ui="{ content: 'sm:max-w-5xl' }">
    <template #body>
      <div class="space-y-5">
        <UCard v-for="draft in drafts" :key="draft.key" variant="subtle" :ui="{ body: 'space-y-4' }">
          <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-start">
            <UFormField label="اسم القالب" :error="nameError(draft)">
              <UInput v-model.trim="draft.name" dir="ltr" placeholder="order_confirmation" class="w-full" :ui="{ base: 'font-mono' }" />
            </UFormField>
            <UFormField label="الفئة">
              <USelect v-model="draft.category" :items="categoryItems" class="w-full" />
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
                v-if="existing(draft, lang)"
                :label="`موجود على Meta · ${statusOf(existing(draft, lang)!.status).label}`"
                :color="statusOf(existing(draft, lang)!.status).tone"
                variant="subtle"
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
