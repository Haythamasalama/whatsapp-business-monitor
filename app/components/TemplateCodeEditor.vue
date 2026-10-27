<script setup lang="ts">
const doc = defineModel<TemplateDoc>({ required: true })

const copy = useCopy()
// The text is only built once: rewriting it on every change would move the cursor while typing.
const text = ref(toText([doc.value]))

const languages = computed(() => sortLanguages(Object.keys(doc.value.languages)).filter(code => doc.value.languages[code]!.body.trim()))

watch(text, (value) => {
  const [parsed] = fromText(value)

  if (parsed) {
    doc.value = parsed
  }
})
</script>

<template>
  <div class="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
    <div class="min-w-0 space-y-2">
      <div class="flex items-center justify-between gap-2">
        <p class="text-xs text-muted">
          الصق محتوى قالب أو عدّله هنا
        </p>
        <UButton label="نسخ المحتوى" icon="i-lucide-copy" color="neutral" variant="ghost" size="xs" @click="copy(text)" />
      </div>
      <UTextarea
        v-model="text"
        dir="auto"
        :rows="14"
        autoresize
        spellcheck="false"
        class="w-full"
        :ui="{ base: '[unicode-bidi:plaintext] leading-7' }"
      />
    </div>

    <div class="min-w-0 space-y-3">
      <p class="text-xs font-medium text-muted">
        المعاينة
      </p>
      <div v-for="code in languages" :key="code" class="space-y-1">
        <p class="text-xs text-muted">
          {{ languageName(code) }}
        </p>
        <WhatsAppPreview :values="doc.languages[code]!" />
      </div>
      <p v-if="!languages.length" class="text-sm text-muted">
        لا يوجد نص بعد
      </p>
    </div>
  </div>
</template>
