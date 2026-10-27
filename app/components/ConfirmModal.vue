<script setup lang="ts">
defineProps<{ title: string, description?: string, confirmLabel?: string, danger?: boolean }>()

const emit = defineEmits<{ close: [value: boolean] }>()
</script>

<template>
  <UModal :title="title" :description="description" :close="false" :dismissible="false" :ui="{ footer: 'justify-end' }">
    <template #footer>
      <UButton :label="t('common.cancel')" color="neutral" variant="outline" @click="emit('close', false)" />
      <UButton
        :label="confirmLabel ?? t('common.continue')"
        :icon="danger ? 'i-lucide-trash-2' : 'i-lucide-send'"
        :color="danger ? 'error' : 'primary'"
        @click="emit('close', true)"
      />
    </template>
  </UModal>
</template>
