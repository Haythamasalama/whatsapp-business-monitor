<script setup lang="ts">
const props = defineProps<{
  values: TemplateText
  media?: string | null
  buttons?: { text: string }[]
}>()

const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]!)

function format(text: string): string {
  const filled = fillPlaceholders(escape(text), n =>
    `<bdi class="rounded-sm bg-primary/12 px-0.5 text-highlighted">${escape(props.values.examples?.[n - 1] || `{{${n}}}`)}</bdi>`)

  return filled
    .replace(/\*([^*\n]+)\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)_([^_\n]+)_/g, '$1<em>$2</em>')
    .replace(/~([^~\n]+)~/g, '<s>$1</s>')
}

// WhatsApp picks the direction per paragraph, so an Arabic line and an English line each keep their own.
const lines = computed(() => props.values.body.split('\n').map(line => (line.trim() ? format(line) : '')))

const time = computed(() => timeOfDay(new Date()))
</script>

<template>
  <div class="rounded-xl bg-[#efeae2] p-4 dark:bg-[#0b141a]">
    <div class="rounded-lg rounded-se-none bg-white px-3 pt-2 pb-1.5 text-sm leading-relaxed text-default shadow-xs [overflow-wrap:anywhere] dark:bg-[#202c33]">
      <div v-if="media" class="mb-2 rounded-md bg-elevated py-5 text-center text-xs text-muted">
        {{ media }}
      </div>
      <!-- format() escapes the text before it adds the formatting tags, so v-html only ever sees our own markup. -->
      <div v-if="values.header" dir="auto" class="mb-1 font-bold" v-html="format(values.header)" />
      <template v-if="values.body.trim()">
        <div v-for="(line, index) in lines" :key="index" dir="auto" :class="line ? '' : 'h-[1lh]'" v-html="line" />
      </template>
      <div v-else class="text-muted">
        …
      </div>
      <div v-if="values.footer" dir="auto" class="mt-1.5 text-xs text-muted">
        {{ values.footer }}
      </div>
      <div class="mt-0.5 text-end text-[11px] text-muted">
        {{ time }}
      </div>
      <div
        v-for="button in buttons"
        :key="button.text"
        dir="auto"
        class="mt-1.5 border-t border-default pt-1.5 text-center text-[13px] text-info"
      >
        {{ button.text }}
      </div>
    </div>
  </div>
</template>
