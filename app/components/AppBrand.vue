<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>

<template>
  <div class="flex items-center gap-3">
    <img src="/logo.svg" alt="" class="size-9 shrink-0 rounded-[10px]">
    <div v-if="!compact" class="min-w-0 leading-tight">
      <p class="truncate font-semibold text-highlighted">
        مراقبة واتساب الأعمال
      </p>
    </div>
  </div>
</template>
