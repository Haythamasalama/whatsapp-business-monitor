<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })

const { api, loadAccounts } = useManager()
const toast = useToast()

const content = ref('')
const fileName = ref('')
const passphrase = ref('')
const replace = ref(false)
const importing = ref(false)
const error = ref<string | null>(null)
const result = ref<ImportResult | null>(null)

watch(open, () => {
  content.value = ''
  fileName.value = ''
  passphrase.value = ''
  replace.value = false
  error.value = null
  result.value = null
})

async function pick(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]

  content.value = file ? await file.text() : ''
  fileName.value = file?.name ?? ''
  error.value = null
}

async function run(): Promise<void> {
  importing.value = true
  error.value = null

  try {
    result.value = await api<ImportResult>('/api/accounts/import', {
      method: 'POST',
      scoped: false,
      body: { file: content.value, passphrase: passphrase.value, replace: replace.value },
    })

    const changed = result.value.added.length + result.value.replaced.length

    toast.add({ title: changed ? t('transfer.imported', { n: changed }) : t('transfer.importedNone'), color: changed ? 'success' : 'warning', icon: 'i-lucide-check' })

    if (changed) {
      await loadAccounts()
    }
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    importing.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="t('transfer.importTitle')" :ui="{ footer: 'justify-end' }">
    <template #body>
      <form id="import-form" class="space-y-4" autocomplete="off" @submit.prevent="run">
        <UFormField :label="t('transfer.file')">
          <label class="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-accented px-4 py-3 text-sm transition-colors hover:bg-elevated/60">
            <UIcon name="i-lucide-file-key-2" class="size-5 shrink-0 text-muted" />
            <span class="min-w-0 flex-1 truncate" :class="fileName ? 'text-highlighted' : 'text-muted'">{{ fileName || t('transfer.choose') }}</span>
            <input type="file" accept=".json,application/json" class="sr-only" @change="pick">
          </label>
        </UFormField>
        <UFormField :label="t('transfer.passphrase')">
          <UInput v-model="passphrase" type="password" icon="i-lucide-key-round" class="w-full" />
        </UFormField>
        <UCheckbox v-model="replace" :label="t('transfer.replace')" />

        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" />

        <ul v-if="result" class="space-y-1.5 rounded-lg bg-muted px-4 py-3 text-sm">
          <li v-if="result.added.length" class="flex gap-2">
            <UIcon name="i-lucide-plus" class="mt-0.5 size-4 shrink-0 text-success" />
            <span>{{ t('transfer.added') }}: <bdi dir="ltr" class="font-mono text-xs">{{ result.added.join(', ') }}</bdi></span>
          </li>
          <li v-if="result.replaced.length" class="flex gap-2">
            <UIcon name="i-lucide-refresh-cw" class="mt-0.5 size-4 shrink-0 text-info" />
            <span>{{ t('transfer.replaced') }}: <bdi dir="ltr" class="font-mono text-xs">{{ result.replaced.join(', ') }}</bdi></span>
          </li>
          <li v-for="skip in result.skipped" :key="skip.id" class="flex gap-2 text-muted">
            <UIcon name="i-lucide-minus" class="mt-0.5 size-4 shrink-0" />
            <span><bdi dir="ltr" class="font-mono text-xs">{{ skip.id }}</bdi>: {{ skip.reason === 'exists' ? t('transfer.skippedExists') : t('transfer.skippedInvalid') }}</span>
          </li>
        </ul>
      </form>
    </template>

    <template #footer>
      <UButton v-if="result" :label="t('transfer.done')" color="neutral" variant="outline" @click="open = false" />
      <UButton v-else type="submit" form="import-form" :label="t('transfer.import')" icon="i-lucide-upload" :loading="importing" :disabled="!content || !passphrase" />
    </template>
  </UModal>
</template>
