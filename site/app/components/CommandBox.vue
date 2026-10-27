<script setup lang="ts">
const props = defineProps<{ command: string }>()

const { text } = useLang()
const copied = ref(false)
let timer: ReturnType<typeof setTimeout> | undefined

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.command)
    copied.value = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied.value = false), 2000)
  }
  catch {
    copied.value = false
  }
}
</script>

<template>
  <div class="flex items-start gap-2 rounded-lg border border-default bg-muted py-1.5 ps-4 pe-1.5">
    <pre dir="ltr" class="min-w-0 flex-1 py-1.5 text-start font-mono text-[13px] leading-6 break-all whitespace-pre-wrap text-highlighted"><code>{{ command }}</code></pre>
    <UButton
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      :color="copied ? 'success' : 'neutral'"
      variant="ghost"
      :aria-label="copied ? text.install.copied : text.install.copy"
      @click="copy"
    />
  </div>
</template>
