<script setup lang="ts">
const props = defineProps<{ text: string }>()

const copy = useCopy()
const variable = (n: string) => `{{${n}}}`

type Line
  = | { kind: 'separator' }
    | { kind: 'key', label: string, value: string }
    | { kind: 'example', n: string, value: string }
    | { kind: 'text', parts: { variable: boolean, value: string }[] }

// The same text that gets copied, drawn as a card: labels dimmed, variables highlighted, each line in its own direction.
const lines = computed<Line[]>(() => props.text.split('\n').map((line) => {
  const trimmed = line.trim()
  const key = trimmed.match(KEY_LINE)
  const example = trimmed.match(EXAMPLE_LINE)

  if (trimmed === SEPARATOR) {
    return { kind: 'separator' }
  }

  if (key) {
    return { kind: 'key', label: key[1]!, value: key[2]! }
  }

  if (example) {
    return { kind: 'example', n: example[1]!, value: example[2]! }
  }

  return { kind: 'text', parts: line.split(/(\{\{\s*\d+\s*\}\})/).filter(Boolean).map(value => ({ variable: /^\{\{/.test(value), value })) }
}))
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-default">
    <div class="flex items-center justify-between gap-2 border-b border-default bg-muted px-3 py-1.5">
      <UTooltip text="الصقه في «إنشاء أو تحديث من نص» لعمل قالب مثله">
        <span class="text-xs font-medium text-toned">نص القالب</span>
      </UTooltip>
      <UButton label="نسخ" icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" @click="copy(text)" />
    </div>

    <div class="max-h-80 space-y-0.5 overflow-auto px-3 py-2.5 text-sm leading-7">
      <template v-for="(line, index) in lines" :key="index">
        <hr v-if="line.kind === 'separator'" class="my-2 border-default">
        <p v-else-if="line.kind === 'key'" dir="auto" class="flex flex-wrap items-baseline gap-1.5">
          <span class="text-xs text-muted">{{ line.label }}</span>
          <span class="font-medium text-highlighted">{{ line.value }}</span>
        </p>
        <p v-else-if="line.kind === 'example'" class="flex items-center gap-2 text-xs">
          <code dir="ltr" class="rounded bg-elevated px-1.5 py-0.5 font-mono text-toned">{{ variable(line.n) }}</code>
          <span dir="auto" class="text-highlighted">{{ line.value }}</span>
        </p>
        <div v-else-if="!line.parts.length" class="h-2" />
        <p v-else dir="auto" class="text-default">
          <template v-for="(part, i) in line.parts" :key="i">
            <bdi v-if="part.variable" dir="ltr" class="rounded bg-primary/12 px-1 font-mono text-xs text-highlighted">{{ part.value }}</bdi>
            <template v-else>
              {{ part.value }}
            </template>
          </template>
        </p>
      </template>
    </div>
  </div>
</template>
