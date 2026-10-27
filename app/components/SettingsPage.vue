<script setup lang="ts">
const emit = defineEmits<{ export: [], import: [] }>()

const { api, accounts } = useManager()
const { info, loadApp, signOut } = useSession()
const toast = useToast()
const { version } = useRuntimeConfig().public

const settings = ref<SettingsInfo | null>(null)
const general = reactive({ instance_name: '', public_url: '', default_locale: 'ar' as Locale })
const password = reactive({ current: '', next: '', confirmation: '' })
const autoUpdate = ref(false)
const saving = ref<'general' | 'updates' | 'password' | null>(null)
const error = ref<{ section: string, message: string } | null>(null)

const localeItems = [{ label: 'العربية', value: 'ar' }, { label: 'English', value: 'en' }]
const mismatch = computed(() => Boolean(password.confirmation) && password.confirmation !== password.next)

async function load(): Promise<void> {
  const [loaded, versionInfo] = await Promise.all([
    api<SettingsInfo>('/api/settings', { scoped: false }),
    api<VersionInfo>('/api/version', { scoped: false }).catch(() => null),
  ])

  settings.value = loaded
  autoUpdate.value = versionInfo?.autoUpdate ?? false
  Object.assign(general, { instance_name: loaded.instance_name, public_url: loaded.public_url, default_locale: loaded.default_locale })
}

async function save(section: 'general' | 'updates', body: Record<string, unknown>): Promise<void> {
  saving.value = section
  error.value = null

  try {
    await api('/api/settings', { method: 'POST', scoped: false, body })
    await Promise.all([load(), loadApp()])
    toast.add({ title: t('settings.saved'), color: 'success', icon: 'i-lucide-check' })
  }
  catch (e) {
    error.value = { section, message: (e as Error).message }
  }
  finally {
    saving.value = null
  }
}

async function changePassword(): Promise<void> {
  saving.value = 'password'
  error.value = null

  try {
    await api('/api/auth/password', { method: 'POST', scoped: false, body: { current: password.current, next: password.next } })
    Object.assign(password, { current: '', next: '', confirmation: '' })
    toast.add({ title: t('settings.passwordChanged'), color: 'success', icon: 'i-lucide-check' })
  }
  catch (e) {
    error.value = { section: 'password', message: (e as Error).message }
  }
  finally {
    saving.value = null
  }
}

