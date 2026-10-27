<script setup lang="ts">
const emit = defineEmits<{ add: [], edit: [account: AccountSummary], export: [], import: [] }>()

const { accounts, accountId, screen, switchAccount } = useManager()

const isOpen = (id: string) => screen.value === 'account' && accountId.value === id

const transferItems = computed(() => [
  { label: t('transfer.export'), icon: 'i-lucide-download', disabled: !accounts.value.length, onSelect: () => emit('export') },
  { label: t('transfer.import'), icon: 'i-lucide-upload', onSelect: () => emit('import') },
])
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between px-2">
      <p class="text-xs font-semibold text-highlighted">
        {{ t('accounts.title') }}
      </p>
      <div class="flex items-center gap-1">
        <UButton :label="t('common.add')" icon="i-lucide-plus" variant="link" size="xs" class="px-0" @click="emit('add')" />
        <UDropdownMenu :items="transferItems">
          <UButton icon="i-lucide-ellipsis" color="neutral" variant="ghost" size="xs" :aria-label="t('transfer.menu')" />
        </UDropdownMenu>
      </div>
    </div>

    <ul class="space-y-1">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="group flex items-center gap-1 rounded-lg pe-1 transition-colors hover:bg-elevated/70"
        :class="isOpen(account.id) ? 'bg-elevated' : ''"
      >
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-start"
          :aria-current="isOpen(account.id) ? 'page' : undefined"
          @click="switchAccount(account.id)"
        >
          <UAvatar
            :src="account.photo ?? undefined"
            :alt="accountTitle(account)"
            icon="i-lucide-message-circle"
            class="size-9 shrink-0"
            :ui="{ root: 'bg-primary/10', icon: 'size-4.5 text-primary' }"
          />
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-highlighted">{{ accountTitle(account) }}</span>
            <span class="block truncate text-xs text-muted">
              <bdi dir="ltr">{{ account.phones.map(phone => phone.display_phone_number).join(t('common.listSeparator')) || account.waba_id }}</bdi>
            </span>
          </span>
          <UTooltip v-if="account.error" :text="account.error">
            <UIcon name="i-lucide-circle-alert" class="size-4 text-error" />
          </UTooltip>
        </button>
        <UTooltip :text="t('accounts.edit')">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            :aria-label="t('accounts.edit')"
            class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            @click="emit('edit', account)"
          />
        </UTooltip>
      </li>
    </ul>

    <p v-if="!accounts.length" class="px-2 text-xs text-muted">
      {{ t('accounts.none') }}
    </p>
  </div>
</template>
