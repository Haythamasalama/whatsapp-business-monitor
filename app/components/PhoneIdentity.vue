<script setup lang="ts">
const props = defineProps<{ phone: PhoneDetails, username: PhoneSettings['username'] }>()
const emit = defineEmits<{ changed: [] }>()

const { run, busy } = usePhoneAction(() => props.phone.id)
const { api } = useManager()

// Display name: 10 changes in 30 days, each reviewed by Meta.
const newName = ref('')
const nameProblems = computed(() => (newName.value ? displayNameProblems(newName.value).map(key => tOr(key, key)) : []))
const nameStatus = computed(() => nameStatusOf(props.phone.name_status))

async function requestName(): Promise<void> {
  const name = newName.value.trim()

  if (await run({ path: '/api/business/display-name', body: { name }, confirm: t('business.name.confirm', { name }), done: t('business.name.sent') })) {
    newName.value = ''
    emit('changed')
  }
}

// Username: 2 changes in 14 days.
const newUsername = ref('')
const suggestions = ref<string[]>([])
const suggesting = ref(false)
const usernameProblemsList = computed(() => (newUsername.value ? usernameProblems(newUsername.value.trim().toLowerCase()).map(key => tOr(key, key)) : []))
const currentStatus = computed(() => props.username.data?.status)

async function suggest(): Promise<void> {
  suggesting.value = true

  try {
    suggestions.value = (await api<{ data: string[] }>(`/api/business/username-suggestions?phone=${props.phone.id}`)).data
  }
  catch (error) {
    useToast().add({ title: t('common.failed'), description: (error as Error).message, color: 'error' })
  }
  finally {
    suggesting.value = false
  }
}

async function setUsername(): Promise<void> {
  const name = newUsername.value.trim().toLowerCase()

  if (await run({ path: '/api/business/username', body: { username: name }, confirm: t('business.username.confirm', { name }), done: t('business.username.saved') })) {
    newUsername.value = ''
    emit('changed')
  }
}

// Green badge.
const obaStatus = computed(() => props.phone.official_business_account?.oba_status ?? (props.phone.is_official_business_account ? 'APPROVED' : undefined))
const oba = computed(() => obaOf(obaStatus.value))
const canRequest = computed(() => !props.phone.is_official_business_account && ['NOT_STARTED', 'REJECTED', undefined].includes(obaStatus.value))
const requesting = ref(false)
const obaForm = reactive({ website: '', country: '', language: locale.value, links: '', parent: '', extra: '' })

const obaInput = computed<ObaInput>(() => ({
  business_website_url: obaForm.website.trim(),
  primary_country_of_operation: obaForm.country.trim().toUpperCase(),
  primary_language: obaForm.language.trim(),
  supporting_links: obaForm.links.split('\n').map(line => line.trim()).filter(Boolean),
  parent_business_or_brand: obaForm.parent.trim(),
  additional_supporting_information: obaForm.extra.trim(),
}))

const obaProblemsList = computed(() => obaProblems(obaInput.value).map(key => tOr(key, key)))

async function requestBadge(): Promise<void> {
  if (await run({ path: '/api/business/oba', body: { ...obaInput.value }, confirm: t('business.oba.confirm'), done: t('business.oba.sent') })) {
    requesting.value = false
    emit('changed')
  }
}
</script>

