<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const { api, accounts } = useManager()
const toast = useToast()

const password = ref('')
const passphrase = ref('')
const confirmation = ref('')
const exporting = ref(false)
const error = ref<string | null>(null)

const MIN = 8
const mismatch = computed(() => Boolean(confirmation.value) && confirmation.value !== passphrase.value)
const ready = computed(() => password.value.length > 0 && passphrase.value.length >= MIN && confirmation.value === passphrase.value)

watch(open, () => {
  password.value = ''
  passphrase.value = ''
  confirmation.value = ''
  error.value = null
})

function download(content: string, name: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
  const link = Object.assign(document.createElement('a'), { href: url, download: name })

  link.click()
  URL.revokeObjectURL(url)
}

async function save(): Promise<void> {
  exporting.value = true
  error.value = null

  try {
    const file = await api<Record<string, unknown>>('/api/accounts/export', { method: 'POST', scoped: false, body: { password: password.value, passphrase: passphrase.value } })

    download(JSON.stringify(file, null, 2), `whatsapp-accounts-${new Date().toISOString().slice(0, 10)}.json`)
    toast.add({ title: t('transfer.exported', { n: accounts.value.length }), color: 'success', icon: 'i-lucide-check' })
    open.value = false
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    exporting.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="t('transfer.exportTitle')" :ui="{ footer: 'justify-end' }">
    <template #body>
      <form id="export-form" class="space-y-4" autocomplete="off" @submit.prevent="save">
        <UAlert color="info" variant="subtle" icon="i-lucide-shield-check" :description="t('transfer.exportNote', { n: accounts.length })" />
        <UFormField :label="t('transfer.exportPassword')">
          <UInput v-model="password" type="password" autocomplete="current-password" icon="i-lucide-lock" class="w-full" autofocus />
        </UFormField>
        <UFormField>
          <template #label>
            <FieldLabel :label="t('transfer.passphrase')" :hint="t('transfer.passphraseHint', { n: MIN })" />
          </template>
          <UInput v-model="passphrase" type="password" icon="i-lucide-key-round" class="w-full" />
        </UFormField>
        <UFormField :label="t('transfer.confirm')" :error="mismatch ? t('transfer.mismatch') : undefined">
          <UInput v-model="confirmation" type="password" icon="i-lucide-key-round" class="w-full" />
        </UFormField>
        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" />
      </form>
    </template>

    <template #footer>
      <UButton type="submit" form="export-form" :label="t('transfer.download')" icon="i-lucide-download" :loading="exporting" :disabled="!ready" />
    </template>
  </UModal>
</template>
