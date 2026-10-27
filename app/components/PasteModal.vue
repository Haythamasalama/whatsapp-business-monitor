<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{ parsed: [drafts: Draft[]] }>()

const toast = useToast()
const text = ref('')

const placeholder = [
  'الاسم: order_confirmation',
  'الفئة: إشعارات',
  '----------------',
  'اللغة: ar',
  'تم تأكيد طلبك رقم {{1}}.',
  '',
  '{{1}} = 10482',
  '----------------',
  'اللغة: en (اختياري)',
  'Your order {{1}} is confirmed.',
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
    title="إنشاء أو تحديث بكود القالب"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <UTextarea v-model="text" :placeholder="placeholder" :dir="text ? 'auto' : undefined" :rows="14" class="w-full" autofocus />
    </template>

    <template #footer>
      <UButton label="متابعة" :disabled="!text.trim()" @click="parse" />
    </template>
  </UModal>
</template>
