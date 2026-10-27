<script setup lang="ts">
const emit = defineEmits<{ add: [], edit: [account: AccountSummary] }>()

const { accounts, accountId, switchAccount } = useManager()
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between px-2">
      <p class="text-xs font-semibold text-highlighted">
        حسابات واتساب
      </p>
      <UButton label="إضافة" icon="i-lucide-plus" variant="link" size="xs" class="px-0" @click="emit('add')" />
    </div>

    <ul class="space-y-1">
      <li
        v-for="account in accounts"
        :key="account.id"
        class="group flex items-center gap-1 rounded-lg pe-1 transition-colors hover:bg-elevated/70"
        :class="account.id === accountId ? 'bg-elevated' : ''"
      >
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-3 px-2 py-2 text-start"
          :aria-current="account.id === accountId ? 'true' : undefined"
          @click="switchAccount(account.id)"
        >
          <span class="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
            <UIcon name="i-lucide-message-circle" class="size-4.5" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-highlighted">{{ accountTitle(account) }}</span>
            <span class="block truncate text-xs text-muted">
              <bdi dir="ltr">{{ account.phones.map(phone => phone.display_phone_number).join('، ') || account.waba_id }}</bdi>
            </span>
          </span>
          <UTooltip v-if="account.error" :text="account.error">
            <UIcon name="i-lucide-circle-alert" class="size-4 text-error" />
          </UTooltip>
        </button>
        <UTooltip text="تعديل الحساب">
          <UButton
            icon="i-lucide-pencil"
            color="neutral"
            variant="ghost"
            size="xs"
            aria-label="تعديل الحساب"
            class="opacity-60 group-hover:opacity-100 focus-visible:opacity-100"
            @click="emit('edit', account)"
          />
        </UTooltip>
      </li>
    </ul>

    <p v-if="!accounts.length" class="px-2 text-xs text-muted">
      لم يُضَف حساب بعد.
    </p>
  </div>
</template>
