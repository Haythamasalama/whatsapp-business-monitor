<script setup lang="ts">
const { version } = useRuntimeConfig().public
const { api } = useManager()

const update = ref<Release | null>(null)
const autoUpdate = ref(false)

onMounted(async () => {
  try {
    const info = await api<VersionInfo>('/api/version', { scoped: false })

    update.value = info.latest
    autoUpdate.value = info.autoUpdate
  }
  catch {
    // The footer simply shows no update when the check fails.
  }
})
</script>

<template>
  <footer class="flex justify-center py-1">
    <div class="inline-flex items-center gap-2.5 rounded-full border border-default bg-default py-1.5 ps-3.5 pe-3 text-xs text-muted">
      <span>
        {{ t('footer.madeBy') }}
        <a
          href="https://haythamasalama.me"
          target="_blank"
          rel="noopener"
          class="font-semibold text-highlighted underline-offset-4 transition-colors hover:text-primary hover:underline"
        >Haytham A. Salama</a>
      </span>

      <span class="h-3.5 w-px bg-(--ui-border-accented)" aria-hidden="true" />

      <a
        href="https://github.com/Haythamasalama/whatsapp-business-monitor/releases"
        target="_blank"
        rel="noopener"
        class="font-mono text-toned transition-colors hover:text-highlighted"
        :title="t('footer.releases')"
      >v{{ version }}</a>

      <UTooltip v-if="update" :text="autoUpdate ? t('footer.updateAuto') : t('footer.updateHint')">
        <UButton
          :to="update.url"
          target="_blank"
          external
          :label="t('footer.update', { version: update.version })"
          icon="i-lucide-arrow-up-circle"
          color="primary"
          variant="soft"
          size="xs"
          class="rounded-full"
        />
      </UTooltip>

      <a
        href="https://github.com/Haythamasalama/whatsapp-business-monitor"
        target="_blank"
        rel="noopener"
        class="inline-flex items-center text-toned transition-colors hover:text-highlighted"
        :aria-label="t('footer.github')"
        title="GitHub"
      >
        <!-- GitHub's mark, inline so the footer needs no extra icon set. -->
        <svg viewBox="0 0 16 16" class="size-4" aria-hidden="true" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
    </div>
  </footer>
</template>
