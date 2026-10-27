<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const emit = defineEmits<{ open: [name: string, mode: 'view' | 'edit', id?: string], create: [], paste: [] }>()

const { groups, loading, templatesError, templateQuota, accounts, accountId, analytics, analyticsError, analyticsLoading, statsFor, enableAnalytics } = useManager()
const confirm = useConfirm()
const toast = useToast()

const UBadge = resolveComponent('UBadge')
const UCheckbox = resolveComponent('UCheckbox')
const UButton = resolveComponent('UButton')
const UTooltip = resolveComponent('UTooltip')
const USkeleton = resolveComponent('USkeleton')

const search = ref('')
const status = ref('ALL')
const category = ref('ALL')
const sort = ref<'sent' | 'meta'>('sent')
const enabling = ref(false)

const sortItems = computed(() => [{ label: t('templates.sortSent'), value: 'sent' }, { label: t('templates.sortMeta'), value: 'meta' }])

type View = 'table' | 'split' | 'cards'

const VIEW_KEY = 'whatsapp-templates:view'
const VIEWS: { value: View, icon: string }[] = [
  { value: 'table', icon: 'i-lucide-list' },
  { value: 'split', icon: 'i-lucide-columns-2' },
  { value: 'cards', icon: 'i-lucide-layout-grid' },
]
const views = computed(() => VIEWS.map(view => ({ ...view, label: t(`templates.views.${view.value}`) })))

function storedView(): View {
  try {
    const value = localStorage.getItem(VIEW_KEY)

    return VIEWS.some(view => view.value === value) ? value as View : 'table'
  }
  catch {
    return 'table'
  }
}

const view = ref<View>(storedView())

watch(view, (value) => {
  try {
    localStorage.setItem(VIEW_KEY, value)
  }
  catch {
    // The choice is only a convenience; without storage it resets on the next visit.
  }
})

// Templates chosen by name for a bulk action; every language of a chosen name is included.
const selected = ref<string[]>([])
const copyOpen = ref(false)
const { run, busy } = useTemplateAction()

watch(accountId, () => (selected.value = []))
watch(groups, list => (selected.value = selected.value.filter(name => list.some(group => group.name === name))))

const selectedItems = computed(() => groups.value.filter(group => selected.value.includes(group.name)).flatMap(group => group.items))
const selectedIds = computed(() => selectedItems.value.map(entry => entry.id))

function toggle(name: string, on: boolean | 'indeterminate'): void {
  selected.value = on === true ? [...new Set([...selected.value, name])] : selected.value.filter(value => value !== name)
}

const allSelected = computed(() => filtered.value.length > 0 && filtered.value.every(group => selected.value.includes(group.name)))

function toggleAll(on: boolean | 'indeterminate'): void {
  selected.value = on === true ? filtered.value.map(group => group.name) : []
}

async function bulkArchive(unarchive: boolean): Promise<void> {
  const ids = selectedItems.value.filter(entry => (unarchive ? entry.status === 'ARCHIVED' : ARCHIVABLE_STATUSES.includes(entry.status))).map(entry => entry.id)

  if (!ids.length) {
    toast.add({ title: t('templateActions.failedTitle'), color: 'warning' })

    return
  }

  if (await run<TemplateActionResult>({
    path: '/api/templates/archive',
    body: { ids, action: unarchive ? 'unarchive' : 'archive' },
    confirm: t(unarchive ? 'templateActions.unarchiveConfirm' : 'templateActions.archiveConfirm', { n: ids.length }),
    confirmLabel: t(unarchive ? 'templateActions.unarchive' : 'templateActions.archive'),
    done: result => t(unarchive ? 'templateActions.unarchivedDone' : 'templateActions.archived', { n: result.done.length }),
  })) {
    selected.value = []
  }
}

