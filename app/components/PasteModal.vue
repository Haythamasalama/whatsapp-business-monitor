<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ parsed: [drafts: Draft[]] }>()

const toast = useToast()
const text = ref('')

const placeholder = computed(() => toText([{
  name: 'order_confirmation',
  category: 'UTILITY',
  languages: {
    ar: { header: '', body: 'تم تأكيد طلبك رقم {{1}}.', footer: '', examples: ['10482'] },
    en: { header: '', body: 'Your order {{1}} is confirmed.', footer: '', examples: ['10482'] },
  },
}]))

function parse(): void {
  const drafts = parseDrafts(text.value)

  if (!drafts.length) {
    toast.add({ title: t('paste.nothingFound'), color: 'warning' })

    return
  }

  emit('parsed', drafts)
  text.value = ''
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('templates.paste')"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UTextarea v-model="text" :placeholder="placeholder" :dir="text ? 'auto' : undefined" :rows="14" class="w-full" autofocus />
    </template>

    <template #footer>
      <UButton :label="t('common.continue')" :disabled="!text.trim()" @click="parse" />
    </template>
  </UModal>
</template>
