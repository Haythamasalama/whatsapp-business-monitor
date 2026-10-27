<script setup lang="ts">
const { appName, loadApp } = useSession()

const form = reactive({ username: '', password: '' })
const signingIn = ref(false)
const error = ref<string | null>(null)

async function signIn(): Promise<void> {
  signingIn.value = true
  error.value = null

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'X-Requested-With': 'whatsapp-manager', 'X-Locale': locale.value },
      body: { ...form },
    })
    await loadApp()
  }
  catch (e) {
    error.value = (e as { data?: { data?: { error?: { message?: string } } } }).data?.data?.error?.message ?? (e as Error).message
  }
  finally {
    signingIn.value = false
  }
}
</script>

<template>
  <AuthLayout :title="appName" :subtitle="t('auth.signInTitle')">
    <form class="space-y-4" @submit.prevent="signIn">
      <UFormField :label="t('auth.username')">
        <UInput v-model.trim="form.username" autocomplete="username" icon="i-lucide-user" class="w-full" autofocus required />
      </UFormField>
      <UFormField :label="t('auth.password')">
        <UInput v-model="form.password" type="password" autocomplete="current-password" icon="i-lucide-key-round" class="w-full" required />
      </UFormField>

      <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error" />

      <UButton type="submit" :label="t('auth.signIn')" icon="i-lucide-log-in" block :loading="signingIn" :disabled="!form.username || !form.password" />
    </form>
  </AuthLayout>
</template>
