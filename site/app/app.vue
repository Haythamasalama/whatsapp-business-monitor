<script setup lang="ts">
import { ar, en } from '@nuxt/ui/locale'

const { lang } = useLang()
</script>

<template>
  <UApp :locale="lang === 'ar' ? ar : en">
    <NuxtPage />
  </UApp>
</template>
