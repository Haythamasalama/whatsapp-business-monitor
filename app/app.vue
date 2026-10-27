<script setup lang="ts">
import { ar } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="ar" :toaster="{ position: 'bottom-center' }">
    <ManagerPage />
  </UApp>
</template>
