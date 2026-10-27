<script setup lang="ts">
const { api } = useManager()

const users = ref<AssignedUser[]>([])
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    users.value = (await api<{ data: AssignedUser[] }>('/api/business/users')).data
  }
  catch (failure) {
    error.value = (failure as Error).message
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="space-y-4 rounded-xl border border-default bg-default p-5">
    <h2 class="flex items-center gap-1.5 font-semibold text-highlighted">
      {{ t('business.users.title') }}
      <UTooltip :text="t('business.users.hint')">
        <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="t('business.users.hint')" />
      </UTooltip>
    </h2>

    <div v-if="loading" class="space-y-3">
      <USkeleton v-for="n in 3" :key="n" class="h-10 w-full" />
    </div>
    <UAlert v-else-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" />
    <p v-else-if="!users.length" class="text-sm text-muted">
      {{ t('business.users.empty') }}
    </p>
    <ul v-else class="divide-y divide-default text-sm">
      <li v-for="user in users" :key="user.id" class="space-y-1.5 py-3 first:pt-0 last:pb-0">
        <p class="flex items-center gap-2">
          <UIcon :name="user.user_type?.includes('SYSTEM') ? 'i-lucide-bot' : 'i-lucide-user'" class="size-4 text-dimmed" />
          <span class="font-medium text-highlighted">{{ user.name || user.id }}</span>
          <span class="text-xs text-muted">{{ user.user_type ? tOr(`business.users.${user.user_type}`, humanize(user.user_type)) : '' }}</span>
        </p>
        <div class="flex flex-wrap gap-1">
          <UBadge v-for="task in user.tasks ?? []" :key="task" color="neutral" variant="subtle" size="sm" :label="tOr(`business.tasks.${task}`, humanize(task))" />
        </div>
      </li>
    </ul>
  </section>
</template>
