<script setup lang="ts">
defineProps<{ title: string, subtitle?: string }>()
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-4">
    <div class="w-full max-w-md space-y-6 rounded-2xl border border-default bg-default p-6 sm:p-8">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="/logo.svg" alt="" class="size-11 shrink-0 rounded-xl">
          <div>
            <h1 class="text-lg font-bold text-highlighted">
              {{ title }}
            </h1>
            <p v-if="subtitle" class="text-sm text-muted">
              {{ subtitle }}
            </p>
          </div>
        </div>
        <UButton
          :label="locale === 'ar' ? 'EN' : 'AR'"
          color="neutral"
          variant="ghost"
          size="sm"
          class="font-mono font-semibold"
          :aria-label="t('header.language')"
          @click="setLocale(locale === 'ar' ? 'en' : 'ar')"
        />
      </div>
      <slot />
    </div>
    <AppFooter />
  </div>
</template>
