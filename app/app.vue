<script setup lang="ts">
import { ar, en } from '@nuxt/ui/locale'

const { status, appName, loadApp } = useSession()
const failed = ref<string | null>(null)

useHead({
  title: () => appName.value,
  htmlAttrs: { lang: () => locale.value, dir: () => (isRtl.value ? 'rtl' : 'ltr') },
  meta: [{ name: 'description', content: () => t('brand.description') }],
})

onMounted(async () => {
  try {
    await loadApp()
  }
  catch (error) {
    failed.value = (error as Error).message || t('errors.serverUnreachable')
  }
})
</script>

<template>
  <UApp :locale="locale === 'ar' ? ar : en" :toaster="{ position: 'bottom-center' }">
    <div v-if="failed" class="grid min-h-screen place-items-center bg-muted p-6">
      <UAlert color="error" variant="subtle" icon="i-lucide-circle-alert" :description="failed" class="max-w-md" />
    </div>
    <div v-else-if="status === 'loading'" class="grid min-h-screen place-items-center bg-muted">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>
    <SetupPage v-else-if="status === 'setup'" />
    <LoginPage v-else-if="status === 'login'" />
    <ManagerPage v-else />
  </UApp>
</template>
