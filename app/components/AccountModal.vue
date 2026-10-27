<script setup lang="ts">
const props = defineProps<{ account?: AccountSummary | null }>()

const open = defineModel<boolean>('open', { default: false })

const { api, loadAccounts, storage, screen } = useManager()
const toast = useToast()
const deleteAccount = useDeleteAccount()

const blank = () => ({ label: '', id: '', token: '', waba_id: '', version: 'v23.0' })
const form = reactive(blank())
const found = ref<DiscoveredAccount[] | null>(null)
const discovering = ref(false)
const saving = ref(false)
const deleting = ref(false)
const error = ref<string | null>(null)

const editing = computed(() => Boolean(props.account))
const file = computed(() => storage.value)

// Pasting a token is enough: the accounts and numbers it reaches are fetched once it looks complete.
let discoverTimer: ReturnType<typeof setTimeout> | undefined

watch(() => form.token, (token) => {
  clearTimeout(discoverTimer)

  if (!editing.value && token.length >= 20) {
    discoverTimer = setTimeout(discover, 500)
  }
})

const foundItems = computed(() => (found.value ?? []).map(account => ({
  value: account.waba_id,
  label: account.name ?? account.waba_id,
  description: [...account.phones.map(phone => phone.display_phone_number), account.waba_id].join(' · '),
})))

watch(open, (isOpen) => {
  if (!isOpen) {
    return
  }

  Object.assign(form, blank())
  found.value = null
  error.value = null

  if (props.account) {
    Object.assign(form, {
      label: accountTitle(props.account),
      id: props.account.id,
      waba_id: props.account.waba_id,
      version: props.account.version,
    })
  }
})

watch(() => form.waba_id, (waba) => {
  const name = found.value?.find(account => account.waba_id === waba)?.name

  if (name && !form.label) {
    form.label = name
  }
})

async function discover(): Promise<void> {
  discovering.value = true
  error.value = null

  try {
    const { data } = await api<{ data: DiscoveredAccount[] }>('/api/accounts/discover', {
      method: 'POST',
      scoped: false,
      body: { token: form.token, version: form.version },
    })

    found.value = data

    if (data[0]) {
      form.waba_id = data[0].waba_id
    }
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    discovering.value = false
  }
}

async function save(): Promise<void> {
  saving.value = true
  error.value = null

  try {
    const { id } = await api<{ id: string }>(editing.value ? `/api/accounts/${props.account!.id}` : '/api/accounts', {
      method: 'POST',
      scoped: false,
      body: { ...form },
    })

    open.value = false
    toast.add({ title: editing.value ? t('accountForm.saved') : t('accountForm.added'), color: 'success', icon: 'i-lucide-check' })
    await loadAccounts(screen.value === 'accounts' ? undefined : id)
  }
  catch (e) {
    error.value = (e as Error).message
  }
  finally {
    saving.value = false
  }
}

async function remove(): Promise<void> {
  deleting.value = true

  if (await deleteAccount(props.account!)) {
    open.value = false
  }

  deleting.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="editing ? t('accounts.edit') : t('accountForm.addTitle')"
    :ui="{ footer: editing ? 'justify-between' : 'justify-end' }"
  >
    <template #body>
      <form id="account-form" class="space-y-4" autocomplete="off" @submit.prevent="save">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField :label="t('accountForm.label')">
            <UInput v-model="form.label" :placeholder="t('accountForm.labelPlaceholder')" class="w-full" />
          </UFormField>
          <UFormField :label="t('accountForm.id')" :required="!editing">
            <UInput v-if="editing" :model-value="form.id" dir="ltr" class="w-full" disabled />
            <UInput
              v-else
              v-model.trim="form.id"
              :dir="form.id ? 'ltr' : undefined"
              :placeholder="t('accountForm.idPlaceholder')"
              class="w-full"
              required
            />
          </UFormField>
        </div>

        <UFormField :label="t('accountForm.token')" :required="!editing">
          <UInput
            v-model.trim="form.token"
            type="password"
            :dir="form.token ? 'ltr' : undefined"
            :placeholder="editing ? t('accountForm.tokenKeep') : 'System user token'"
            icon="i-lucide-key-round"
            class="w-full"
            :required="!editing"
            :ui="{ trailing: 'pe-1' }"
          >
            <template #trailing>
              <UButton
                :label="t('accountForm.discover')"
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="soft"
                size="xs"
                :loading="discovering"
                :disabled="form.token.length < 20"
                @click="discover"
              />
            </template>
          </UInput>
        </UFormField>

        <div v-if="discovering || found" class="space-y-2">
          <p class="text-sm font-medium text-highlighted">
            {{ t('accountForm.found') }}
          </p>
          <div v-if="discovering" class="space-y-2">
            <USkeleton class="h-14 w-full rounded-lg" />
          </div>
          <URadioGroup v-else-if="foundItems.length" v-model="form.waba_id" :items="foundItems" variant="card" />
          <p v-else class="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted">
            {{ t('accountForm.noneFound') }}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField :label="t('accountForm.waba')" :required="!editing">
            <UInput v-model.trim="form.waba_id" :dir="form.waba_id ? 'ltr' : undefined" inputmode="numeric" placeholder="WABA ID" class="w-full" :required="!editing" />
          </UFormField>
          <UFormField :label="t('accountForm.version')">
            <UInput v-model.trim="form.version" :dir="form.version ? 'ltr' : undefined" placeholder="v23.0" class="w-full" />
          </UFormField>
        </div>

        <UTooltip :text="t('accountForm.storedLocally')">
          <p class="flex min-w-0 items-center gap-2 text-xs text-muted">
            <UIcon name="i-lucide-lock" class="size-3.5 shrink-0" />
            <code dir="ltr" class="truncate font-mono text-[11px]">{{ file }}</code>
          </p>
        </UTooltip>

        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" class="whitespace-pre-line" />
      </form>
    </template>

    <template #footer>
      <UButton
        v-if="editing"
        :label="t('accountForm.delete')"
        icon="i-lucide-trash-2"
        color="error"
        variant="ghost"
        :loading="deleting"
        :disabled="saving"
        @click="remove"
      />
      <UButton type="submit" form="account-form" :label="editing ? t('common.save') : t('common.add')" :loading="saving" :disabled="deleting" />
    </template>
  </UModal>
</template>
