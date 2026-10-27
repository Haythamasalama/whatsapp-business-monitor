<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  optional?: boolean
  collapsible?: boolean
  media?: string | null
  buttons?: { text: string }[]
}>()

const model = defineModel<TemplateText>({ required: true })

const vars = computed(() => placeholders(model.value.body))
const problems = computed(() => (props.optional && !model.value.body.trim() ? [] : templateProblems(model.value)))
const showExtras = ref(!props.collapsible || Boolean(model.value.header || model.value.footer))
const varLabel = (n: number) => `{{${n}}}`

watch(() => vars.value.length, (length) => {
  const current = model.value.examples ?? []
  model.value.examples = Array.from({ length }, (_, i) => current[i] ?? '')
}, { immediate: true })
</script>

<template>
  <div class="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
    <fieldset :disabled="disabled" class="grid min-w-0 content-start gap-4">
      <UFormField label="نص الرسالة">
        <UTextarea
          v-model="model.body"
          dir="auto"
          :rows="6"
          autoresize
          :placeholder="optional ? 'اتركه فارغاً لتخطّي هذه اللغة' : 'المتغيرات بالشكل {{1}}'"
          class="w-full"
          :ui="{ base: '[unicode-bidi:plaintext] leading-7' }"
        />
      </UFormField>

      <UButton
        v-if="!showExtras"
        label="إضافة عنوان أو تذييل"
        icon="i-lucide-plus"
        color="neutral"
        variant="link"
        class="justify-self-start px-0"
        @click="showExtras = true"
      />

      <div v-else class="grid gap-4 sm:grid-cols-2">
        <UFormField v-if="!media" label="العنوان">
          <UInput v-model="model.header" dir="auto" maxlength="60" placeholder="اختياري" class="w-full" />
        </UFormField>
        <p v-else class="text-sm text-muted">
          العنوان: {{ media }}
        </p>
        <UFormField label="التذييل">
          <UInput v-model="model.footer" dir="auto" maxlength="60" placeholder="اختياري" class="w-full" />
        </UFormField>
      </div>

      <UFormField v-if="vars.length" label="قيم تجريبية">
        <div class="grid gap-2 sm:grid-cols-2">
          <label v-for="(n, i) in vars" :key="n" class="flex min-w-0 items-center gap-2">
            <span dir="ltr" class="w-11 shrink-0 rounded-md bg-elevated py-1.5 text-center font-mono text-xs text-toned">{{ varLabel(n) }}</span>
            <UInput v-model="model.examples[i]" dir="auto" placeholder="قيمة مثال" class="min-w-0 flex-1" :aria-label="`قيمة ${varLabel(n)}`" />
          </label>
        </div>
      </UFormField>

      <UAlert v-if="problems.length" color="error" variant="subtle" icon="i-lucide-circle-alert">
        <template #description>
          <ul class="list-inside list-disc space-y-0.5">
            <li v-for="problem in problems" :key="problem">
              {{ problem }}
            </li>
          </ul>
        </template>
      </UAlert>
    </fieldset>

    <div class="min-w-0">
      <p class="mb-2 text-xs font-medium text-muted">
        المعاينة
      </p>
      <WhatsAppPreview :values="model" :media="media" :buttons="buttons" />
    </div>
  </div>
</template>
