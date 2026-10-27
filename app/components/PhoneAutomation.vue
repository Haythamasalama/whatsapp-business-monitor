<script setup lang="ts">
const props = defineProps<{ phone: string, data: PhoneSettings['automation'] }>()
const emit = defineEmits<{ changed: [] }>()

const { run, busy } = usePhoneAction(() => props.phone)

const welcome = ref(false)
const prompts = ref<string[]>([])
const commands = ref<{ command_name: string, command_description: string }[]>([])

watch(() => props.data.data, (value) => {
  welcome.value = value?.enable_welcome_message ?? false
  prompts.value = [...(value?.prompts ?? [])]
  commands.value = (value?.commands ?? []).map(command => ({ ...command }))
}, { immediate: true })

const input = computed<AutomationInput>(() => ({
  enable_welcome_message: welcome.value,
  prompts: prompts.value.map(prompt => prompt.trim()),
  commands: commands.value.map(command => ({ command_name: command.command_name.trim().replace(/^\//, ''), command_description: command.command_description.trim() })),
}))

const problems = computed(() => automationProblems(input.value).map(key => tOr(key, key)))

async function save(): Promise<void> {
  if (await run({ path: '/api/business/automation', body: { ...input.value }, confirm: t('business.automation.confirm'), done: t('business.automation.saved') })) {
    emit('changed')
  }
}
</script>

<template>
  <div class="space-y-5">
    <p class="text-sm text-muted">
      {{ t('business.automation.intro') }}
    </p>
    <UAlert v-if="data.error" color="error" variant="subtle" icon="i-lucide-circle-alert" :description="errorText(data.error)" />

    <USwitch v-model="welcome">
      <template #label>
        <FieldLabel :label="t('business.automation.welcome')" :hint="t('business.automation.welcomeHint')" />
      </template>
    </USwitch>

    <section class="space-y-2">
      <FieldLabel :label="t('business.automation.prompts')" :hint="t('business.automation.promptsHint')" class="text-sm font-medium text-default" />
      <div v-for="(_, index) in prompts" :key="index" class="flex gap-2">
        <UInput v-model="prompts[index]" :placeholder="t('business.automation.prompt', { n: index + 1 })" :maxlength="AUTOMATION_LIMITS.prompt" class="min-w-0 flex-1" dir="auto" />
        <UButton icon="i-lucide-x" color="neutral" variant="ghost" :aria-label="t('business.automation.remove')" @click="prompts.splice(index, 1)" />
      </div>
      <UButton
        v-if="prompts.length < AUTOMATION_LIMITS.prompts"
        :label="t('business.automation.addPrompt')"
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        size="sm"
        @click="prompts.push('')"
      />
    </section>

    <section class="space-y-2">
      <FieldLabel :label="t('business.automation.commands')" :hint="t('business.automation.commandsHint')" class="text-sm font-medium text-default" />
      <div v-for="(command, index) in commands" :key="index" class="flex flex-wrap gap-2 sm:flex-nowrap">
        <UInput v-model="command.command_name" :placeholder="t('business.automation.commandName')" :maxlength="AUTOMATION_LIMITS.command" class="w-full sm:w-40">
          <template #leading>
            <span class="text-dimmed">/</span>
          </template>
        </UInput>
        <UInput v-model="command.command_description" :placeholder="t('business.automation.commandHint')" :maxlength="AUTOMATION_LIMITS.hint" class="min-w-0 flex-1" dir="auto" />
        <UButton icon="i-lucide-x" color="neutral" variant="ghost" :aria-label="t('business.automation.remove')" @click="commands.splice(index, 1)" />
      </div>
      <UButton
        v-if="commands.length < AUTOMATION_LIMITS.commands"
        :label="t('business.automation.addCommand')"
        icon="i-lucide-plus"
        color="neutral"
        variant="outline"
        size="sm"
        @click="commands.push({ command_name: '', command_description: '' })"
      />
    </section>

    <ul v-if="problems.length" class="list-inside list-disc text-sm text-error">
      <li v-for="problem in problems" :key="problem">
        {{ problem }}
      </li>
    </ul>
    <UButton :label="t('business.automation.save')" icon="i-lucide-save" :loading="busy" :disabled="problems.length > 0" @click="save" />
  </div>
</template>
