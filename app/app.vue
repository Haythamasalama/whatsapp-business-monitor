<script setup lang="ts">
import { ar, en } from '@nuxt/ui/locale'

useHead({
  title: () => t('brand.name'),
  htmlAttrs: { lang: () => locale.value, dir: () => (isRtl.value ? 'rtl' : 'ltr') },
  meta: [{ name: 'description', content: () => t('brand.description') }],
})
</script>

<template>
  <UApp :locale="locale === 'ar' ? ar : en" :toaster="{ position: 'bottom-center' }">
    <ManagerPage />
  </UApp>
</template>
