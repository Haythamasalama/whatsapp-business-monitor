<script setup lang="ts">
defineProps<{ title: string, icon: string, hint?: string, loading?: boolean }>()
</script>

<template>
  <div class="flex items-start justify-between gap-3 rounded-xl border border-default bg-default p-5">
    <div class="min-w-0 flex-1">
      <p class="flex items-center gap-1.5 text-sm text-toned">
        {{ title }}
        <UTooltip v-if="hint" :text="hint" :content="{ side: 'top' }">
          <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" />
        </UTooltip>
      </p>
      <div v-if="loading" class="mt-3 space-y-2">
        <USkeleton class="h-7 w-28" />
        <USkeleton class="h-3.5 w-36" />
      </div>
      <div v-else class="mt-2">
        <slot />
      </div>
    </div>
    <div class="grid size-10 shrink-0 place-items-center rounded-lg border border-default bg-muted text-toned">
      <UIcon :name="icon" class="size-5" />
    </div>
  </div>
</template>
