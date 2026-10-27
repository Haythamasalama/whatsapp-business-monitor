<script setup lang="ts">
const props = defineProps<{ phone: string, data: PhoneSettings['qr'] }>()
const emit = defineEmits<{ changed: [] }>()

const { run, busy } = usePhoneAction(() => props.phone)
const { api } = useManager()
const copy = useCopy()
const toast = useToast()

const message = ref('')
const editing = ref<string | null>(null)
const editText = ref('')
const problems = computed(() => (message.value ? qrProblems(message.value).map(key => tOr(key, key)) : []))

async function create(): Promise<void> {
  if (await run({ path: '/api/business/qr', body: { prefilled_message: message.value.trim() }, confirm: t('business.qr.createConfirm'), done: t('business.qr.created') })) {
    message.value = ''
    emit('changed')
  }
}

async function saveEdit(code: string): Promise<void> {
  if (await run({ path: '/api/business/qr', body: { code, prefilled_message: editText.value.trim() }, confirm: t('business.qr.editConfirm'), done: t('business.qr.saved') })) {
    editing.value = null
    emit('changed')
  }
}

async function remove(code: string): Promise<void> {
  if (await run({ path: '/api/business/qr', method: 'DELETE', query: { code }, confirm: t('business.qr.deleteConfirm'), danger: true, done: t('business.qr.deleted') })) {
    emit('changed')
  }
}

// Meta hosts the image; the server only asks for its link, so the token never reaches the page.
async function download(code: string, format: 'PNG' | 'SVG'): Promise<void> {
  try {
    const { url } = await api<{ url: string }>(`/api/business/qr-image?phone=${props.phone}&code=${code}&format=${format}`)
    window.open(url, '_blank', 'noopener')
  }
  catch (error) {
    toast.add({ title: t('common.failed'), description: (error as Error).message, color: 'error' })
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      {{ t('business.qr.intro') }}
    </p>
    <UAlert v-if="data.error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorText(data.error)" />

    <UFormField>
      <template #label>
        <FieldLabel :label="t('business.qr.message')" :hint="t('business.qr.messageHint')" />
      </template>
      <div class="flex flex-wrap items-start gap-2">
        <UInput v-model="message" :maxlength="QR_MESSAGE_MAX" class="min-w-0 flex-1" dir="auto" />
        <UButton :label="t('business.qr.create')" icon="i-lucide-qr-code" :loading="busy" :disabled="!message.trim() || problems.length > 0" @click="create" />
      </div>
    </UFormField>

    <p v-if="!data.error && !data.data?.length" class="text-sm text-muted">
      {{ t('business.qr.empty') }}
    </p>
    <ul v-else class="divide-y divide-default rounded-xl border border-default">
      <li v-for="qr in data.data" :key="qr.code" class="space-y-2 p-3">
        <div v-if="editing === qr.code" class="flex flex-wrap gap-2">
          <UInput v-model="editText" :maxlength="QR_MESSAGE_MAX" class="min-w-0 flex-1" dir="auto" />
          <UButton :label="t('business.qr.save')" size="sm" :loading="busy" :disabled="qrProblems(editText).length > 0" @click="saveEdit(qr.code)" />
          <UButton :label="t('common.cancel')" color="neutral" variant="ghost" size="sm" @click="editing = null" />
        </div>
        <p v-else class="text-sm text-highlighted" dir="auto">
          {{ qr.prefilled_message }}
        </p>
        <div class="flex flex-wrap items-center gap-1">
          <bdi dir="ltr" class="me-auto font-mono text-xs text-muted">{{ qr.deep_link_url }}</bdi>
          <UTooltip :text="t('business.qr.copyLink')">
            <UButton icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" :aria-label="t('business.qr.copyLink')" @click="copy(qr.deep_link_url)" />
          </UTooltip>
          <UButton :label="t('business.qr.png')" icon="i-lucide-download" color="neutral" variant="ghost" size="xs" @click="download(qr.code, 'PNG')" />
          <UButton :label="t('business.qr.svg')" icon="i-lucide-download" color="neutral" variant="ghost" size="xs" @click="download(qr.code, 'SVG')" />
          <UTooltip :text="t('business.qr.edit')">
            <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="xs" :aria-label="t('business.qr.edit')" @click="editing = qr.code; editText = qr.prefilled_message" />
          </UTooltip>
          <UTooltip :text="t('business.qr.delete')">
            <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="xs" :aria-label="t('business.qr.delete')" @click="remove(qr.code)" />
          </UTooltip>
        </div>
      </li>
    </ul>
  </div>
</template>
