<script setup lang="ts">
const props = defineProps<{ value?: string }>()

const health = computed(() => healthOf(props.value))
</script>

<template>
  <UBadge v-if="health" :color="health.tone" variant="subtle" :label="health.label" class="rounded-full" />
  <span v-else class="text-dimmed">—</span>
</template>
