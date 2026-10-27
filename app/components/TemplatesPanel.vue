<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const emit = defineEmits<{ open: [name: string, mode: 'view' | 'edit', id?: string], create: [], paste: [] }>()

const { groups, loading, templatesError, accountId, analytics, analyticsError, analyticsLoading, statsFor, enableAnalytics } = useManager()
const confirm = useConfirm()
const toast = useToast()

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UTooltip = resolveComponent('UTooltip')
const USkeleton = resolveComponent('USkeleton')

const search = ref('')
const status = ref('ALL')
const category = ref('ALL')
const sort = ref<'sent' | 'meta'>('sent')
const enabling = ref(false)

const sortItems = [{ label: 'الأكثر إرسالاً', value: 'sent' }, { label: 'ترتيب Meta', value: 'meta' }]

const groupStats = (group: TemplateGroup) => statsFor(group.items.map(t => t.id))

async function enable(): Promise<void> {
  const confirmed = await confirm({
    title: 'تفعيل إحصاءات القوالب؟',
    description: 'لا يمكن إلغاء التفعيل لاحقاً.',
    confirmLabel: 'تفعيل',
  })

  if (!confirmed) {
    return
  }

  enabling.value = true

  try {
    await enableAnalytics()
    toast.add({ title: 'فُعّلت إحصاءات القوالب', color: 'success', icon: 'i-lucide-check' })
  }
  catch (error) {
    toast.add({ title: 'تعذّر التفعيل', description: (error as Error).message, color: 'error' })
  }
  finally {
    enabling.value = false
  }
}

function sendsCell(group: TemplateGroup) {
  if (analyticsLoading.value) {
    return h(USkeleton, { class: 'h-4 w-16' })
  }

  const stats = groupStats(group)

  if (!stats) {
    return h('span', { class: 'text-xs text-dimmed' }, analyticsError.value ? 'غير متاح' : '—')
  }

  if (!stats.sent) {
    return h('div', { class: 'whitespace-nowrap' }, [
      h('p', { class: 'font-semibold text-dimmed tabular-nums' }, '0'),
      h('p', { class: 'text-xs text-muted' }, 'لم يُرسل خلال الفترة'),
    ])
  }

  return h('div', { class: 'whitespace-nowrap' }, [
    h('p', { class: 'font-semibold text-highlighted tabular-nums' }, count(stats.sent)),
    h('p', { class: 'text-xs text-muted' }, `تسليم ${rate(stats.delivered, stats.sent)} · قراءة ${rate(stats.read, stats.delivered)}`),
  ])
}

const bodyOf = (template?: MetaTemplate) => template?.components?.find(c => c.type === 'BODY')?.text ?? ''
const inLanguage = (group: TemplateGroup, lang: string) => group.items.find(t => t.language === lang)
const editableIn = (group: TemplateGroup) => group.items.find(t => EDITABLE_STATUSES.includes(t.status) && (t.parameter_format ?? 'POSITIONAL') === 'POSITIONAL')

function hasStatus(group: TemplateGroup, value: string): boolean {
  if (value === 'ALL') {
    return true
  }

  return group.items.some(t => (value === 'OTHER' ? !MAIN_STATUSES.includes(t.status) : t.status === value))
}

const statusTabs = computed(() => ['ALL', ...MAIN_STATUSES, 'OTHER'].map(value => ({
  value,
  label: value === 'ALL' ? 'الكل' : value === 'OTHER' ? 'أخرى' : statusOf(value).label,
  badge: { label: String(groups.value.filter(group => hasStatus(group, value)).length), color: 'neutral' as const, variant: 'subtle' as const },
})))

const categoryItems = [{ label: 'كل الفئات', value: 'ALL' }, ...CATEGORIES.map(value => ({ label: CATEGORY[value]!, value }))]

const filtered = computed(() => {
  const needle = search.value.trim().toLowerCase()

  const list = groups.value.filter(group =>
    hasStatus(group, status.value)
    && (category.value === 'ALL' || group.category === category.value)
    && (!needle || group.name.includes(needle) || group.items.some(t => bodyOf(t).toLowerCase().includes(needle))))

  return sort.value === 'sent' && analytics.value
    ? [...list].sort((a, b) => (groupStats(b)?.sent ?? 0) - (groupStats(a)?.sent ?? 0))
    : list
})

function statusCell(template?: MetaTemplate) {
  if (!template) {
    return h('span', { class: 'text-dimmed' }, '—')
  }

  const { label, tone, icon } = statusOf(template.status)

  return h(UBadge, { color: tone, variant: 'subtle', icon, label, class: 'rounded-full' })
}

function action(icon: string, label: string, onClick: () => void, disabled = false) {
  return h(UTooltip, { text: label }, () => h(UButton, {
    icon,
    color: 'neutral',
    variant: 'ghost',
    size: 'sm',
    disabled,
    'aria-label': label,
    onClick: (event: Event) => {
      event.stopPropagation()
      onClick()
    },
  }))
}

const hasOtherLanguages = computed(() => groups.value.some(group => group.items.some(t => !LANGS.includes(t.language))))

