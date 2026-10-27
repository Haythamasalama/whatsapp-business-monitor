<script setup lang="ts">
const props = defineProps<{ ids: string[] }>()

const open = defineModel<boolean>('open', { default: false })

const { accounts, accountId, templates } = useManager()
const { run, busy } = useTemplateAction()

const target = ref<string>()
const chosen = ref<string[]>([])
const result = ref<TemplateActionResult | null>(null)

const targets = computed(() => accounts.value.filter(account => account.id !== accountId.value).map(account => ({ label: account.name || account.label, value: account.id })))
const copyable = computed(() => templates.value.filter(canCopyTemplate))
const nameOf = (id: string) => {
  const template = templates.value.find(entry => entry.id === id)

  return template ? `${template.name} · ${languageCode(template.language)}` : id
}

watch(open, (value) => {
  if (value) {
    chosen.value = props.ids.filter(id => copyable.value.some(entry => entry.id === id))
    target.value = targets.value[0]?.value
    result.value = null
  }
})

function toggle(id: string, on: boolean | 'indeterminate'): void {
  chosen.value = on === true ? [...chosen.value, id] : chosen.value.filter(value => value !== id)
}

async function copy(): Promise<void> {
  const account = targets.value.find(entry => entry.value === target.value)

  if (!account || !chosen.value.length) {
    return
  }

  result.value = await run<TemplateActionResult>({
    path: '/api/templates/copy',
    body: { to: account.value, ids: chosen.value },
    confirm: t('templateActions.copyConfirm', { n: chosen.value.length, account: account.label }),
    confirmLabel: t('templateActions.copyRun'),
    done: copied => t('templateActions.results', { done: copied.done.length, failed: copied.failed.length }),
  })
}
</script>

<template>
  <UModal v-model:open="open" :title="t('templateActions.copyTitle')" :description="t('templateActions.copyIntro')">
    <template #body>
      <div v-if="result" class="space-y-3">
        <p class="text-sm text-highlighted">
          {{ t('templateActions.results', { done: result.done.length, failed: result.failed.length }) }}
        </p>
        <ul class="space-y-1.5 text-sm">
          <li v-for="id in result.done" :key="id" class="flex items-center gap-2">
            <UIcon name="i-lucide-circle-check" class="size-4 shrink-0 text-success" />
            <bdi dir="ltr" class="font-mono">{{ nameOf(id) }}</bdi>
            <span class="text-muted">{{ t('templateActions.copied') }}</span>
          </li>
          <li v-for="entry in result.failed" :key="entry.id" class="flex items-start gap-2">
            <UIcon name="i-lucide-circle-x" class="mt-0.5 size-4 shrink-0 text-error" />
            <span>
              <bdi dir="ltr" class="font-mono">{{ nameOf(entry.id) }}</bdi>
              <span class="block text-xs text-muted">{{ t('templateActions.copyFailed') }}<template v-if="entry.reason">: <bdi dir="ltr">{{ entry.reason }}</bdi></template></span>
            </span>
          </li>
        </ul>
      </div>

      <div v-else class="space-y-4">
        <UAlert v-if="!targets.length" color="warning" variant="subtle" icon="i-lucide-info" :description="t('templateActions.copyNoAccounts')" />
        <UFormField v-else :label="t('templateActions.copyTo')">
          <USelect v-model="target" :items="targets" class="w-full" />
        </UFormField>

        <UFormField :label="t('templateActions.copyChoose')">
          <p v-if="!copyable.length" class="text-sm text-muted">
            {{ t('templateActions.copyNone') }}
          </p>
          <ul v-else class="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-default p-2">
            <li v-for="template in copyable" :key="template.id">
              <UCheckbox
                :model-value="chosen.includes(template.id)"
                :ui="{ root: 'rounded-lg px-2 py-1.5 hover:bg-muted' }"
                @update:model-value="value => toggle(template.id, value)"
              >
                <template #label>
                  <bdi dir="ltr" class="font-mono text-sm">{{ template.name }}</bdi>
                  <span class="ms-2 font-mono text-xs text-muted">{{ languageCode(template.language) }}</span>
                </template>
              </UCheckbox>
            </li>
          </ul>
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton :label="t('common.close')" color="neutral" variant="outline" @click="open = false" />
        <UButton
          v-if="!result"
          :label="t('templateActions.copyRun')"
          icon="i-lucide-copy-plus"
          :loading="busy"
          :disabled="!target || !chosen.length || chosen.length > TEMPLATE_COPY_MAX"
          @click="copy"
        />
      </div>
    </template>
  </UModal>
</template>
