<script setup lang="ts">
const { loadApp } = useSession()

const form = reactive({ instance_name: '', public_url: '', username: '', password: '', confirmation: '' })
const saving = ref(false)
const error = ref<string | null>(null)

const mismatch = computed(() => Boolean(form.confirmation) && form.confirmation !== form.password)
const ready = computed(() => form.username.trim().length >= 3 && form.password.length >= 8 && form.confirmation === form.password)

onMounted(() => {
  form.public_url = window.location.origin
})

async function finish(): Promise<void> {
  saving.value = true
  error.value = null

  try {
    await $fetch('/api/setup', {
      method: 'POST',
      headers: { 'X-Requested-With': 'whatsapp-manager', 'X-Locale': locale.value },
      body: { instance_name: form.instance_name, public_url: form.public_url, default_locale: locale.value, username: form.username, password: form.password },
    })
    await loadApp()
  }
  catch (e) {
    error.value = (e as { data?: { data?: { error?: { message?: string } } } }).data?.data?.error?.message ?? (e as Error).message
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <AuthLayout :title="t('setup.title')" :subtitle="t('setup.subtitle')">
    <form class="space-y-4" autocomplete="off" @submit.prevent="finish">
      <UFormField>
        <template #label>
          <FieldLabel :label="t('settings.name')" :hint="t('hints.name')" />
        </template>
        <UInput v-model="form.instance_name" :placeholder="t('brand.name')" maxlength="60" class="w-full" />
      </UFormField>
      <UFormField>
        <template #label>
          <FieldLabel :label="t('settings.url')" :hint="t('settings.urlHelp')" />
        </template>
        <UInput v-model.trim="form.public_url" placeholder="https://wa.example.com" icon="i-lucide-link" class="w-full" />
      </UFormField>

      <USeparator :label="t('setup.admin')" />

      <UFormField :label="t('auth.username')" required>
        <UInput v-model.trim="form.username" autocomplete="username" icon="i-lucide-user" class="w-full" required />
      </UFormField>
      <UFormField required>
        <template #label>
          <FieldLabel :label="t('auth.password')" :hint="t('transfer.passphraseHint', { n: 8 })" />
        </template>
        <UInput v-model="form.password" type="password" autocomplete="new-password" icon="i-lucide-key-round" class="w-full" required />
      </UFormField>
      <UFormField :label="t('transfer.confirm')" :error="mismatch ? t('transfer.mismatch') : undefined" required>
        <UInput v-model="form.confirmation" type="password" autocomplete="new-password" icon="i-lucide-key-round" class="w-full" required />
      </UFormField>

      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" class="whitespace-pre-line" />

      <UButton type="submit" :label="t('setup.finish')" icon="i-lucide-check" block :loading="saving" :disabled="!ready" />
    </form>
  </AuthLayout>
</template>
