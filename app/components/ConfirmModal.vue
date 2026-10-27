<script setup lang="ts">
defineProps<{ title: string, description?: string, confirmLabel?: string }>()

const emit = defineEmits<{ close: [value: boolean] }>()
</script>

<template>
  <UModal :title="title" :description="description" :close="false" :dismissible="false" :ui="{ footer: 'justify-end' }">
    <template #footer>
      <UButton :label="t('common.cancel')" color="neutral" variant="outline" @click="emit('close', false)" />
      <UButton :label="confirmLabel ?? t('common.continue')" icon="i-lucide-send" @click="emit('close', true)" />
    </template>
  </UModal>
</template>
