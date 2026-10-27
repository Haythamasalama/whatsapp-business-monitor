<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ parsed: [drafts: Draft[]] }>()

const toast = useToast()
const text = ref('')

const placeholder = [
  'order_confirmation',
  '',
  '----------------',
  '',
  'النص العربي مع {{1}}',
  '',
  '----------------',
  '',
  'English text with {{1}}',
].join('\n')

function parse(): void {
  const drafts = parseDrafts(text.value)

  if (!drafts.length) {
    toast.add({ title: 'لم يُعثر على قالب في النص', color: 'warning' })

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
    title="إنشاء أو تحديث من نص"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UTextarea v-model="text" :placeholder="placeholder" dir="auto" :rows="14" class="w-full" autofocus />
    </template>

    <template #footer>
      <UButton label="متابعة" :disabled="!text.trim()" @click="parse" />
    </template>
  </UModal>
</template>