onMounted(load)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-highlighted">
        {{ t('nav.settings') }}
      </h1>
      <p class="mt-1 text-sm text-muted">
        {{ t('settings.signedInAs') }} <bdi dir="ltr" class="font-medium text-toned">{{ info?.user?.username }}</bdi>
      </p>
    </div>

    <div v-if="settings" class="grid gap-4 lg:grid-cols-2">
      <section class="space-y-4 rounded-xl border border-default bg-default p-5">
        <h2 class="font-semibold text-highlighted">
          {{ t('settings.general') }}
        </h2>
        <UFormField>
          <template #label>
            <FieldLabel :label="t('settings.name')" :hint="t('hints.name')" />
          </template>
          <UInput v-model="general.instance_name" :placeholder="t('brand.name')" maxlength="60" class="w-full" />
        </UFormField>
        <UFormField>
          <template #label>
            <FieldLabel :label="t('settings.url')" :hint="t('settings.urlHelp')" />
          </template>
          <UInput v-model.trim="general.public_url" placeholder="https://wa.example.com" icon="i-lucide-link" class="w-full" />
        </UFormField>
        <UFormField>
          <template #label>
            <FieldLabel :label="t('settings.defaultLanguage')" :hint="t('settings.defaultLanguageHelp')" />
          </template>
          <USelect v-model="general.default_locale" :items="localeItems" class="w-full" />
        </UFormField>
        <UAlert v-if="error?.section === 'general'" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error.message" />
        <UButton :label="t('common.save')" :loading="saving === 'general'" @click="save('general', { ...general })" />
      </section>

      <section class="space-y-4 rounded-xl border border-default bg-default p-5">
        <h2 class="font-semibold text-highlighted">
          {{ t('settings.updates') }}
        </h2>
        <dl class="divide-y divide-default rounded-lg border border-default text-sm">
          <div class="flex items-center justify-between gap-3 px-4 py-2.5">
            <dt class="text-muted">
              {{ t('settings.version') }}
            </dt>
            <dd class="font-mono text-highlighted">
              v{{ version }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-3 px-4 py-2.5">
            <dt class="text-muted">
              {{ t('settings.autoUpdate') }}
            </dt>
            <dd>
              <UBadge :color="autoUpdate ? 'success' : 'neutral'" variant="subtle" :label="autoUpdate ? t('settings.autoUpdateOn') : t('settings.autoUpdateOff')" class="rounded-full" />
            </dd>
          </div>
        </dl>
        <USwitch
          :model-value="Boolean(settings?.update_check && !settings?.update_check_forced_off)"
          :disabled="settings?.update_check_forced_off || saving === 'updates'"
          @update:model-value="(value) => save('updates', { update_check: value })"
        >
          <template #label>
            <FieldLabel :label="t('settings.updateCheck')" :hint="settings?.update_check_forced_off ? t('settings.updateCheckForced') : t('settings.updateCheckHelp')" />
          </template>
        </USwitch>
      </section>

      <section class="space-y-4 rounded-xl border border-default bg-default p-5">
        <h2 class="font-semibold text-highlighted">
          {{ t('settings.security') }}
        </h2>
        <form class="space-y-4" autocomplete="off" @submit.prevent="changePassword">
          <UFormField :label="t('settings.currentPassword')">
            <UInput v-model="password.current" type="password" autocomplete="current-password" class="w-full" />
          </UFormField>
          <UFormField>
            <template #label>
              <FieldLabel :label="t('settings.newPassword')" :hint="t('transfer.passphraseHint', { n: 8 })" />
            </template>
            <UInput v-model="password.next" type="password" autocomplete="new-password" class="w-full" />
          </UFormField>
          <UFormField :label="t('settings.confirmPassword')" :error="mismatch ? t('settings.passwordMismatch') : undefined">
            <UInput v-model="password.confirmation" type="password" autocomplete="new-password" class="w-full" />
          </UFormField>
          <UAlert v-if="error?.section === 'password'" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="error.message" />
          <div class="flex flex-wrap justify-between gap-2">
            <UButton type="submit" :label="t('settings.changePassword')" :loading="saving === 'password'" :disabled="!password.current || password.next.length < 8 || password.next !== password.confirmation" />
            <UButton :label="t('settings.signOut')" icon="i-lucide-log-out" color="neutral" variant="ghost" @click="signOut()" />
          </div>
        </form>
      </section>

      <section class="space-y-4 rounded-xl border border-default bg-default p-5">
        <h2 class="font-semibold text-highlighted">
          {{ t('settings.backup') }}
        </h2>
        <p class="text-sm text-muted">
          {{ t('settings.backupHelp') }}
        </p>
        <div class="flex flex-wrap gap-2">
          <UButton :label="t('transfer.export')" icon="i-lucide-download" color="neutral" variant="outline" :disabled="!accounts.length" @click="emit('export')" />
          <UButton :label="t('transfer.import')" icon="i-lucide-upload" color="neutral" variant="outline" @click="emit('import')" />
        </div>
        <p class="flex items-center gap-1.5 text-xs text-muted">
          <UIcon name="i-lucide-database" class="size-3.5 shrink-0" />
          {{ t('settings.storage') }}
          <bdi dir="ltr" class="truncate font-mono">{{ settings?.storage }}</bdi>
        </p>
      </section>
    </div>

    <div v-else class="space-y-4">
      <USkeleton v-for="n in 3" :key="n" class="h-40 rounded-xl" />
    </div>
  </div>
</template>
