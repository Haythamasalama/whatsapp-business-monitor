<script setup lang="ts">
const { accounts, accountId, screen, switchAccount } = useManager()

const isOpen = (id: string) => screen.value === 'account' && accountId.value === id
</script>

<template>
  <div>
    <p class="mb-2 px-2 text-xs font-semibold text-highlighted">
      {{ t('accounts.title') }}
    </p>

    <ul class="space-y-1">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="flex items-center rounded-lg transition-colors hover:bg-elevated/70"
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
      </li>
    </ul>

    <p v-if="!accounts.length" class="px-2 text-xs text-muted">
      {{ t('accounts.none') }}
    </p>
  </div>
</template>
