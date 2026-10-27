<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })

const { appName } = useSession()
</script>

<template>
  <div class="flex items-center gap-3">
    <img src="/logo.svg" alt="" class="size-9 shrink-0 rounded-[10px]">
    <div v-if="!compact" class="min-w-0 leading-tight">
      <p class="leading-snug font-semibold text-balance text-highlighted">
        {{ appName }}
      </p>
    </div>
  </div>
</template>
