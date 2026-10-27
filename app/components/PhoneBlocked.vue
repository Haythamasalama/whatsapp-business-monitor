<script setup lang="ts">
const props = defineProps<{ phone: string, data: PhoneSettings['blocked'] }>()
const emit = defineEmits<{ changed: [] }>()

const { run, busy } = usePhoneAction(() => props.phone)

const numbers = ref('')
const failed = ref<{ input: string, reason: string }[]>([])
const parsed = computed(() => normalizeUsers(numbers.value.split(/[\n,]/)))
const problems = computed(() => (numbers.value.trim() ? parsed.value.problems.map(key => tOr(key, key)) : []))

async function block(): Promise<void> {
  const users = parsed.value.users
  const result = await run<{ done: number, failed: { input: string, reason: string }[] }>({
    path: '/api/business/block',
    body: { action: 'block', users },
    confirm: t('business.blocked.confirmBlock', { n: users.length }),
    done: t('business.blocked.done', { n: users.length }),
  })

  if (result) {
    failed.value = result.failed
    numbers.value = result.failed.map(entry => entry.input).join('\n')
    emit('changed')
  }
}

async function unblock(user: BlockedUser): Promise<void> {
  const number = user.wa_id ? `+${user.wa_id}` : user.input ?? ''

  if (await run({ path: '/api/business/block', body: { action: 'unblock', users: [number] }, confirm: t('business.blocked.confirmUnblock', { number }), done: t('business.blocked.done', { n: 1 }) })) {
    emit('changed')
  }
}
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      {{ t('business.blocked.intro') }}
    </p>
    <UAlert color="info" variant="subtle" icon="i-lucide-clock" :description="t('business.blocked.rule')" />
    <UAlert v-if="data.error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorText(data.error)" />

    <UFormField>
      <template #label>
        <FieldLabel :label="t('business.blocked.numbers')" :hint="t('business.blocked.numbersHint')" />
      </template>
      <UTextarea v-model="numbers" :rows="3" class="w-full font-mono" placeholder="+15550100123" />
    </UFormField>
    <p v-for="problem in problems" :key="problem" class="text-sm text-error">
      {{ problem }}
    </p>
    <UButton :label="t('business.blocked.block')" icon="i-lucide-ban" color="error" variant="outline" :loading="busy" :disabled="!numbers.trim() || problems.length > 0" @click="block" />

    <div v-if="failed.length" class="rounded-lg border border-default bg-muted p-3 text-sm">
      <p class="font-medium text-toned">
        {{ t('business.blocked.failed') }}
      </p>
      <ul class="mt-1 space-y-0.5">
        <li v-for="entry in failed" :key="entry.input" class="flex flex-wrap gap-2">
          <bdi dir="ltr" class="font-mono text-highlighted">{{ entry.input }}</bdi>
          <span class="text-muted">{{ entry.reason }}</span>
        </li>
      </ul>
    </div>

    <p v-if="!data.error && !data.data?.length" class="text-sm text-muted">
      {{ t('business.blocked.empty') }}
    </p>
    <ul v-else class="divide-y divide-default rounded-xl border border-default">
      <li v-for="user in data.data" :key="user.wa_id ?? user.input" class="flex items-center justify-between gap-3 px-3 py-2">
        <bdi dir="ltr" class="font-mono text-sm text-highlighted">+{{ user.wa_id ?? user.input }}</bdi>
        <UButton :label="t('business.blocked.unblock')" color="neutral" variant="ghost" size="xs" :loading="busy" @click="unblock(user)" />
      </li>
    </ul>
    <p v-if="data.more" class="text-xs text-muted">
      {{ t('business.blocked.more') }}
    </p>
  </div>
</template>
