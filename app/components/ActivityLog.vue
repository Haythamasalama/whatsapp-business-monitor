<script setup lang="ts">
const { api } = useManager()

const rows = ref<Activity[]>([])
const after = ref<string | null>(null)
const error = ref('')
const loading = ref(true)

async function load(more = false): Promise<void> {
  loading.value = true
  error.value = ''

  try {
    const page = await api<{ data: Activity[], after: string | null }>(`/api/business/activities${more && after.value ? `?after=${encodeURIComponent(after.value)}` : ''}`)

    rows.value = more ? [...rows.value, ...page.data] : page.data
    after.value = page.after
  }
  catch (failure) {
    error.value = (failure as Error).message
  }
  finally {
    loading.value = false
  }
}

onMounted(() => load())

const when = (timestamp?: string) => (timestamp
  ? new Intl.DateTimeFormat(intlLocale(), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp.replace(/\+0000$/, 'Z')))
  : '')
</script>

<template>
  <section class="space-y-4 rounded-xl border border-default bg-default p-5">
    <h2 class="flex items-center gap-1.5 font-semibold text-highlighted">
      {{ t('business.activity.title') }}
      <UTooltip :text="t('business.activity.hint')">
        <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="t('business.activity.hint')" />
      </UTooltip>
    </h2>

    <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" />
    <div v-if="loading && !rows.length" class="space-y-3">
      <USkeleton v-for="n in 4" :key="n" class="h-8 w-full" />
    </div>
    <p v-else-if="!rows.length && !error" class="text-sm text-muted">
      {{ t('business.activity.empty') }}
    </p>
    <ul v-else class="divide-y divide-default text-sm">
      <li v-for="row in rows" :key="row.id" class="flex items-center justify-between gap-3 py-2.5 first:pt-0">
        <span class="flex min-w-0 items-center gap-2">
          <UBadge color="neutral" variant="subtle" size="sm" :label="row.category ? tOr(`business.activity.category.${row.category}`, humanize(row.category)) : '—'" />
          <span class="truncate text-toned">{{ row.event_type ? tOr(`business.activity.event.${row.event_type}`, humanize(row.event_type)) : '' }}</span>
        </span>
        <span class="shrink-0 text-xs text-muted">{{ when(row.timestamp) }}</span>
      </li>
    </ul>
    <UButton v-if="after" :label="t('business.activity.more')" color="neutral" variant="outline" size="sm" :loading="loading" @click="load(true)" />
  </section>
</template>