async function bulkDelete(): Promise<void> {
  if (selectedItems.value.some(entry => entry.status === 'DISABLED')) {
    toast.add({ title: t('templateActions.disabledNoDelete'), color: 'warning', icon: 'i-lucide-ban' })

    return
  }

  if (await run<TemplateActionResult>({
    path: '/api/templates',
    method: 'DELETE',
    query: { ids: selectedIds.value.join(',') },
    confirm: t('templateActions.deleteManyConfirm', { n: selectedIds.value.length }),
    confirmLabel: t('templateActions.deleteSelected'),
    danger: true,
    done: result => t('templateActions.deletedMany', { n: result.done.length }),
  })) {
    selected.value = []
  }
}

const groupStats = (group: TemplateGroup) => statsFor(group.items.map(entry => entry.id))

async function enable(): Promise<void> {
  const confirmed = await confirm({
    title: t('templates.enableTitle'),
    description: t('templates.enableNote'),
    confirmLabel: t('templates.enableConfirm'),
  })

  if (!confirmed) {
    return
  }

  enabling.value = true

  try {
    await enableAnalytics()
    toast.add({ title: t('templates.enabled'), color: 'success', icon: 'i-lucide-check' })
  }
  catch (error) {
    toast.add({ title: t('templates.enableFailed'), description: (error as Error).message, color: 'error' })
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
    return h('span', { class: 'text-xs text-dimmed' }, analyticsError.value ? t('common.unavailable') : '—')
  }

  if (!stats.sent) {
    return h('div', { class: 'whitespace-nowrap' }, [
      h('p', { class: 'font-semibold text-dimmed tabular-nums' }, '0'),
      h('p', { class: 'text-xs text-muted' }, t('templates.notSent')),
    ])
  }

  return h('div', { class: 'whitespace-nowrap' }, [
    h('p', { class: 'font-semibold text-highlighted tabular-nums' }, count(stats.sent)),
    h('p', { class: 'text-xs text-muted' }, t('templates.rates', { delivered: rate(stats.delivered, stats.sent), read: rate(stats.read, stats.delivered) })),
  ])
}

const bodyOf = (template?: MetaTemplate) => template?.components?.find(c => c.type === 'BODY')?.text ?? ''
const inLanguage = (group: TemplateGroup, lang: string) => group.items.find(entry => entry.language === lang)
const editableIn = (group: TemplateGroup) => group.items.find(entry => EDITABLE_STATUSES.includes(entry.status) && (entry.parameter_format ?? 'POSITIONAL') === 'POSITIONAL')

function hasStatus(group: TemplateGroup, value: string): boolean {
  if (value === 'ALL') {
    return true
  }

  return group.items.some(entry => (value === 'OTHER' ? !MAIN_STATUSES.includes(entry.status) : entry.status === value))
}

const statusTabs = computed(() => ['ALL', ...MAIN_STATUSES, 'OTHER'].map(value => ({
  value,
  label: value === 'ALL' ? t('templates.all') : value === 'OTHER' ? t('templates.other') : statusOf(value).label,
  badge: { label: String(groups.value.filter(group => hasStatus(group, value)).length), color: 'neutral' as const, variant: 'subtle' as const },
})))

const categoryItems = computed(() => [{ label: t('templates.allCategories'), value: 'ALL' }, ...CATEGORIES.map(value => ({ label: categoryLabel(value), value }))])

