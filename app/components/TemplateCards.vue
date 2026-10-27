<script setup lang="ts">
defineProps<{ groups: TemplateGroup[] }>()

const emit = defineEmits<{ open: [name: string, mode: 'view' | 'edit', id?: string] }>()

const { statsFor, analytics, analyticsLoading } = useManager()

const preview = (group: TemplateGroup): TemplateText => {
  const text = templateText(group.items[0]!)

  return { header: text.header, body: text.body, footer: text.footer, examples: text.examples }
}

const editableIn = (group: TemplateGroup) => group.items.find(entry => EDITABLE_STATUSES.includes(entry.status) && (entry.parameter_format ?? 'POSITIONAL') === 'POSITIONAL')
const sent = (group: TemplateGroup) => statsFor(group.items.map(entry => entry.id))?.sent ?? 0
</script>

<template>
  <div class="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
    <article
      v-for="group in groups"
      :key="group.name"
      class="flex min-w-0 flex-col overflow-hidden rounded-xl border border-default bg-default transition-shadow hover:shadow-md"
    >
      <button type="button" class="flex flex-1 flex-col text-start" @click="emit('open', group.name, 'view')">
        <div class="flex items-start justify-between gap-3 p-4 pb-3">
          <div class="min-w-0">
            <p class="truncate font-mono text-sm font-medium text-highlighted">
              <bdi dir="ltr">{{ group.name }}</bdi>
            </p>
            <p class="mt-0.5 text-xs text-muted">
              {{ categoryLabel(group.category) }}
            </p>
          </div>
          <div class="shrink-0 text-end">
            <USkeleton v-if="analyticsLoading" class="h-5 w-10" />
            <template v-else-if="analytics">
              <p class="font-semibold text-highlighted tabular-nums">
                {{ count(sent(group)) }}
              </p>
              <p class="text-[11px] text-muted">
                {{ t('templates.sent') }}
              </p>
            </template>
          </div>
        </div>

        <!-- The bubble fades out at the bottom so long templates keep cards the same height. -->
        <div class="max-h-44 overflow-hidden px-4 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
          <WhatsAppPreview :values="preview(group)" />
        </div>
      </button>

      <div class="flex items-center justify-between gap-2 border-t border-default px-4 py-2.5">
        <div class="flex min-w-0 flex-wrap gap-1">
          <UBadge
            v-for="template in group.items"
            :key="template.id"
            :color="statusOf(template.status).tone"
            :icon="statusOf(template.status).icon"
            :label="languageCode(template.language)"
            variant="subtle"
            class="rounded-full font-mono"
          />
        </div>
        <div class="flex shrink-0 items-center gap-0.5">
          <UTooltip :text="t('common.preview')">
            <UButton icon="i-lucide-eye" color="neutral" variant="ghost" size="sm" :aria-label="t('common.preview')" @click="emit('open', group.name, 'view')" />
          </UTooltip>
          <UTooltip :text="editableIn(group) ? t('common.edit') : t('templates.locked')">
            <UButton
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              size="sm"
              :aria-label="t('common.edit')"
              :disabled="!editableIn(group)"
              @click="emit('open', group.name, 'edit', editableIn(group)?.id)"
            />
          </UTooltip>
        </div>
      </div>
    </article>
  </div>
</template>