<template>
  <div class="space-y-6">
    <section class="space-y-3">
      <h3 class="flex items-center gap-1.5 font-semibold text-highlighted">
        {{ t('business.name.title') }}
        <UTooltip :text="t('business.name.hint')">
          <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="t('business.name.hint')" />
        </UTooltip>
      </h3>
      <p class="flex flex-wrap items-center gap-2 text-sm">
        <span class="text-muted">{{ t('business.name.current') }}</span>
        <span class="font-medium text-highlighted">{{ phone.verified_name || '—' }}</span>
        <UBadge v-if="nameStatus" :color="nameStatus.tone" variant="subtle" :label="nameStatus.label" class="rounded-full" />
      </p>
      <UAlert
        v-if="phone.new_display_name && phone.new_name_status === 'PENDING_REVIEW'"
        color="warning"
        variant="subtle"
        icon="i-lucide-clock"
        :title="t('business.name.pending')"
        :description="phone.new_display_name"
      />
      <div class="flex flex-wrap items-start gap-2">
        <UInput v-model="newName" :placeholder="t('business.name.newName')" :maxlength="DISPLAY_NAME_MAX" class="min-w-0 flex-1" dir="auto" />
        <UButton :label="t('business.name.change')" icon="i-lucide-send" :loading="busy" :disabled="!newName.trim() || nameProblems.length > 0" @click="requestName" />
      </div>
      <p v-for="problem in nameProblems" :key="problem" class="text-sm text-error">
        {{ problem }}
      </p>
    </section>

    <USeparator />

    <section class="space-y-3">
      <h3 class="flex items-center gap-1.5 font-semibold text-highlighted">
        {{ t('business.username.title') }}
        <UTooltip :text="t('business.username.hint')">
          <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="t('business.username.hint')" />
        </UTooltip>
      </h3>
      <UAlert v-if="username.error" color="neutral" variant="subtle" icon="i-lucide-info" :description="errorText(username.error)" />
      <p v-else class="flex flex-wrap items-center gap-2 text-sm">
        <template v-if="username.data?.username">
          <bdi dir="ltr" class="font-mono font-medium text-highlighted">@{{ username.data.username }}</bdi>
          <UBadge v-if="currentStatus" color="neutral" variant="subtle" :label="tOr(`business.username.status.${currentStatus}`, currentStatus)" class="rounded-full" />
        </template>
        <span v-else class="text-muted">{{ t('business.username.none') }}</span>
      </p>
      <div class="flex flex-wrap items-start gap-2">
        <UInput v-model="newUsername" :placeholder="t('business.username.newName')" class="min-w-0 flex-1">
          <template #leading>
            <span class="text-dimmed">@</span>
          </template>
        </UInput>
        <UButton :label="t('business.username.suggest')" icon="i-lucide-sparkles" color="neutral" variant="outline" :loading="suggesting" @click="suggest" />
        <UButton :label="t('business.username.set')" icon="i-lucide-at-sign" :loading="busy" :disabled="!newUsername.trim() || usernameProblemsList.length > 0" @click="setUsername" />
      </div>
      <p v-for="problem in usernameProblemsList" :key="problem" class="text-sm text-error">
        {{ problem }}
      </p>
      <div v-if="suggestions.length" class="flex flex-wrap items-center gap-1.5">
        <span class="text-xs text-muted">{{ t('business.username.suggestions') }}</span>
        <UButton v-for="name in suggestions" :key="name" :label="`@${name}`" color="neutral" variant="soft" size="xs" class="font-mono" @click="newUsername = name" />
      </div>
    </section>

    <USeparator />

    <section class="space-y-3">
      <h3 class="flex items-center gap-1.5 font-semibold text-highlighted">
        {{ t('business.oba.title') }}
        <UTooltip :text="t('business.oba.hint')">
          <UIcon name="i-lucide-info" class="size-3.5 text-dimmed" :aria-label="t('business.oba.hint')" />
        </UTooltip>
      </h3>
      <p class="flex items-center gap-2 text-sm">
        <UIcon v-if="phone.is_official_business_account" name="i-lucide-badge-check" class="size-5 text-success" />
        <span class="text-toned">{{ phone.is_official_business_account ? t('business.oba.has') : t('business.oba.none') }}</span>
        <UBadge v-if="oba && !phone.is_official_business_account" :color="oba.tone" variant="subtle" :label="oba.label" class="rounded-full" />
      </p>

      <template v-if="canRequest">
        <div class="rounded-lg border border-default bg-muted p-3 text-sm">
          <p class="font-medium text-toned">
            {{ t('business.oba.needs') }}
          </p>
          <ul class="mt-1.5 list-inside list-disc space-y-0.5 text-muted">
            <li>{{ t('business.oba.need1') }}</li>
            <li>{{ t('business.oba.need2') }}</li>
            <li>{{ t('business.oba.need3') }}</li>
            <li>{{ t('business.oba.need4') }}</li>
            <li>{{ t('business.oba.need5') }}</li>
          </ul>
        </div>

        <UButton v-if="!requesting" :label="t('business.oba.request')" icon="i-lucide-badge-check" color="neutral" variant="outline" @click="requesting = true" />

        <div v-else class="space-y-3">
          <UFormField :label="t('business.oba.website')">
            <UInput v-model="obaForm.website" placeholder="https://" class="w-full" />
          </UFormField>
          <div class="grid gap-3 sm:grid-cols-2">
            <UFormField :label="t('business.oba.country')">
              <UInput v-model="obaForm.country" maxlength="2" class="w-full" />
            </UFormField>
            <UFormField :label="t('business.oba.language')">
              <UInput v-model="obaForm.language" class="w-full" />
            </UFormField>
          </div>
          <UFormField>
            <template #label>
              <FieldLabel :label="t('business.oba.links')" :hint="t('business.oba.linksHint')" />
            </template>
            <UTextarea v-model="obaForm.links" :rows="5" class="w-full" placeholder="https://" />
          </UFormField>
          <UFormField :label="t('business.oba.parent')">
            <UInput v-model="obaForm.parent" class="w-full" />
          </UFormField>
          <UFormField :label="t('business.oba.extra')">
            <UTextarea v-model="obaForm.extra" :rows="2" :maxlength="1000" class="w-full" dir="auto" />
          </UFormField>
          <ul v-if="obaProblemsList.length" class="list-inside list-disc text-sm text-error">
            <li v-for="problem in obaProblemsList" :key="problem">
              {{ problem }}
            </li>
          </ul>
          <div class="flex gap-2">
            <UButton :label="t('business.oba.request')" icon="i-lucide-send" :loading="busy" :disabled="obaProblemsList.length > 0" @click="requestBadge" />
            <UButton :label="t('common.cancel')" color="neutral" variant="ghost" @click="requesting = false" />
          </div>
        </div>
      </template>
    </section>
  </div>
</template>