const columns = computed<TableColumn<TemplateGroup>[]>(() => [
  {
    accessorKey: 'name',
    header: 'القالب',
    meta: { class: { td: 'max-w-0 w-full min-w-44' } },
    cell: ({ row }) => h('div', { class: 'min-w-0' }, [
      h('p', { class: 'font-mono text-sm font-medium text-highlighted' }, [h('bdi', { dir: 'ltr' }, row.original.name)]),
      h('p', { class: 'mt-0.5 truncate text-xs text-muted', dir: 'auto' }, bodyOf(row.original.items[0]).split('\n').find(line => line.trim()) ?? ''),
    ]),
  },
  {
    id: 'sent',
    header: () => h('span', { class: 'whitespace-nowrap' }, `الإرسال · آخر ${analytics.value?.days ?? 30} يوماً`),
    cell: ({ row }) => sendsCell(row.original),
  },
  {
    accessorKey: 'category',
    header: 'الفئة',
    meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } },
    cell: ({ row }) => h(UBadge, { color: 'neutral', variant: 'outline', label: CATEGORY[row.original.category] ?? row.original.category, class: 'rounded-full' }),
  },
  ...LANGS.map((lang): TableColumn<TemplateGroup> => ({
    id: lang,
    header: languageName(lang),
    cell: ({ row }) => statusCell(inLanguage(row.original, lang)),
  })),
  ...(hasOtherLanguages.value
    ? [{
        id: 'other',
        header: 'لغات أخرى',
        cell: ({ row }: { row: { original: TemplateGroup } }) => {
          const others = row.original.items.filter(t => !LANGS.includes(t.language))

          return others.length
            ? h('div', { class: 'flex flex-wrap gap-1' }, others.map((t) => {
                const { tone, icon } = statusOf(t.status)

                return h(UBadge, { color: tone, variant: 'subtle', icon, label: t.language, class: 'rounded-full font-mono' })
              }))
            : h('span', { class: 'text-dimmed' }, '—')
        },
      } satisfies TableColumn<TemplateGroup>]
    : []),
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, 'الإجراءات'),
    meta: { class: { td: 'w-0' } },
    cell: ({ row }) => {
      const editable = editableIn(row.original)

      return h('div', { class: 'flex items-center justify-end gap-0.5' }, [
        action('i-lucide-eye', 'معاينة', () => emit('open', row.original.name, 'view')),
        action(
          'i-lucide-pencil',
          editable ? 'تعديل' : 'لا تقبل Meta تعديله الآن',
          () => emit('open', row.original.name, 'edit', editable?.id),
          !editable,
        ),
      ])
    },
  },
])
</script>

<template>
  <section class="rounded-xl border border-default bg-default">
    <div class="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
      <div>
        <h2 class="text-lg font-semibold text-highlighted">
          قوالب الرسائل
        </h2>
        <p class="text-xs text-muted">
          {{ groups.length ? `${count(filtered.length)} من ${count(groups.length)} قالب` : 'لا توجد قوالب بعد' }}
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton label="إنشاء أو تحديث من نص" icon="i-lucide-clipboard-paste" color="neutral" variant="outline" :disabled="!accountId" @click="emit('paste')" />
        <UButton label="قالب جديد" icon="i-lucide-plus" :disabled="!accountId" @click="emit('create')" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 border-y border-default bg-muted/60 px-5 py-3">
      <UInput v-model="search" icon="i-lucide-search" placeholder="ابحث باسم القالب أو نصّه" class="min-w-56 flex-1" />
      <div class="max-w-full min-w-0 overflow-x-auto">
        <UTabs v-model="status" :items="statusTabs" :content="false" size="sm" :ui="{ list: 'w-max' }" />
      </div>
      <USelect v-model="category" :items="categoryItems" class="w-36" aria-label="الفئة" />
      <USelect v-model="sort" :items="sortItems" icon="i-lucide-arrow-down-wide-narrow" class="w-44" aria-label="الترتيب" :disabled="!analytics" />
    </div>

    <UAlert
      v-if="analyticsError && !templatesError"
      color="warning"
      variant="subtle"
      icon="i-lucide-chart-no-axes-column"
      title="أرقام الإرسال غير متاحة"
      :description="analyticsError"
      :actions="[{ label: 'تفعيل الإحصاءات', color: 'warning', variant: 'solid', loading: enabling, onClick: enable }]"
      class="mx-5 mt-4"
    />

    <UAlert
      v-if="templatesError"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      :description="templatesError"
      class="m-5"
    />

    <UTable
      v-else
      :data="filtered"
      :columns="columns"
      :loading="loading"
      :empty="groups.length ? 'لا توجد نتائج مطابقة' : 'لا توجد قوالب على هذا الحساب'"
      :ui="{ th: 'py-2.5 text-xs font-medium text-muted', td: 'py-3.5', tr: 'cursor-pointer hover:bg-muted/50' }"
      @select="(_event: Event, row) => emit('open', row.original.name, 'view')"
    />
  </section>
</template>
