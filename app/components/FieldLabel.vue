<script setup lang="ts">
defineProps<{ label: string, hint: string }>()
</script>

<template>
  <span class="inline-flex items-center gap-1.5">
    {{ label }}
    <UTooltip :text="hint">
      <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="hint" />
    </UTooltip>
  </span>
</template>
