<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
  optional?: boolean
  media?: string | null
  buttons?: { text: string }[]
}>()

const model = defineModel<TemplateText>({ required: true })

const bodyInput = useTemplateRef<{ textareaRef?: HTMLTextAreaElement }>('bodyInput')
const vars = computed(() => placeholders(model.value.body))
const problems = computed(() => (props.optional && !model.value.body.trim() ? [] : templateProblems(model.value)))
const warnings = computed(() => (problems.value.length ? [] : templateWarnings(model.value)))
const showHeader = ref(Boolean(model.value.header))
const showFooter = ref(Boolean(model.value.footer))
const caret = ref<number | null>(null)
const varLabel = (n: number) => `{{${n}}}`

watch(() => vars.value.length, (length) => {
  const current = model.value.examples ?? []
  model.value.examples = Array.from({ length }, (_, i) => current[i] ?? '')
}, { immediate: true })

function addVariable(): void {
  const token = varLabel((vars.value.at(-1) ?? 0) + 1)
  const textarea = bodyInput.value?.textareaRef
  const body = model.value.body
  // The button takes the focus, so the cursor position comes from the textarea's last blur.
  const at = Math.min(caret.value ?? body.length, body.length)
  const before = body.slice(0, at)
  const spacer = before && !/\s$/.test(before) ? ' ' : ''

  model.value.body = `${before}${spacer}${token}${body.slice(at)}`
  caret.value = at + spacer.length + token.length

  nextTick(() => {
    textarea?.focus()
    textarea?.setSelectionRange(caret.value!, caret.value!)
  })
}

// Removing {{n}} renumbers the ones after it, so the body keeps running {{1}}..{{n}} as Meta requires.
function removeVariable(n: number): void {
  const index = vars.value.indexOf(n)
  const examples = model.value.examples.filter((_, i) => i !== index)

  model.value.body = model.value.body
    .replace(/\{\{\s*(\d+)\s*\}\}/g, (match, k) => {
      const value = Number(k)

      return value === n ? '' : value > n ? varLabel(value - 1) : match
    })
    .replace(/[ \t]{2,}/g, ' ')
  model.value.examples = examples
}

function removeHeader(): void {
  model.value.header = ''
  showHeader.value = false
}

function removeFooter(): void {
  model.value.footer = ''
  showFooter.value = false
}
</script>

<template>
  <div class="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
    <fieldset :disabled="disabled" class="grid min-w-0 content-start gap-4">
      <UFormField v-if="media" label="العنوان">
        <p class="text-sm text-muted">
          {{ media }}
        </p>
      </UFormField>
      <UFormField v-else-if="showHeader" label="العنوان">
        <template #hint>
          <UButton label="حذف" icon="i-lucide-x" color="neutral" variant="link" size="xs" class="p-0" @click="removeHeader" />
        </template>
        <UInput v-model="model.header" :dir="model.header ? 'auto' : undefined" maxlength="60" placeholder="حتى 60 حرفاً" class="w-full" />
      </UFormField>

      <UFormField label="نص الرسالة">
        <UTextarea
          ref="bodyInput"
          v-model="model.body"
          dir="auto"
          :rows="6"
          autoresize
          :placeholder="optional ? 'اتركه فارغاً لتخطّي هذه اللغة' : 'نص الرسالة'"
          class="w-full"
          :ui="{ base: '[unicode-bidi:plaintext] leading-7' }"
          @blur="(event: FocusEvent) => (caret = (event.target as HTMLTextAreaElement).selectionStart)"
        />
      </UFormField>

      <UFormField v-if="showFooter" label="التذييل">
        <template #hint>
          <UButton label="حذف" icon="i-lucide-x" color="neutral" variant="link" size="xs" class="p-0" @click="removeFooter" />
        </template>
        <UInput v-model="model.footer" :dir="model.footer ? 'auto' : undefined" maxlength="60" placeholder="حتى 60 حرفاً" class="w-full" />
      </UFormField>

      <div class="flex flex-wrap gap-2">
        <UButton label="متغير" icon="i-lucide-braces" color="neutral" variant="soft" size="xs" @click="addVariable" />
        <UButton v-if="!media && !showHeader" label="عنوان" icon="i-lucide-plus" color="neutral" variant="soft" size="xs" @click="showHeader = true" />
        <UButton v-if="!showFooter" label="تذييل" icon="i-lucide-plus" color="neutral" variant="soft" size="xs" @click="showFooter = true" />
      </div>

      <UFormField v-if="vars.length" label="قيم تجريبية">
        <div class="grid gap-2 sm:grid-cols-2">
          <div v-for="(n, i) in vars" :key="n" class="flex min-w-0 items-center gap-1.5">
            <span dir="ltr" class="w-11 shrink-0 rounded-md bg-elevated py-1.5 text-center font-mono text-xs text-toned">{{ varLabel(n) }}</span>
            <UInput v-model="model.examples[i]" :dir="model.examples[i] ? 'auto' : undefined" placeholder="قيمة مثال" class="min-w-0 flex-1" :aria-label="`قيمة ${varLabel(n)}`" />
            <UButton icon="i-lucide-x" color="neutral" variant="ghost" size="xs" :aria-label="`حذف ${varLabel(n)}`" @click="removeVariable(n)" />
          </div>
        </div>
      </UFormField>

      <p v-if="buttons?.length" class="text-sm text-muted">
        الأزرار ({{ buttons.length }}) تبقى كما هي.
      </p>

      <UAlert v-if="problems.length" color="error" variant="subtle" icon="i-lucide-circle-alert">
        <template #description>
          <ul class="list-inside list-disc space-y-0.5">
            <li v-for="problem in problems" :key="problem">
              {{ problem }}
            </li>
          </ul>
        </template>
      </UAlert>
      <UAlert v-else-if="warnings.length" color="warning" variant="subtle" icon="i-lucide-triangle-alert" :description="warnings.join(' ')" />
    </fieldset>

    <div class="min-w-0">
      <p class="mb-2 text-xs font-medium text-muted">
        المعاينة
      </p>
      <WhatsAppPreview :values="model" :media="media" :buttons="buttons" />
    </div>
  </div>
</template>
