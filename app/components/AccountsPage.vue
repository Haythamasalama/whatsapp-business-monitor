<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

const emit = defineEmits<{ add: [], edit: [account: AccountSummary], open: [id: string], export: [], import: [] }>()

const { accounts, storage } = useManager()

// Isolated as left to right, so the path reads the same inside an Arabic sentence.
const storedIn = computed(() => t('manage.storedIn', { dir: `\u2066${storage.value}\u2069` }))
const deleteAccount = useDeleteAccount()

const columns = computed<TableColumn<AccountSummary>[]>(() => [
  { id: 'account', header: t('overview.account'), meta: { class: { td: 'w-full min-w-56' } } },
  { id: 'business', header: t('accounts.business'), meta: { class: { th: 'hidden md:table-cell', td: 'hidden md:table-cell' } } },
  { id: 'id', header: t('accountForm.id'), meta: { class: { th: 'hidden lg:table-cell', td: 'hidden lg:table-cell' } } },
  { id: 'status', header: t('details.status') },
  { id: 'actions', header: () => h('span', { class: 'sr-only' }, t('templates.actions')), meta: { class: { td: 'w-0' } } },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold text-highlighted">
          {{ t('nav.accounts') }}
        </h1>
        <p class="mt-1 flex items-center gap-1.5 text-sm text-muted">
          {{ t('overview.accountCount', { n: accounts.length }) }}
          <UTooltip :text="storedIn">
            <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="storedIn" />
          </UTooltip>
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <UButton :label="t('transfer.import')" icon="i-lucide-upload" color="neutral" variant="outline" @click="emit('import')" />
        <UButton :label="t('transfer.export')" icon="i-lucide-download" color="neutral" variant="outline" :disabled="!accounts.length" @click="emit('export')" />
        <UButton :label="t('accounts.add')" icon="i-lucide-plus" @click="emit('add')" />
      </div>
    </div>

    <section class="rounded-xl border border-default bg-default">
      <UTable
        :data="accounts"
        :columns="columns"
        :empty="t('accounts.none')"
        :ui="{ th: 'py-2.5 text-xs font-medium whitespace-nowrap text-muted', td: 'py-3.5' }"
      >
        <template #account-cell="{ row }">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar
              :src="row.original.photo ?? undefined"
              :alt="accountTitle(row.original)"
              icon="i-lucide-message-circle"
              class="size-9 shrink-0"
              :ui="{ root: 'bg-primary/10', icon: 'size-4.5 text-primary' }"
            />
            <div class="min-w-0">
              <p class="truncate font-medium text-highlighted">
                {{ accountTitle(row.original) }}
              </p>
              <p class="truncate text-xs text-muted">
                <bdi dir="ltr">{{ row.original.phones.map(phone => phone.display_phone_number).join(t('common.listSeparator')) || '—' }}</bdi>
              </p>
            </div>
          </div>
        </template>

        <template #business-cell="{ row }">
          <bdi dir="ltr" class="font-mono text-xs text-toned">{{ row.original.waba_id || '—' }}</bdi>
        </template>

        <template #id-cell="{ row }">
          <bdi dir="ltr" class="font-mono text-xs text-toned">{{ row.original.id }}</bdi>
        </template>

        <template #status-cell="{ row }">
          <UTooltip v-if="row.original.error" :text="row.original.error">
            <UBadge color="error" variant="subtle" icon="i-lucide-circle-alert" :label="t('manage.unreachable')" class="rounded-full whitespace-nowrap" />
          </UTooltip>
          <UBadge v-else color="success" variant="subtle" icon="i-lucide-circle-check" :label="t('manage.connected')" class="rounded-full whitespace-nowrap" />
        </template>

        <template #actions-cell="{ row }">
          <div class="flex items-center justify-end gap-0.5">
            <UTooltip :text="t('overview.open')">
              <UButton icon="i-lucide-eye" color="neutral" variant="ghost" size="sm" :aria-label="t('overview.open')" @click="emit('open', row.original.id)" />
            </UTooltip>
            <UTooltip :text="t('accounts.edit')">
              <UButton icon="i-lucide-pencil" color="neutral" variant="ghost" size="sm" :aria-label="t('accounts.edit')" @click="emit('edit', row.original)" />
            </UTooltip>
            <UTooltip :text="t('accountForm.delete')">
              <UButton icon="i-lucide-trash-2" color="error" variant="ghost" size="sm" :aria-label="t('accountForm.delete')" @click="deleteAccount(row.original)" />
            </UTooltip>
          </div>
        </template>
      </UTable>
    </section>
  </div>
</template>
