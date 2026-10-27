<script setup lang="ts">
const props = defineProps<{ groups: TemplateGroup[] }>()

const emit = defineEmits<{ open: [name: string, mode: 'view' | 'edit', id?: string] }>()

const { statsFor, analytics, analyticsError, analyticsLoading, overview } = useManager()
const copy = useCopy()

const selectedName = ref<string | null>(null)
const activeId = ref<string>()

const group = computed(() => props.groups.find(g => g.name === selectedName.value) ?? props.groups[0] ?? null)
const template = computed(() => group.value?.items.find(entry => entry.id === activeId.value) ?? group.value?.items[0] ?? null)
const parts = computed(() => (template.value ? templateText(template.value) : null))
const editable = computed(() => Boolean(template.value && EDITABLE_STATUSES.includes(template.value.status) && (template.value.parameter_format ?? 'POSITIONAL') === 'POSITIONAL'))

const tabs = computed(() => (group.value?.items ?? []).map(entry => ({
  value: entry.id,
  label: languageName(entry.language),
  badge: { label: statusOf(entry.status).label, color: statusOf(entry.status).tone, variant: 'subtle' as const },
})))

const sent = (item: TemplateGroup) => statsFor(item.items.map(entry => entry.id))?.sent ?? 0
const firstLine = (item: TemplateGroup) => templateText(previewItem(item)).body.split('\n').find(line => line.trim()) ?? ''

watch(() => group.value?.name, () => {
  activeId.value = group.value?.items[0]?.id
}, { immediate: true })
</script>

<template>
  <div class="grid md:grid-cols-[20rem_minmax(0,1fr)]">
    <ul class="max-h-[44rem] divide-y divide-default overflow-y-auto border-b border-default md:border-e md:border-b-0">
      <li v-for="item in groups" :key="item.name">
        <button
          type="button"
          class="flex w-full items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/60"
          :class="item.name === group?.name ? 'bg-elevated/70' : ''"
          :aria-current="item.name === group?.name ? 'true' : undefined"
          @click="selectedName = item.name"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate font-mono text-sm font-medium text-highlighted"><bdi dir="ltr">{{ item.name }}</bdi></span>
            <span class="mt-0.5 block truncate text-xs text-muted" dir="auto">{{ firstLine(item) }}</span>
            <span class="mt-1.5 flex flex-wrap gap-1">
              <UBadge
                v-for="entry in item.items"
                :key="entry.id"
                :color="statusOf(entry.status).tone"
                :label="languageCode(entry.language)"
                variant="subtle"
                size="sm"
                class="rounded-full font-mono"
              />
            </span>
          </span>
          <span v-if="analytics" class="shrink-0 text-end text-xs text-muted tabular-nums">{{ count(sent(item)) }}</span>
        </button>
      </li>
    </ul>

    <section v-if="group && template && parts" class="min-w-0 space-y-5 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <h3 class="font-mono text-base font-semibold text-highlighted">
            <bdi dir="ltr">{{ group.name }}</bdi>
          </h3>
          <p class="mt-0.5 text-xs text-muted">
            {{ categoryLabel(group.category) }}
          </p>
        </div>
        <div class="flex gap-2">
          <UTooltip :text="t('template.copyHint')">
            <UButton :label="t('template.copy')" icon="i-lucide-copy" color="neutral" variant="outline" size="sm" @click="copy(toText([templateDoc(group)]))" />
          </UTooltip>
          <UButton
            :label="t('common.edit')"
            icon="i-lucide-pencil"
            size="sm"
            :disabled="!editable"
            @click="emit('open', group.name, 'edit', template.id)"
          />
        </div>
      </div>

      <UTabs v-if="tabs.length > 1" v-model="activeId" :items="tabs" :content="false" variant="link" />

      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <WhatsAppPreview :values="{ header: parts.header, body: parts.body, footer: parts.footer, examples: parts.examples }" :media="parts.media" :buttons="parts.buttons" class="min-w-0" />
        <TemplateDetails :template="template" />
      </div>

      <TemplateStatsCard
        :stats="statsFor([template.id])"
        :days="analytics?.days ?? 30"
        :currency="overview?.account?.currency ?? null"
        :loading="analyticsLoading"
        :error="analyticsError ? t('common.unavailable') : null"
      />
    </section>
  </div>
</template>