const filtered = computed(() => {
  const needle = search.value.trim().toLowerCase()

  const list = groups.value.filter(group =>
    hasStatus(group, status.value)
    && (category.value === 'ALL' || group.category === category.value)
    && (!needle || group.name.includes(needle) || group.items.some(entry => bodyOf(entry).toLowerCase().includes(needle))))

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

const hasOtherLanguages = computed(() => groups.value.some(group => group.items.some(entry => !LANGS.includes(entry.language))))

const columns = computed<TableColumn<TemplateGroup>[]>(() => [
  {
    id: 'select',
    header: () => h(UCheckbox, { 'modelValue': allSelected.value, 'aria-label': t('templateActions.selectAll'), 'onUpdate:modelValue': toggleAll }),
    meta: { class: { td: 'w-0' } },
    cell: ({ row }) => h('div', { onClick: (event: Event) => event.stopPropagation() }, [h(UCheckbox, {
      'modelValue': selected.value.includes(row.original.name),
      'aria-label': t('templateActions.select', { name: row.original.name }),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => toggle(row.original.name, value),
    })]),
  },
  {
    accessorKey: 'name',
    header: t('templates.template'),
    meta: { class: { td: 'max-w-0 w-full min-w-44' } },
    cell: ({ row }) => h('div', { class: 'min-w-0' }, [
      h('p', { class: 'font-mono text-sm font-medium text-highlighted' }, [h('bdi', { dir: 'ltr' }, row.original.name)]),
      h('p', { class: 'mt-0.5 truncate text-xs text-muted', dir: 'auto' }, bodyOf(previewItem(row.original)).split('\n').find(line => line.trim()) ?? ''),
    ]),
  },
  {
    id: 'sent',
    header: () => h('span', { class: 'whitespace-nowrap' }, t('templates.sends', { days: analytics.value?.days ?? 30 })),
    cell: ({ row }) => sendsCell(row.original),
  },
  {
    accessorKey: 'category',
    header: t('details.category'),
    meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } },
    cell: ({ row }) => h(UBadge, { color: 'neutral', variant: 'outline', label: categoryLabel(row.original.category), class: 'rounded-full' }),
  },
  ...LANGS.map((lang): TableColumn<TemplateGroup> => ({
    id: lang,
    header: languageName(lang),
    cell: ({ row }) => statusCell(inLanguage(row.original, lang)),
  })),
  ...(hasOtherLanguages.value
    ? [{
        id: 'other',
        header: t('templates.otherLanguages'),
        cell: ({ row }: { row: { original: TemplateGroup } }) => {
          const others = row.original.items.filter(entry => !LANGS.includes(entry.language))

          return others.length
            ? h('div', { class: 'flex flex-wrap gap-1' }, others.map((entry) => {
                const { tone, icon } = statusOf(entry.status)

                return h(UBadge, { color: tone, variant: 'subtle', icon, label: languageCode(entry.language), class: 'rounded-full font-mono' })
              }))
            : h('span', { class: 'text-dimmed' }, '—')
        },
      } satisfies TableColumn<TemplateGroup>]
    : []),
  {
    id: 'actions',
    header: () => h('span', { class: 'sr-only' }, t('templates.actions')),
    meta: { class: { td: 'w-0' } },
    cell: ({ row }) => {
      const editable = editableIn(row.original)

      return h('div', { class: 'flex items-center justify-end gap-0.5' }, [
        action('i-lucide-eye', t('common.preview'), () => emit('open', row.original.name, 'view')),
        action(
          'i-lucide-pencil',
          editable ? t('common.edit') : t('templates.locked'),
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
          {{ t('templates.title') }}
        </h2>
        <p class="text-xs text-muted">
          {{ groups.length ? t('templates.count', { shown: count(filtered.length), total: count(groups.length) }) : t('templates.none') }}
          <UTooltip v-if="templateQuota" :text="t('templateActions.quotaHint')">
            <span class="ms-1 border-s border-default ps-2 tabular-nums">{{ t('templateActions.quota', { used: count(templateQuota.used), limit: count(templateQuota.limit) }) }}</span>
          </UTooltip>
        </p>
        <UButton :label="t('templateActions.help')" :to="docsUrl('templates')" target="_blank" icon="i-lucide-circle-help" color="neutral" variant="link" size="xs" class="-ms-2 mt-0.5" />
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton :label="t('templateActions.copy')" icon="i-lucide-copy-plus" color="neutral" variant="outline" :disabled="!accountId || accounts.length < 2" @click="copyOpen = true" />
        <UFieldGroup :aria-label="t('templates.view')">
          <UTooltip v-for="item in views" :key="item.value" :text="item.label">
            <UButton
              :icon="item.icon"
              :color="view === item.value ? 'primary' : 'neutral'"
              :variant="view === item.value ? 'soft' : 'outline'"
              :aria-label="item.label"
              :aria-pressed="view === item.value"
              @click="view = item.value"
            />
          </UTooltip>
        </UFieldGroup>
        <UTooltip :text="t('templates.pasteHint')">
          <UButton :label="t('templates.paste')" icon="i-lucide-clipboard-paste" color="neutral" variant="outline" :disabled="!accountId" @click="emit('paste')" />
        </UTooltip>
        <UButton :label="t('templates.new')" icon="i-lucide-plus" :disabled="!accountId" @click="emit('create')" />
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 border-y border-default bg-muted/60 px-5 py-3">
      <UInput v-model="search" icon="i-lucide-search" :placeholder="t('templates.search')" class="min-w-56 flex-1" />
      <div class="max-w-full min-w-0 overflow-x-auto">
        <UTabs v-model="status" :items="statusTabs" :content="false" size="sm" :ui="{ list: 'w-max' }" />
      </div>
      <USelect v-model="category" :items="categoryItems" class="w-36" :aria-label="t('details.category')" />
      <USelect v-model="sort" :items="sortItems" icon="i-lucide-arrow-down-wide-narrow" class="w-44" :aria-label="t('templates.sort')" :disabled="!analytics" />
    </div>

    <div v-if="selected.length && view === 'table'" class="flex flex-wrap items-center gap-2 border-b border-default bg-elevated/60 px-5 py-2.5">
      <span class="text-sm font-medium text-highlighted">{{ t('templateActions.selected', { n: count(selectedIds.length) }) }}</span>
      <UButton :label="t('templateActions.clear')" color="neutral" variant="link" size="sm" @click="selected = []" />
      <div class="ms-auto flex flex-wrap gap-2">
        <UButton :label="t('templateActions.archive')" icon="i-lucide-archive" color="neutral" variant="outline" size="sm" :loading="busy" :disabled="selectedIds.length > TEMPLATE_BATCH_MAX" @click="bulkArchive(false)" />
        <UButton :label="t('templateActions.unarchive')" icon="i-lucide-archive-restore" color="neutral" variant="outline" size="sm" :loading="busy" :disabled="selectedIds.length > TEMPLATE_BATCH_MAX" @click="bulkArchive(true)" />
        <UButton :label="t('templateActions.copy')" icon="i-lucide-copy-plus" color="neutral" variant="outline" size="sm" :disabled="accounts.length < 2" @click="copyOpen = true" />
        <UButton :label="t('templateActions.deleteSelected')" icon="i-lucide-trash-2" color="error" variant="soft" size="sm" :loading="busy" :disabled="selectedIds.length > TEMPLATE_BATCH_MAX" @click="bulkDelete" />
      </div>
    </div>

    <UAlert
      v-if="analyticsError && !templatesError"
      color="warning"
      variant="subtle"
      icon="i-lucide-chart-no-axes-column"
      :title="t('templates.statsUnavailable')"
      :description="analyticsError"
      :actions="[{ label: t('templates.enable'), color: 'warning', variant: 'solid', loading: enabling, onClick: enable }]"
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

    <div v-else-if="view !== 'table' && loading && !groups.length" class="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="n in 6" :key="n" class="h-56 rounded-xl" />
    </div>

    <p v-else-if="view !== 'table' && !filtered.length" class="p-10 text-center text-sm text-muted">
      {{ groups.length ? t('templates.noMatch') : t('templates.noneOnAccount') }}
    </p>

    <TemplateSplit v-else-if="view === 'split'" :groups="filtered" @open="(...args) => emit('open', ...args)" />

    <TemplateCards v-else-if="view === 'cards'" :groups="filtered" @open="(...args) => emit('open', ...args)" />

    <UTable
      v-else
      :data="filtered"
      :columns="columns"
      :loading="loading"
      :empty="groups.length ? t('templates.noMatch') : t('templates.noneOnAccount')"
      :ui="{ th: 'py-2.5 text-xs font-medium text-muted', td: 'py-3.5', tr: 'cursor-pointer hover:bg-muted/50' }"
      @select="(_event: Event, row) => emit('open', row.original.name, 'view')"
    />

    <CopyTemplatesModal v-model:open="copyOpen" :ids="selectedIds" />
  </section>
</template>
